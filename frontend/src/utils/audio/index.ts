import { isWeb } from '../platform'
import { nativeAudioManager } from './nativeAudio'
import { vercelAudioManager } from './vercelAudio'

class AudioManager {
  async initialize() {
    if (isWeb) {
      // 웹에서는 Vercel 최적화된 오디오 매니저 사용
      await vercelAudioManager.initialize()
    } else {
      // 모바일에서는 기존 Expo AV 방식 사용
      await nativeAudioManager.initialize()
    }
  }

  async playSound(soundName: string) {
    if (isWeb) {
      // 웹에서는 파일 경로로 접근
      const soundPath = this.getSoundPath(soundName)
      await vercelAudioManager.playSound(soundPath)
    } else {
      // 모바일에서는 기존 방식 그대로 사용
      await nativeAudioManager.playSound(soundName)
    }
  }

  private getSoundPath(soundName: string): string {
    // 웹에서만 사용되는 경로 매핑
    const pathMap: { [key: string]: string } = {
      pik: 'beep/pik.mp3',
      pip: 'beep/pip.mp3',
      'rest-start': 'rest/start.mp3',
      'rest-end': 'rest/end.mp3',
      '1': 'koreacount/one.mp3',
      '2': 'koreacount/two.mp3',
      '3': 'koreacount/three.mp3',
      '4': 'koreacount/four.mp3',
      '5': 'koreacount/five.mp3',
      '6': 'koreacount/six.mp3',
      '7': 'koreacount/seven.mp3',
      '8': 'koreacount/eight.mp3',
      '9': 'koreacount/nine.mp3',
      '10': 'koreacount/ten.mp3',
      '11': 'koreacount/eleven.mp3',
      '12': 'koreacount/twelve.mp3',
      '13': 'koreacount/thirteen.mp3',
      '14': 'koreacount/fourteen.mp3',
      '15': 'koreacount/fifteen.mp3',
      '16': 'koreacount/sixteen.mp3',
      '17': 'koreacount/seventeen.mp3',
      '18': 'koreacount/eighteen.mp3',
      '19': 'koreacount/nineteen.mp3',
      '20': 'koreacount/twenty.mp3',
    }
    return pathMap[soundName] || soundName
  }

  async cleanup() {
    if (!isWeb) {
      await nativeAudioManager.cleanup()
    }
  }

  isReady() {
    if (isWeb) {
      return vercelAudioManager.isReady()
    } else {
      return nativeAudioManager.isReady()
    }
  }
}

export const audioManager = new AudioManager() 