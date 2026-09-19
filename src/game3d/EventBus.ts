// ── Lightweight typed event emitter ──
// Bridges React UI ↔ R3F 3D scene
type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private listeners = new Map<string, Set<EventCallback>>();

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach((cb) => {
      try { cb(...args); } catch (e) { console.error(`EventBus error [${event}]:`, e); }
    });
  }

  once(event: string, callback: EventCallback): void {
    const wrapper = (...args: any[]) => {
      this.off(event, wrapper);
      callback(...args);
    };
    this.on(event, wrapper);
  }

  removeAll(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const EventBus = new EventEmitter();
