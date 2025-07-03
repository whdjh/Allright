import { isWeb } from './platform'

class PreciseTimer {
  private startTime: number = 0
  private intervalId: number | null = null
  private callback: (elapsed: number) => void
  private interval: number

  constructor(callback: (elapsed: number) => void, interval: number = 1000) {
    this.callback = callback
    this.interval = interval
  }

  start() {
    this.startTime = isWeb ? performance.now() : Date.now()
    this.scheduleNext()
  }

  private scheduleNext() {
    if (isWeb) {
      // 웹에서는 requestAnimationFrame 사용
      const tick = () => {
        const elapsed = Math.floor((performance.now() - this.startTime) / 1000)
        this.callback(elapsed)
        this.intervalId = requestAnimationFrame(tick)
      }
      this.intervalId = requestAnimationFrame(tick)
    } else {
      // 앱에서는 setInterval 사용하되 드리프트 보정
      this.intervalId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
        this.callback(elapsed)
      }, this.interval) as any
    }
  }

  stop() {
    if (this.intervalId) {
      if (isWeb) {
        cancelAnimationFrame(this.intervalId)
      } else {
        clearInterval(this.intervalId)
      }
      this.intervalId = null
    }
  }

  getElapsedTime(): number {
    return Math.floor(((isWeb ? performance.now() : Date.now()) - this.startTime) / 1000)
  }
}

export { PreciseTimer }
