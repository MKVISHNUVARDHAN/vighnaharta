"""
Generate synthesized 16-bit 44.1kHz PCM WAV sound effects for Path of Light:
- ak47_shot.wav (crisp rapid gunfire)
- flame_loop.wav (roaring combustive flamethrower)
- shotgun_blast.wav (heavy explosive shotgun boom)
- rocket_launch.wav (missile rocket propulsion whoosh)
- rocket_boom.wav (colossal thunderous detonation)
- rath_grind.wav (ominous screeching iron wheels and stone grind)
- alarm_pulse.wav (urgent heartbeat and panic klaxon)
"""
import os
import wave
import struct
import math
import random

SAMPLE_RATE = 44100

def clamp(val, low=-1.0, high=1.0):
    return max(low, min(high, val))

def write_wav(filepath, samples):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with wave.open(filepath, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        data = bytearray()
        for s in samples:
            s_clamped = int(clamp(s) * 32767.0)
            data.extend(struct.pack('<h', s_clamped))
        w.writeframes(data)
    print(f"Generated: {filepath} ({len(samples)} samples, {len(samples)/SAMPLE_RATE:.2f}s)")

def gen_ak47_shot():
    duration = 0.16
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Envelope: very steep attack, exponential decay
        env = math.exp(-t * 28.0)
        # Punch: low frequency drop 140Hz -> 60Hz
        freq = 140.0 * math.exp(-t * 18.0) + 60.0
        punch = math.sin(2.0 * math.pi * freq * t)
        # Muzzle noise: shaped white noise with high-frequency snap
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 45.0)
        # Mechanical bolt click at t=0.035s
        mech = 0.0
        if 0.030 <= t <= 0.060:
            mt = t - 0.030
            mech = math.sin(2.0 * math.pi * 950.0 * mt) * math.exp(-mt * 90.0) * 0.4
        
        sig = (punch * 0.55 + noise * 0.65 + mech) * env
        samples.append(clamp(sig * 1.5))
    return samples

def gen_flame_loop():
    duration = 0.40
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    low_noise = 0.0
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Low-pass filtered noise for combustive roar
        raw_noise = random.random() * 2.0 - 1.0
        low_noise = low_noise * 0.92 + raw_noise * 0.08
        # Rumble sine 55Hz
        rumble = math.sin(2.0 * math.pi * 58.0 * t + low_noise * 2.0)
        # Crackle pops
        pop = 0.0
        if random.random() < 0.015:
            pop = (random.random() * 2.0 - 1.0) * 0.7
        # Smooth envelope at boundaries
        fade_in = min(1.0, t / 0.04)
        fade_out = min(1.0, (duration - t) / 0.06)
        sig = (low_noise * 0.6 + rumble * 0.35 + pop) * fade_in * fade_out
        samples.append(clamp(sig * 1.3))
    return samples

def gen_shotgun_blast():
    duration = 0.32
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 14.0)
        # Sub bass drop 90Hz -> 35Hz
        freq = 90.0 * math.exp(-t * 12.0) + 35.0
        bass = math.sin(2.0 * math.pi * freq * t)
        # Massive explosive noise
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 22.0)
        # Pump slide sound at t=0.20
        pump = 0.0
        if 0.18 <= t <= 0.28:
            pt = t - 0.18
            pump = math.sin(2.0 * math.pi * 600.0 * pt) * math.exp(-pt * 30.0) * 0.3
        sig = (bass * 0.7 + noise * 0.8 + pump) * env
        samples.append(clamp(sig * 1.6))
    return samples

def gen_rocket_launch():
    duration = 0.38
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Ascending whistle 120Hz -> 420Hz
        freq = 120.0 + (t / duration) * 300.0
        whistle = math.sin(2.0 * math.pi * freq * t)
        # Jet noise
        noise = (random.random() * 2.0 - 1.0) * 0.4
        env = math.sin(math.pi * (t / duration)) ** 0.6
        sig = (whistle * 0.5 + noise * 0.5) * env
        samples.append(clamp(sig * 1.4))
    return samples

def gen_rocket_boom():
    duration = 0.75
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 6.5)
        # Deep ground rumbling bass
        freq = 65.0 * math.exp(-t * 4.0) + 25.0
        sub = math.sin(2.0 * math.pi * freq * t)
        # Massive distorted impact noise
        raw_noise = random.random() * 2.0 - 1.0
        noise = raw_noise * math.exp(-t * 10.0)
        sig = (sub * 0.7 + noise * 0.75) * env
        # Slight soft saturation / distortion
        sig = math.tanh(sig * 1.5)
        samples.append(clamp(sig * 1.4))
    return samples

def gen_rath_grind():
    duration = 0.55
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Heavy screeching metal / stone friction
        screech1 = math.sin(2.0 * math.pi * (920.0 + 120.0 * math.sin(t * 45.0)) * t)
        screech2 = math.sin(2.0 * math.pi * (1350.0 + 180.0 * math.cos(t * 33.0)) * t)
        # Low rumbling wagon roll 45Hz
        wagon = math.sin(2.0 * math.pi * 45.0 * t) * (1.0 + 0.3 * math.sin(t * 22.0))
        noise = (random.random() * 2.0 - 1.0) * 0.35
        fade = min(1.0, t / 0.05) * min(1.0, (duration - t) / 0.08)
        sig = (screech1 * 0.35 + screech2 * 0.25 + wagon * 0.5 + noise) * fade
        samples.append(clamp(sig * 1.2))
    return samples

def gen_alarm_pulse():
    duration = 0.28
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Ominous dual brass horn 280Hz + 330Hz
        horn = math.sin(2.0 * math.pi * 280.0 * t) * 0.4 + math.sin(2.0 * math.pi * 335.0 * t) * 0.4
        # Heartbeat thump 65Hz
        heart = math.sin(2.0 * math.pi * 65.0 * t) * math.exp(-t * 18.0) * 0.7
        env = math.exp(-t * 8.0)
        sig = (horn * 0.5 + heart) * env
        samples.append(clamp(sig * 1.3))
    return samples

def main():
    dest_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "public", "assets", "audio", "weapons"))
    print(f"Generating weapon audio into: {dest_dir}")
    
    write_wav(os.path.join(dest_dir, "ak47_shot.wav"), gen_ak47_shot())
    write_wav(os.path.join(dest_dir, "flame_loop.wav"), gen_flame_loop())
    write_wav(os.path.join(dest_dir, "shotgun_blast.wav"), gen_shotgun_blast())
    write_wav(os.path.join(dest_dir, "rocket_launch.wav"), gen_rocket_launch())
    write_wav(os.path.join(dest_dir, "rocket_boom.wav"), gen_rocket_boom())
    write_wav(os.path.join(dest_dir, "rath_grind.wav"), gen_rath_grind())
    write_wav(os.path.join(dest_dir, "alarm_pulse.wav"), gen_alarm_pulse())
    print("All weapon audio generated successfully!")

if __name__ == '__main__':
    main()
