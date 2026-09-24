/**
 * AudioManager — процедурный звук через Web Audio API
 * Никаких файлов — только генераторы
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.35;
    this.masterGain.connect(this.ctx.destination);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.35;
    }
  }

  isMuted() {
    return this.muted;
  }

  private tone(freq: number, duration: number, type: OscillatorType = 'sine', delay = 0) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + delay + 0.01);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + delay + duration / 1000);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration / 1000);
  }

  click() {
    this.tone(660, 50, 'sine');
  }

  success() {
    this.tone(523.25, 250, 'sine', 0); // C
    this.tone(659.25, 250, 'sine', 80); // E
    this.tone(783.99, 250, 'sine', 160); // G
  }

  error() {
    this.tone(180, 180, 'sawtooth');
  }

  whoosh() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(2000, this.ctx.currentTime + 0.5);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();
  }

  tick() {
    this.tone(880, 30, 'square');
  }

  fanfare() {
    this.tone(523.25, 600, 'sine', 0);
    this.tone(659.25, 600, 'sine', 150);
    this.tone(783.99, 600, 'sine', 300);
    this.tone(1046.5, 600, 'sine', 450);
  }
}

export const audio = new AudioManager();
