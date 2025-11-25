import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FaDumbbell, FaRunning, FaTimes, FaChild } from 'react-icons/fa'
import { processBiceps } from '../exercises/BicepsCurl'
import { processSquat } from '../exercises/Squat'
import { processStretching } from '../exercises/Stretching'
import ExerciseSelector from '../components/ExerciseSelector'

export default function PoseDetector() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('Aguardando modelo...')
  const [fps, setFps] = useState(0)
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [showModal, setShowModal] = useState(true)
  const [stream, setStream] = useState(null)
  
  // --- Workout State ---
  const [workoutStats, setWorkoutStats] = useState({
    sets: 0,
    reps: 0,
    calories: 0,
    isResting: false,
    restTime: 30,
    finished: false
  })
  const [personalRecord, setPersonalRecord] = useState(0)

  const stageRef = useRef('down') 
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() })
  
  // Refs para lógica do loop (evitar stale closures)
  const workoutRef = useRef({
    sets: 0,
    reps: 0,
    calories: 0,
    isResting: false,
    finished: false
  })
  const recordRef = useRef(0)
  
  // Ref para suavização de ângulos (EMA)
  const smoothedAnglesRef = useRef({
    biceps: 160,
    elbowForm: 180,
    knee: 180,
    hip: 180
  })
  
  // Ref para dados específicos do exercício (ex: timer de alongamento)
  const exerciseDataRef = useRef({})

  const TARGET_REPS = 12
  const TARGET_SETS = 3
  const REST_TIME = 30

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseRef = useRef(null)
  const rafIdRef = useRef(null)
  const isProcessingRef = useRef(false)

  
  const [currentExercise, setCurrentExercise] = useState('biceps') 
  const exerciseModeRef = useRef('biceps') 

  // Carregar Recorde
  useEffect(() => {
    const saved = localStorage.getItem(`record_${currentExercise}`)
    const val = saved ? parseInt(saved) : 0
    setPersonalRecord(val)
    recordRef.current = val
  }, [currentExercise])

  // Timer de Descanso
  useEffect(() => {
    let interval
    if (workoutStats.isResting && workoutStats.restTime > 0) {
      interval = setInterval(() => {
        setWorkoutStats(prev => {
            if (prev.restTime <= 1) {
                // Fim do descanso
                workoutRef.current.isResting = false
                setMessage('VOLTANDO!')
                return { ...prev, isResting: false, restTime: REST_TIME }
            }
            return { ...prev, restTime: prev.restTime - 1 }
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [workoutStats.isResting])

  const resetExercise = useCallback(() => {
    // Reset Refs
    workoutRef.current = {
        sets: 0,
        reps: 0,
        calories: 0,
        isResting: false,
        finished: false
    }
    exerciseDataRef.current = {}
    // Reset State
    setWorkoutStats({
        sets: 0,
        reps: 0,
        calories: 0,
        isResting: false,
        restTime: REST_TIME,
        finished: false
    })
    setMessage('Inicie o exercício')
    stageRef.current = exerciseModeRef.current === 'squat' ? 'up' : 'down'
    
    fpsCounterRef.current = { frames: 0, lastTime: Date.now() }
    const c = canvasRef.current
    if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height)
  }, [])

  const changeExercise = (newExercise) => {
    setCurrentExercise(newExercise)
    exerciseModeRef.current = newExercise
    resetExercise()
  }

  const handleRepCompletion = (exerciseType) => {
    const w = workoutRef.current
    if (w.isResting || w.finished) return

    w.reps += 1
    // METs estimados: Biceps ~3.5 METs, Squat ~5.0 METs. 
    // Formula simplificada: kcal = rep * fator
    const calPerRep = exerciseType === 'squat' ? 0.15 : 0.05
    w.calories += calPerRep

    // Check Set
    if (w.reps >= TARGET_REPS) {
        w.sets += 1
        w.reps = 0
        
        if (w.sets >= TARGET_SETS) {
            w.finished = true
            setMessage('TREINO CONCLUÍDO!')
        } else {
            w.isResting = true
            setMessage('DESCANSO!')
        }
    } else {
        setMessage('BOA!')
    }

    // Update State for UI
    setWorkoutStats(prev => ({
        ...prev,
        sets: w.sets,
        reps: w.reps,
        calories: w.calories,
        isResting: w.isResting,
        finished: w.finished
    }))

    // Record Logic
    const currentSessionReps = (w.sets * TARGET_REPS) + w.reps
    if (currentSessionReps > recordRef.current) {
        recordRef.current = currentSessionReps
        setPersonalRecord(currentSessionReps)
        localStorage.setItem(`record_${exerciseType}`, currentSessionReps.toString())
    }
  }

  const startCamera = useCallback(async (deviceId) => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    const constraints = deviceId
      ? { video: { deviceId: { exact: deviceId }, width: 640, height: 480 }, audio: false }
      : { video: { width: 640, height: 480 }, audio: false }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    videoRef.current.srcObject = stream
    await videoRef.current.play()
    setStream(stream)
    setMessage('Inicie o exercício')
    return stream
  }, [])

  const listCameras = useCallback(async () => {
    const all = await navigator.mediaDevices.enumerateDevices()
    const cams = all.filter(d => d.kind === 'videoinput')
    setDevices(cams)
    return cams
  }, [])

  useEffect(() => {
    let mounted = true

    const initPose = async () => {
      try {
        const { Pose, POSE_CONNECTIONS } = await import('@mediapipe/pose')
        const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils')

        const pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        })

        pose.setOptions({
          modelComplexity: 2,
          smoothLandmarks: true,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        })

        pose.onResults((results) => {
          if (!mounted) return

          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')

          fpsCounterRef.current.frames++
          const now = Date.now()
          if (now - fpsCounterRef.current.lastTime >= 1000) {
            setFps(fpsCounterRef.current.frames)
            fpsCounterRef.current.frames = 0
            fpsCounterRef.current.lastTime = now
          }

          // Limpa e desenha frame
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

          if (results.poseLandmarks) {
            const lm = results.poseLandmarks
            let isCorrect = true
            
            const refs = { stageRef, smoothedAnglesRef, exerciseDataRef }
            const callbacks = { setMessage, handleRepCompletion }

            //switch de exercicio
            switch (exerciseModeRef.current) {
                case 'biceps':
                    isCorrect = processBiceps(lm, ctx, refs, callbacks)
                    break
                case 'squat':
                    isCorrect = processSquat(lm, ctx, refs, callbacks)
                    break
                case 'stretching':
                    isCorrect = processStretching(lm, ctx, refs, callbacks)
                    break
                default:
                    isCorrect = processBiceps(lm, ctx, refs, callbacks)
                    break
            }

            const color = isCorrect ? '#00ff00' : '#ff0000'
            drawConnectors(ctx, lm, POSE_CONNECTIONS, { color: color, lineWidth: 4 })
            drawLandmarks(ctx, lm, { color: '#ff0000', lineWidth: 2, radius: 4 })
          }

          isProcessingRef.current = false
        })

        poseRef.current = pose

        const stream = await startCamera()
        if (!mounted) return

        const cams = await listCameras()
        const curId = stream.getVideoTracks()[0]?.getSettings()?.deviceId
        if (curId) setSelectedDeviceId(curId)
        if (!cams.length) console.warn('Nenhuma câmera encontrada')

        const detectPose = async () => {
          if (!mounted || !poseRef.current) return
          rafIdRef.current = requestAnimationFrame(detectPose)

          if (!isProcessingRef.current && videoRef.current?.readyState === 4) {
            isProcessingRef.current = true
            try {
              await poseRef.current.send({ image: videoRef.current })
            } catch (err) {
              console.error('Erro no send:', err)
              isProcessingRef.current = false
            }
          }
        }
        detectPose()
      } catch (err) {
        console.error('Erro ao inicializar:', err)
        setMessage('Erro: ' + err.message)
      }
    }

    initPose()

    return () => {
      mounted = false
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      }
      if (poseRef.current) {
        poseRef.current.close()
      }
    }
  }, [listCameras, startCamera]) 

  const onChangeCamera = async (e) => {
    const id = e.target.value
    setSelectedDeviceId(id)
    try {
      await startCamera(id)
    } catch (err) {
      console.error('Falha ao trocar câmera:', err)
    }
  }

  const onModalVideoRef = useCallback((node) => {
    if (node && stream) {
      node.srcObject = stream
    }
  }, [stream])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        resetExercise()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [resetExercise])

  return (
    <div style={{ padding: 60, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff' }}>Exercicios</h1>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 20,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16
      }}>
        <div style={{ background: '#333', padding: '8px 16px', borderRadius: '8px' }}>
            Série: <span style={{ color: 'var(--primary)' }}>{workoutStats.sets + 1}/{TARGET_SETS}</span>
        </div>
        <div style={{ background: '#333', padding: '8px 16px', borderRadius: '8px' }}>
            Reps: <span style={{ color: 'var(--primary)' }}>{workoutStats.reps}/{TARGET_REPS}</span>
        </div>
        <div style={{ background: '#333', padding: '8px 16px', borderRadius: '8px' }}>
            Calorias: <span style={{ color: '#f59e0b' }}>{workoutStats.calories.toFixed(1)} kcal</span>
        </div>
        <div style={{ background: '#333', padding: '8px 16px', borderRadius: '8px' }}>
            Recorde: <span style={{ color: '#10b981' }}>{personalRecord}</span>
        </div>
        <div>Status: {message}</div>
      </div>

      {/* Modal de Seleção */}
      {showModal && (
        <div className="setup-modal-overlay">
          <div className="setup-modal">
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  background: '#222', padding: '15px', borderRadius: '12px', border: '1px solid #444' 
              }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                    <span style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>📷 Câmera:</span>
                    <select 
                        value={selectedDeviceId} 
                        onChange={onChangeCamera}
                        style={{ 
                            flex: 1,
                            padding: '10px', borderRadius: '6px', 
                            border: '1px solid #555', backgroundColor: '#333', color: '#fff', fontSize: '14px',
                            outline: 'none', cursor: 'pointer'
                        }}
                    >
                        {devices.map((d, i) => (
                        <option key={d.deviceId || i} value={d.deviceId}>
                            {d.label || `Câmera ${i + 1}`}
                        </option>
                        ))}
                    </select>
                 </div>
              </div>

              <ExerciseSelector onSelectExercise={(exId) => {
                  changeExercise(exId);
                  setShowModal(false);
              }} />
            </div>
          </div>
        </div>
      )}

      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <button 
          onClick={() => setShowModal(true)}
          className="cta-button"
          style={{ minWidth: 'unset', padding: '10px 30px' }}
        >
          Trocar Exercício: {currentExercise === 'biceps' ? 'Rosca Direta' : currentExercise === 'squat' ? 'Agachamento' : 'Alongamento'}
        </button>
      </div>

      <div className="pose-container">
        <video ref={videoRef} style={{ display: 'none' }} playsInline muted autoPlay />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="pose-canvas"
        />
        
        {/* Overlay de Descanso */}
        {workoutStats.isResting && (
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 12,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                color: '#fff', zIndex: 10
            }}>
                <h2 style={{ fontSize: '48px', marginBottom: '10px' }}>DESCANSO</h2>
                <div style={{ fontSize: '80px', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {workoutStats.restTime}s
                </div>
                <p style={{ fontSize: '20px', marginTop: '10px' }}>Respire fundo...</p>
            </div>
        )}

        {/* Overlay de Fim de Treino */}
        {workoutStats.finished && (
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: 12,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                color: '#fff', zIndex: 10
            }}>
                <h2 style={{ fontSize: '40px', marginBottom: '20px', color: 'var(--primary)' }}>TREINO CONCLUÍDO!</h2>
                <div style={{ textAlign: 'center', fontSize: '20px', lineHeight: '1.6' }}>
                    <p>Total de Séries: {workoutStats.sets}</p>
                    <p>Calorias Queimadas: {workoutStats.calories.toFixed(1)} kcal</p>
                </div>
                <button 
                    onClick={resetExercise}
                    className="cta-button"
                    style={{ marginTop: '30px' }}
                >
                    Novo Treino
                </button>
            </div>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
        <Link to="/" className="cta-button outline" style={{color: 'white', textDecoration: 'none'}}>← Voltar</Link>
        <button
          type="button"
          onClick={resetExercise}
          className="cta-button outline"
          style={{ color: 'white' }}
        >
          Reiniciar (R)
        </button>
      </div>
    </div>
  )
}
