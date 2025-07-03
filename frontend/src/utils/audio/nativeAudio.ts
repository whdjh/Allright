import { Audio } from 'expo-av'

class NativeAudioManager {
  private sounds: Map<string, Audio.Sound> = new Map()
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('Native Audio 초기화 시작...')
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })

      await this.preloadSounds()
      this.isInitialized = true
      console.log('Native Audio 초기화 완료')
    } catch (error) {
      console.error('Native Audio 초기화 실패:', error)
    }
  }

  private async preloadSounds() {
    // 기존 require() 방식 그대로 유지
    const soundFiles = {
      pik: require('../../assets/sounds/beep/pik.mp3'),
      pip: require('../../assets/sounds/beep/pip.mp3'),
      'rest-start': require('../../assets/sounds/rest/start.mp3'),
      'rest-end': require('../../assets/sounds/rest/end.mp3'),
      '1': require('../../assets/sounds/koreacount/one.mp3'),
      '2': require('../../assets/sounds/koreacount/two.mp3'),
      '3': require('../../assets/sounds/koreacount/three.mp3'),
      '4': require('../../assets/sounds/koreacount/four.mp3'),
      '5': require('../../assets/sounds/koreacount/five.mp3'),
      '6': require('../../assets/sounds/koreacount/six.mp3'),
      '7': require('../../assets/sounds/koreacount/seven.mp3'),
      '8': require('../../assets/sounds/koreacount/eight.mp3'),
      '9': require('../../assets/sounds/koreacount/nine.mp3'),
      '10': require('../../assets/sounds/koreacount/ten.mp3'),
      '11': require('../../assets/sounds/koreacount/eleven.mp3'),
      '12': require('../../assets/sounds/koreacount/twelve.mp3'),
      '13': require('../../assets/sounds/koreacount/thirteen.mp3'),
      '14': require('../../assets/sounds/koreacount/fourteen.mp3'),
      '15': require('../../assets/sounds/koreacount/fifteen.mp3'),
      '16': require('../../assets/sounds/koreacount/sixteen.mp3'),
      '17': require('../../assets/sounds/koreacount/seventeen.mp3'),
      '18': require('../../assets/sounds/koreacount/eighteen.mp3'),
      '19': require('../../assets/sounds/koreacount/nineteen.mp3'),
      '20': require('../../assets/sounds/koreacount/twenty.mp3'),
    }

    for (const [name, file] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: false })
        this.sounds.set(name, sound)
        console.log(`${name} 소리 로드 완료`)
      } catch (error) {
        console.error(`${name} 소리 로드 실패:`, error)
      }
    }
  }

  async playSound(soundName: string) {
    const sound = this.sounds.get(soundName)
    if (sound) {
      try {
        await sound.replayAsync()
      } catch (error) {
        console.error(`${soundName} 재생 실패:`, error)
      }
    } else {
      console.error(`${soundName} 소리를 찾을 수 없음`)
    }
  }

  async cleanup() {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync()
    }
    this.sounds.clear()
  }

  isReady() {
    return this.isInitialized
  }
}

export const nativeAudioManager = new NativeAudioManager() 