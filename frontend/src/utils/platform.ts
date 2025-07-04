import { Platform } from 'react-native'

export const isWeb = Platform.OS === 'web'
export const isIOS = Platform.OS === 'ios'
export const isAndroid = Platform.OS === 'android'

export const getPlatformType = () => {
  if (isWeb) return 'web'
  if (isIOS) return 'ios'
  if (isAndroid) return 'android'
  return 'unknown'
} 