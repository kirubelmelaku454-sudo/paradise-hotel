/**
 * 5-Star Luxury Concierge Audio Notification System
 * Uses standard Web Audio API to synthesize a crystal-clear harmonic bell chime
 * without relying on external MP3 downloads or broken asset links.
 */

class AudioNotificationService {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Harmonious Golden Chime (Success / New Booking / Approval)
   */
  playChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Elegant pentatonic chord: C5 -> E5 -> G5 -> C6
      const frequencies = [523.25, 659.25, 783.99, 1046.50];

      frequencies.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.07);

        // Soft attack and smooth exponential decay
        gain.gain.setValueAtTime(0, now + index * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.07 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.07 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.07);
        osc.stop(now + index * 0.07 + 1.3);
      });
    } catch (_) {}
  }

  /**
   * Subtle Soft Ding (Notification / Update)
   */
  playSoftDing() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch (_) {}
  }
}

export const audioNotifier = new AudioNotificationService();
export default audioNotifier;

