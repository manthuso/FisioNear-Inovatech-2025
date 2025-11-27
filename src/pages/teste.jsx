import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FaDumbbell, FaRunning, FaTimes, FaChild, FaCamera, FaRedo, FaCog, FaArrowLeft, FaCheckCircle, FaBullseye, FaClock, FaTrophy, FaInfoCircle, FaCommentDots, FaChartBar } from 'react-icons/fa'
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
  const [activeSide, setActiveSide] = useState('left')
  
  // --- Workout State ---
  const [workoutStats, setWorkoutStats] = useState({
    sets: 0,
    reps: 0,
    correctMoves: 0,
    accuracy: 100,
    duration: 0,
    isResting: false,
    restTime: 15,
    finished: false
  })
  const [personalRecord, setPersonalRecord] = useState(0)

  const stageRef = useRef('down') 
  const activeSideRef = useRef('left')
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() })
  
  // Refs para lógica do loop (evitar stale closures)
  const workoutRef = useRef({
    sets: 0,
    reps: 0,
    totalCorrectReps: 0,
    goodFrames: 0,
    totalFrames: 0,
    startTime: Date.now(),
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
  

  const exerciseDataRef = useRef({})

  const TARGET_REPS = 5
  const TARGET_SETS = 3
  const REST_TIME = 10

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

  // Timer de Duração do Treino
  useEffect(() => {
    let interval
    if (!workoutStats.isResting && !workoutStats.finished) {
      interval = setInterval(() => {
        setWorkoutStats(prev => ({
            ...prev,
            duration: Math.floor((Date.now() - workoutRef.current.startTime) / 1000)
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [workoutStats.isResting, workoutStats.finished])

  const resetExercise = useCallback(() => {
    workoutRef.current = {
        sets: 0,
        reps: 0,
        totalCorrectReps: 0,
        goodFrames: 0,
        totalFrames: 0,
        startTime: Date.now(),
        isResting: false,
        finished: false
    }
    exerciseDataRef.current = {}
    activeSideRef.current = 'left'
    // Reset State
    setWorkoutStats({
        sets: 0,
        reps: 0,
        correctMoves: 0,
        accuracy: 100,
        duration: 0,
        isResting: false,
        restTime: REST_TIME,
        finished: false
    })
    setActiveSide('left')
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
    // Increment total correct reps
    w.totalCorrectReps += 1

    // Check Set
    if (w.reps >= TARGET_REPS) {
        if (exerciseType === 'biceps') {
            // Lógica Unilateral: Esquerda -> Direita -> Descanso
            if (activeSideRef.current === 'left') {
                // Trocar para direita
                w.reps = 0
                activeSideRef.current = 'right'
                setActiveSide('right')
                setMessage('TROQUE O BRAÇO!')
                stageRef.current = 'down' // Reset stage
            } else {
                // Fim da série (ambos os braços)
                w.sets += 1
                w.reps = 0
                activeSideRef.current = 'left' // Reset para esquerda para a próxima série
                setActiveSide('left')
                
                if (w.sets >= TARGET_SETS) {
                    w.finished = true
                    setMessage('TREINO CONCLUÍDO!')
                } else {
                    w.isResting = true
                    setMessage('DESCANSO!')
                }
            }
        } else {
            // Lógica Bilateral (Agachamento, etc)
            w.sets += 1
            w.reps = 0
            
            if (w.sets >= TARGET_SETS) {
                w.finished = true
                setMessage('TREINO CONCLUÍDO!')
            } else {
                w.isResting = true
                setMessage('DESCANSO!')
            }
        }
    } else {
        setMessage('BOA!')
    }

    // Update State for UI
    setWorkoutStats(prev => ({
        ...prev,
        sets: w.sets,
        reps: w.reps,
        correctMoves: w.totalCorrectReps,
        accuracy: Math.round((w.goodFrames / w.totalFrames) * 100) || 0,
        duration: Math.floor((Date.now() - w.startTime) / 1000),
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
      ? { video: { deviceId: { exact: deviceId }, width: 1280, height: 720 }, audio: false }
      : { video: { width: 1280, height: 720 }, audio: false }

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
                    isCorrect = processBiceps(lm, ctx, refs, callbacks, activeSideRef.current)
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

            // Update Accuracy Stats
            if (!workoutRef.current.isResting && !workoutRef.current.finished) {
                workoutRef.current.totalFrames++
                if (isCorrect) workoutRef.current.goodFrames++
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

  const instructions = {
    biceps: [
        "Fique em pé com os pés na largura dos ombros.",
        "Segure os halteres com as palmas para frente.",
        "Flexione os cotovelos levando o peso até os ombros.",
        "Desça lentamente até a posição inicial."
    ],
    squat: [
        "Fique em pé com os pés na largura dos ombros.",
        "Mantenha a coluna reta e o peito aberto.",
        "Agache como se fosse sentar em uma cadeira.",
        "Volte à posição inicial empurrando o chão."
    ],
    stretching: [
        "Fique em pé com postura ereta.",
        "Levante os braços lateralmente até a altura dos ombros.",
        "Mantenha a posição por alguns segundos.",
        "Respire profundamente durante o exercício."
    ]
  }

  return (
    <div style={{ padding: '90px 40px 40px', backgroundColor: '#1a1a1a', minHeight: '100vh', color: '#fff' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>
                {currentExercise === 'biceps' ? 'Rosca Direta' : currentExercise === 'squat' ? 'Agachamento' : currentExercise === 'stretching' ? 'Alongamento de Braços' : 'Alongamento de Pescoço'}
            </h1>
            <p style={{ margin: '5px 0 0', color: '#aaa' }}>Exercício assistido por IA</p>
        </div>
        <Link to="/" className="cta-button outline" style={{color: 'white', textDecoration: 'none', padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <FaArrowLeft /> Voltar
        </Link>
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
                    <span style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}><FaCamera /> Câmera:</span>
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

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexDirection: 'row' }}>
        
        {/* Left Column: Camera & Controls */}
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
                background: '#222', 
                borderRadius: '16px', 
                padding: '20px', 
                border: '1px solid #333',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
                <div className="pose-container" style={{ 
                    position: 'relative', 
                    width: '100%', 
                    aspectRatio: '16/9', 
                    backgroundColor: '#000', 
                    borderRadius: '12px', 
                    overflow: 'hidden' 
                }}>
                    <video ref={videoRef} style={{ display: 'none' }} playsInline muted autoPlay />
                    <canvas
                        ref={canvasRef}
                        width={1280}
                        height={720}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    
                    {/* Overlay de Descanso */}
                    {workoutStats.isResting && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.8)',
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

                    {workoutStats.finished && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            color: '#fff', zIndex: 10
                        }}>
                            <h2 style={{ fontSize: '40px', marginBottom: '20px', color: 'var(--primary)' }}>TREINO CONCLUÍDO!</h2>
                            <div style={{ textAlign: 'center', fontSize: '20px', lineHeight: '1.6' }}>
                                <p>Total de Séries: {workoutStats.sets}</p>
                                <p>Movimentos Corretos: {workoutStats.correctMoves}</p>
                                <p>Precisão Média: {workoutStats.accuracy}%</p>
                                <p>Tempo Total: {Math.floor(workoutStats.duration / 60)}m {workoutStats.duration % 60}s</p>
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

                {/* Controls Bar */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                    <button
                        type="button"
                        onClick={resetExercise}
                        className="cta-button outline"
                        style={{ color: 'white', minWidth: '120px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <FaRedo /> Reiniciar
                    </button>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="cta-button"
                        style={{ minWidth: '120px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <FaCog /> Configurar
                    </button>
                </div>
            </div>
        </div>

        {/* Right Column: Stats & Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '300px' }}>
            
            {/* Progress Card */}
            <div style={{ background: '#222', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaClock /> Progresso da Série
                </h3>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#aaa' }}>
                    <span>{workoutStats.reps} / {TARGET_REPS} reps</span>
                    <span>{Math.round((workoutStats.reps / TARGET_REPS) * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#444', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                        width: `${(workoutStats.reps / TARGET_REPS) * 100}%`, 
                        height: '100%', 
                        background: 'var(--primary)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>{workoutStats.correctMoves}</div>
                        <div style={{ fontSize: '12px', color: '#aaa' }}>Movimentos</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: workoutStats.accuracy > 80 ? '#10b981' : '#f59e0b' }}>
                            {workoutStats.accuracy}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#aaa' }}>Precisão</div>
                    </div>
                </div>
            </div>

            
            <div style={{ background: '#222', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}><FaInfoCircle /> Instruções</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>
                    {instructions[currentExercise]?.map((inst, i) => (
                        <li key={i} style={{ marginBottom: '8px' }}>{inst}</li>
                    ))}
                </ul>
            </div>

            {/* Feedback Card */}
            <div style={{ background: '#222', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}><FaCommentDots /> Feedback</h3>
                    <span style={{ 
                        fontSize: '12px', padding: '4px 8px', borderRadius: '4px', 
                        background: message === 'BOA!' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        color: message === 'BOA!' ? '#10b981' : '#fff'
                    }}>
                        ● Ativo
                    </span>
                </div>
                <div style={{ 
                    fontSize: '18px', fontWeight: '500', textAlign: 'center', 
                    color: message === 'BOA!' ? '#10b981' : message.includes('TROQUE') ? '#f59e0b' : '#fff',
                    padding: '10px', background: '#333', borderRadius: '8px'
                }}>
                    {message}
                </div>
                {currentExercise === 'biceps' && (
                    <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '14px', color: '#aaa' }}>
                        Braço Atual: <span style={{ color: '#fff', fontWeight: 'bold' }}>{activeSide === 'left' ? 'Esquerdo' : 'Direito'}</span>
                    </div>
                )}
            </div>

            {/* Stats Summary Card */}
            <div style={{ background: '#222', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}><FaChartBar /> Estatísticas</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                        <span>Séries Completas:</span>
                        <span style={{ color: '#fff' }}>{workoutStats.sets} / {TARGET_SETS}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                        <span>Duração:</span>
                        <span style={{ color: '#fff' }}>{Math.floor(workoutStats.duration / 60)}:{(workoutStats.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                        <span>Recorde:</span>
                        <span style={{ color: '#10b981' }}>{personalRecord}</span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}
