// Simple audio manager using Web Audio API for synthesized sound effects
class AudioManager {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume()
    }
    return this.ctx
  }

  playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = type
      osc.frequency.setValueAtTime(frequency, ctx.currentTime)
      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch {
      // Silently fail if audio is not available
    }
  }

  // Sound effects
  shuffleSound() {
    this.playTone(200, 0.1, "triangle", 0.08)
    setTimeout(() => this.playTone(250, 0.1, "triangle", 0.08), 50)
    setTimeout(() => this.playTone(300, 0.1, "triangle", 0.08), 100)
  }

  selectSound() {
    this.playTone(440, 0.15, "sine", 0.12)
    setTimeout(() => this.playTone(660, 0.1, "sine", 0.1), 80)
  }

  swipeSound() {
    this.playTone(350, 0.08, "triangle", 0.06)
  }

  flipSound() {
    this.playTone(330, 0.2, "sine", 0.1)
    setTimeout(() => this.playTone(440, 0.2, "sine", 0.1), 100)
    setTimeout(() => this.playTone(550, 0.2, "sine", 0.1), 200)
    setTimeout(() => this.playTone(660, 0.3, "sine", 0.15), 300)
  }

  revealSound() {
    // Dramatic reveal chord
    this.playTone(262, 0.5, "sine", 0.08)
    this.playTone(330, 0.5, "sine", 0.08)
    this.playTone(392, 0.5, "sine", 0.08)
    setTimeout(() => {
      this.playTone(523, 0.8, "sine", 0.12)
      this.playTone(659, 0.8, "sine", 0.1)
    }, 400)
  }

  gestureDetectedSound() {
    this.playTone(800, 0.05, "sine", 0.05)
  }
}

export const audioManager = new AudioManager()
