const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
class Element {
  constructor(dataset = {}) { this.dataset = dataset; this.listeners = {}; this.hidden = true; this.classes = new Set(); this.classList = {add: x => this.classes.add(x), remove: x => this.classes.delete(x)}; }
  addEventListener(name, fn) { (this.listeners[name] ??= []).push(fn); }
  fire(name, extra = {}) { for (const fn of this.listeners[name] ?? []) fn({currentTarget:this, preventDefault(){}, stopPropagation(){}, ...extra}); }
  setPointerCapture() {}
  setAttribute(name, value) { this[name] = value; }
  blur() {}
}
function setup() {
  const left = new Element({hold:'KeyA'}), tail = new Element({hold:'ShiftLeft'}), play = new Element({tap:'Enter'});
  const help = new Element(), toggle = new Element(), document = new Element(), window = new Element(), events = [];
  document.querySelectorAll = selector => selector === '[data-hold]' ? [left, tail] : [play];
  document.getElementById = id => id === 'controls-help' ? help : toggle;
  document.dispatchEvent = event => events.push(event);
  class KeyboardEvent { constructor(type, values) { Object.assign(this, {type}, values); } }
  vm.runInNewContext(fs.readFileSync(__dirname + '/vighnaharta.js', 'utf8'), {document, window, KeyboardEvent});
  return {left, tail, play, help, toggle, document, window, events};
}
test('two fingers steer and tether independently; cancellation releases only its key', () => {
  const s = setup();
  s.left.fire('pointerdown', {pointerId:1}); s.tail.fire('pointerdown', {pointerId:2});
  s.tail.fire('pointercancel', {pointerId:2});
  assert.deepEqual(s.events.map(e => [e.type,e.keyCode]), [['keydown',65],['keydown',16],['keyup',16]]);
  assert.equal(s.left.classes.has('held'), true);
  s.left.fire('lostpointercapture', {pointerId:1});
  assert.equal(s.events.at(-1).keyCode, 65);
  assert.equal(s.events.at(-1).type, 'keyup');
});
test('focus loss releases Tail and directional input, with no stuck highlight', () => {
  const s = setup(); s.tail.fire('pointerdown', {pointerId:4}); s.window.fire('blur');
  assert.equal(s.tail.classes.size, 0);
  for (const keyCode of [16,65,68,87,83,32]) assert.ok(s.events.some(e => e.keyCode === keyCode && e.type === 'keyup'));
});
test('Play emits a complete Enter press and controls panel exposes its state', () => {
  const s = setup(); s.play.fire('click');
  assert.deepEqual(s.events.map(e => [e.type,e.keyCode]), [['keydown',13],['keyup',13]]);
  s.toggle.fire('click'); assert.equal(s.help.hidden,false); assert.equal(s.toggle['aria-expanded'],'true');
});
