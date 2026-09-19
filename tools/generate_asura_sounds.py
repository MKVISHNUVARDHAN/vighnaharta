"""
generate_asura_sounds.py
Synthesizes mythological sound effects for Asuras and Divine God Weapons:
- asura_growl.wav (guttural menacing demon roar)
- asura_death.wav (demonic shriek and soul banishment hiss)
- astra_vajra.wav (crackling celestial thunderbolt blast)
- astra_trishul.wav (Lord Shiva's sacred trident energy surge)
- astra_chakra.wav (whirring sacred Sudarshana solar disc hum)
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

def gen_asura_growl():
    duration = 0.65
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * (t / duration)) ** 0.8
        # Deep guttural modulated saw + noise
        base_f = 68.0 + 22.0 * math.sin(2.0 * math.pi * 7.5 * t)
        voice1 = math.sin(2.0 * math.pi * base_f * t)
        voice2 = math.sin(2.0 * math.pi * (base_f * 2.05) * t) * 0.45
        voice3 = math.sin(2.0 * math.pi * (base_f * 3.1) * t) * 0.3
        growl_noise = (random.random() * 2.0 - 1.0) * 0.35 * math.sin(2.0 * math.pi * 32.0 * t)
        sig = (voice1 + voice2 + voice3 + growl_noise) * env * 1.4
        samples.append(clamp(sig))
    return samples

def gen_asura_death():
    duration = 0.50
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 7.0)
        # Shriek dropping in pitch from 680Hz to 110Hz
        freq = 680.0 * math.exp(-t * 8.0) + 95.0
        shriek = math.sin(2.0 * math.pi * freq * t + math.sin(2.0 * math.pi * 45.0 * t) * 1.5)
        # Dissolution dark hiss
        hiss = (random.random() * 2.0 - 1.0) * math.exp(-t * 5.0) * 0.55
        sig = (shriek * 0.65 + hiss * 0.6) * env * 1.5
        samples.append(clamp(sig))
    return samples

def gen_astra_vajra():
    duration = 0.22
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 22.0)
        # Lightning snap + deep thunder sub-kick
        snap = (random.random() * 2.0 - 1.0) * math.exp(-t * 35.0)
        zap = math.sin(2.0 * math.pi * (880.0 * math.exp(-t * 18.0) + 120.0) * t)
        sub = math.sin(2.0 * math.pi * (160.0 * math.exp(-t * 12.0) + 55.0) * t)
        sig = (snap * 0.7 + zap * 0.5 + sub * 0.5) * env * 1.6
        samples.append(clamp(sig))
    return samples

def gen_astra_trishul():
    duration = 0.45
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 6.5)
        # Resonating sacred trident chime + energy wall blast
        chime1 = math.sin(2.0 * math.pi * 528.0 * t) # Solfeggio frequency
        chime2 = math.sin(2.0 * math.pi * 1056.0 * t) * 0.4
        chime3 = math.sin(2.0 * math.pi * 264.0 * t) * 0.6
        blast = (random.random() * 2.0 - 1.0) * math.exp(-t * 25.0) * 0.6
        sig = (chime1 * 0.5 + chime2 + chime3 + blast) * env * 1.3
        samples.append(clamp(sig))
    return samples

def gen_astra_chakra():
    duration = 0.55
    n_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 4.5)
        # Whirring spinning solar blades (frequency modulated high-speed disc)
        whir_freq = 440.0 + 160.0 * math.sin(2.0 * math.pi * 32.0 * t)
        whir = math.sin(2.0 * math.pi * whir_freq * t)
        solar_hum = math.sin(2.0 * math.pi * 108.0 * t) * 0.7 # Sacred 108Hz
        detonation = (random.random() * 2.0 - 1.0) * math.exp(-t * 28.0) * 0.7
        sig = (whir * 0.55 + solar_hum * 0.45 + detonation * 0.6) * env * 1.4
        samples.append(clamp(sig))
    return samples

def main():
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "assets", "audio", "mythic"))
    write_wav(os.path.join(out_dir, "asura_growl.wav"), gen_asura_growl())
    write_wav(os.path.join(out_dir, "asura_death.wav"), gen_asura_death())
    write_wav(os.path.join(out_dir, "astra_vajra.wav"), gen_astra_vajra())
    write_wav(os.path.join(out_dir, "astra_trishul.wav"), gen_astra_trishul())
    write_wav(os.path.join(out_dir, "astra_chakra.wav"), gen_astra_chakra())
    print("All Asura and Astra sounds generated successfully!")

if __name__ == "__main__":
    main()
