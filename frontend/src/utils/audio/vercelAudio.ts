const getAudioUrl = (filename: string) => {
  // Vercel 배포 시 정적 파일 경로
  return `/sounds/${filename}`
}

class VercelAudioManager {
  private audioElements: Map<string, HTMLAudioElement> = new Map()
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('Vercel Audio 초기화 시작...')
      
      // 오디오 파일들을 미리 로드
      const soundFiles = [
        'beep/pik.mp3',
        'beep/pip.mp3',
        'rest/start.mp3',
        'rest/end.mp3',
        'koreacount/one.mp3',
        'koreacount/two.mp3',
        'koreacount/three.mp3',
        'koreacount/four.mp3',
        'koreacount/five.mp3',
        'koreacount/six.mp3',
        'koreacount/seven.mp3',
        'koreacount/eight.mp3',
        'koreacount/nine.mp3',
        'koreacount/ten.mp3',
        'koreacount/eleven.mp3',
        'koreacount/twelve.mp3',
        'koreacount/thirteen.mp3',
        'koreacount/fourteen.mp3',
        'koreacount/fifteen.mp3',
        'koreacount/sixteen.mp3',
        'koreacount/seventeen.mp3',
        'koreacount/eighteen.mp3',
        'koreacount/nineteen.mp3',
        'koreacount/twenty.mp3',
      ]

      for (const file of soundFiles) {
        try {
          const audio = new Audio(getAudioUrl(file))
          audio.preload = 'auto'
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve)
            audio.addEventListener('error', (e) => {
              console.error(`${file} 로드 실패:`, e)
              reject(e)
            })
            // 5초 타임아웃
            setTimeout(() => reject(new Error('Timeout')), 5000)
          })
          this.audioElements.set(file, audio)
          console.log(`${file} 로드 완료`)
        } catch (error) {
          console.error(`${file} 로드 실패:`, error)
        }
      }

      this.isInitialized = true
      console.log('Vercel Audio 초기화 완료')
    } catch (error) {
      console.error('Vercel Audio 초기화 실패:', error)
    }
  }

  async playSound(soundPath: string) {
    const audio = this.audioElements.get(soundPath)
    if (audio) {
      try {
        audio.currentTime = 0
        await audio.play()
      } catch (error) {
        console.error(`${soundPath} 재생 실패:`, error)
      }
    } else {
      console.error(`${soundPath} 오디오 요소를 찾을 수 없음`)
    }
  }

  isReady() {
    return this.isInitialized
  }
}

export const vercelAudioManager = new VercelAudioManager() 