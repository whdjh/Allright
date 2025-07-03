import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { audioManager } from '../../utils/audio'
import { PreciseTimer } from '../../utils/timer'

export default function ExercisePage() {
  const {
    startWith,
    concentricTime,
    eccentricTime,
    reps,
    restTime,
    setCount,
    tempos,
    currentExerciseIndex,
    isFirstExercise,
    exerciseStartTime,
  } = useLocalSearchParams<{
    startWith: 'concentric' | 'eccentric'
    concentricTime: string
    eccentricTime: string
    reps: string
    restTime: string
    setCount: string
    tempos: string
    currentExerciseIndex: string
    isFirstExercise: string
    exerciseStartTime: string
  }>()

  const [currentSet, setCurrentSet] = useState(1)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [showExerciseComplete, setShowExerciseComplete] = useState(false)
  const [remainingRestTime, setRemainingRestTime] = useState<number | null>(null)
  const [totalSets, setTotalSets] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const exerciseStartTimeRef = useRef<number>(0)
  const router = useRouter()
  const exerciseTimerRef = useRef<PreciseTimer | null>(null)

  // 소리 초기화
  useEffect(() => {
    const loadSounds = async () => {
      try {
        console.log('소리 로드 시작...')
        await audioManager.initialize()
        console.log('소리 로드 완료')
      } catch (error) {
        console.log('소리 로드 실패:', error)
      }
    }

    loadSounds()

    return () => {
      audioManager.cleanup()
    }
  }, [])

  // 소리 재생 함수
  const playSound = async (type: 'pik' | 'pip') => {
    try {
      await audioManager.playSound(type)
    } catch (error) {
      console.log('소리 재생 실패:', error)
    }
  }

  // 경과시간을 포맷팅하는 함수
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 경과시간 실시간 업데이트
  useEffect(() => {
    if (!startTime) return

    // 기존 타이머 정리
    if (exerciseTimerRef.current) {
      exerciseTimerRef.current.stop()
    }

    // 정확한 타이머 시작
    exerciseTimerRef.current = new PreciseTimer((elapsed) => {
      setElapsedTime(elapsed)
    }, 100)

    exerciseTimerRef.current.start()

    return () => {
      if (exerciseTimerRef.current) {
        exerciseTimerRef.current.stop()
      }
    }
  }, [startTime])

  // 숫자 카운트 소리 재생 함수
  const playCountSound = async (num: number) => {
    try {
      await audioManager.playSound(num.toString())
    } catch (e) {
      console.log('카운트 소리 재생 실패:', e)
    }
  }

  // 휴식 소리 재생 함수
  const playRestSound = async (type: 'start' | 'end') => {
    try {
      await audioManager.playSound(`rest-${type}`)
    } catch (e) {
      console.log('휴식 소리 재생 실패:', e)
    }
  }

  useEffect(() => {
    const concentric = Number(concentricTime)
    const eccentric = Number(eccentricTime)
    const repsCount = Number(reps)
    const rest = Number(restTime)
    const sets = Number(setCount)

    if (
      !startWith ||
      isNaN(concentric) ||
      isNaN(eccentric) ||
      isNaN(repsCount) ||
      isNaN(rest) ||
      isNaN(sets)
    )
      return

    // 시작 시간 설정 (전달받은 시간 사용)
    const startTimeValue = exerciseStartTime ? new Date(Number(exerciseStartTime)) : new Date()
    setStartTime(startTimeValue)
    exerciseStartTimeRef.current = Number(exerciseStartTime) || Date.now()
    setTotalSets(sets)

    const runSet = (setIndex: number) => {
      const firstPhase = startWith === 'concentric' ? 'PIK' : 'PIP'
      const secondPhase = startWith === 'concentric' ? 'PIP' : 'PIK'
      const firstTime = startWith === 'concentric' ? concentric : eccentric
      const secondTime = startWith === 'concentric' ? eccentric : concentric

      let rep = 0
      let phase = 0 // 0: first phase, 1: second phase
      let time = 0
      let currentStep = 0
      let interval: number | null = null

      const startInterval = () => {
        interval = setInterval(() => {
          const now = Date.now()
          const expectedTime = exerciseStartTimeRef.current + (currentStep * 1000)

          if (Math.abs(now - expectedTime) > 100) {
            exerciseStartTimeRef.current = now - (currentStep * 1000)
          }

          if (rep >= repsCount) {
            clearInterval(interval!)
            if (setIndex < sets) {
              playRestSound('start')
              let restElapsed = 0
              const restStartTime = Date.now()
              const restInterval = setInterval(() => {
                const restNow = Date.now()
                const expectedRestTime = restStartTime + (restElapsed * 1000)
                if (Math.abs(restNow - expectedRestTime) > 100) {
                  restElapsed = Math.floor((restNow - restStartTime) / 1000)
                } else {
                  restElapsed++
                }
                
                const remainingTime = rest - restElapsed
                setRemainingRestTime(remainingTime > 0 ? remainingTime : null)
                
                if (restElapsed >= rest) {
                  clearInterval(restInterval)
                  playRestSound('end')
                  setRemainingRestTime(null)
                  setCurrentSet(prev => prev + 1)
                  exerciseStartTimeRef.current = Date.now()
                  runSet(setIndex + 1)
                }
              }, 1000)
            } else {
              handleExerciseComplete()
            }
            return
          }

          if (phase === 0) {
            // 첫 번째 페이즈 (PIK 또는 PIP)
            const soundType = firstPhase === 'PIK' ? 'pik' : 'pip'
            playSound(soundType)
            time++
            currentStep++
            if (time >= firstTime) {
              phase = 1
              time = 0
            }
          } else {
            // 두 번째 페이즈 (PIP 또는 PIK)
            const soundType = secondPhase === 'PIK' ? 'pik' : 'pip'
            playSound(soundType)
            time++
            currentStep++
            if (time >= secondTime) {
              // 반복이 끝났으니 일단 멈추고 1초 후 카운트 로그 후 재개
              clearInterval(interval!)
              setTimeout(() => {
                rep++
                playCountSound(rep)
                // 다음 반복을 위해 interval 재시작
                startInterval()
              }, 1000)
              phase = 0
              time = 0
              return
            }
          }
        }, 1000)
      }

      startInterval()
    }

    runSet(1)
    
  }, [])

  // 운동 완료 후 선택 페이지로 이동
  const handleExerciseComplete = () => {
    setShowExerciseComplete(true)
  }

  const addAnotherExercise = () => {
    router.push({
      pathname: '/tempo',
      params: {
        tempos: tempos,
        exerciseStartTime: exerciseStartTime,
      },
    })
  }

  const finishAllExercises = () => {
    const allTempos = tempos ? JSON.parse(tempos) : []
    const totalExerciseTime = elapsedTime
    const totalSets = allTempos.reduce((sum: number, tempo: any) => {
      return sum + Number(tempo.setCount)
    }, 0)
    
    router.push({
      pathname: '/result',
      params: {
        tempos: tempos,
        totalExerciseTime: totalExerciseTime.toString(),
        totalSets: totalSets.toString(),
      },
    })
  }

  return (
    <View className="flex-1 bg-black">
      {!showExerciseComplete ? (
        <View className="flex-1 justify-center items-center px-6">
          {/* 총 경과시간 */}
          <View className="bg-black/80 p-6 rounded-2xl mb-8">
            <Text className="text-white text-2xl font-bold text-center">
              총 경과시간
            </Text>
            <Text className="text-white text-4xl font-bold text-center">
              {formatElapsedTime(elapsedTime)}
            </Text>
          </View>

          {/* 남은 세트수 */}
          <View className="bg-emerald-600/80 p-6 rounded-2xl mb-8">
            <Text className="text-white text-xl font-semibold text-center">
              남은 세트수
            </Text>
            <Text className="text-white text-3xl font-bold text-center">
              {totalSets - currentSet + 1} / {totalSets}
            </Text>
          </View>

          {/* 남은 휴식시간 */}
          {remainingRestTime !== null && (
            <View className="bg-blue-600/80 p-6 rounded-2xl">
              <Text className="text-white text-xl font-semibold text-center">
                남은 휴식시간
              </Text>
              <Text className="text-white text-3xl font-bold text-center">
                {remainingRestTime}초
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-white text-2xl font-bold mb-8 text-center">
            운동 완료!
          </Text>
          <Text className="text-white text-lg mb-12 text-center">
            다음 운동을 추가하시겠습니까?
          </Text>
          
          <View className="w-full space-y-4">
            <TouchableOpacity
              onPress={addAnotherExercise}
              className="bg-emerald-600 py-4 rounded-2xl"
            >
              <Text className="text-white text-center text-lg font-semibold">
                운동 추가
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={finishAllExercises}
              className="bg-zinc-700 py-4 rounded-2xl"
            >
              <Text className="text-white text-center text-lg font-semibold">
                운동 종료
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}
