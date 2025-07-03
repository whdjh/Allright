const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)

// 웹 환경에서 오디오 파일 처리를 위한 설정
config.resolver.assetExts.push('mp3', 'wav', 'm4a')

module.exports = withNativeWind(config, { input: './src/styles/global.css' })