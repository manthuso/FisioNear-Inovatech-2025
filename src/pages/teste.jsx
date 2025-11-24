import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FaDumbbell, FaRunning, FaTimes } from 'react-icons/fa'

export default function PoseDetector() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('Aguardando modelo...')
  const [fps, setFps] = useState(0)
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [showModal, setShowModal] = useState(true)
  const [stream, setStream] = useState(null)
  
  const stageRef = useRef('down') 
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() })

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseRef = useRef(null)
  const rafIdRef = useRef(null)
  const isProcessingRef = useRef(false)

  
  const [currentExercise, setCurrentExercise] = useState('biceps') 
  const exerciseModeRef = useRef('biceps') 

  // Calculo de angulo
  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    if (angle > 180) angle = 360 - angle
    return angle
  }

  const resetExercise = useCallback(() => {
    setCount(0)
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

//Exercicio de Biceps:
  const processBiceps = (lm, ctx) => {
    const shoulder = lm[11] // Ombro esquerdo
    const elbow = lm[13] // Cotovelo esquerdo
    const wrist = lm[15] // Pulso esquerdo
    const hip = lm[23] // Quadril esquerdo

    // Check visibility
    if (shoulder.visibility < 0.5 || elbow.visibility < 0.5 || wrist.visibility < 0.5) {
        ctx.fillStyle = '#ffff00'
        ctx.font = 'bold 24px Arial'
        ctx.fillText('Posicione-se melhor', 10, 40)
        return false
    }

    const bicepsAngle = calculateAngle(shoulder, elbow, wrist)
    const formAngle = calculateAngle(hip, shoulder, elbow) // Postura do cotovelo

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 24px Arial'
    ctx.fillText(`Bíceps: ${bicepsAngle.toFixed(0)}°`, 10, 40)
    ctx.fillText(`Postura: ${formAngle.toFixed(0)}°`, 10, 70)

    // validador da postura
    const isFormCorrect = formAngle < 35

    if (!isFormCorrect) {
        ctx.fillStyle = '#ff0000'
        ctx.fillText(`MANTENHA O COTOVELO FIXO`, 10, 100)
        setMessage('Arrume a postura!')
    } else {
        ctx.fillStyle = '#00ff00'
        ctx.fillText(`Postura OK`, 10, 100)
    }

    if (bicepsAngle > 160) {
        stageRef.current = 'down'
        if(isFormCorrect) setMessage('Puxe!')
    } else if (bicepsAngle > 50 && stageRef.current === 'up') {
        setMessage('Estique tudo!')
    }

    if (bicepsAngle < 40 && stageRef.current === 'down') {
        if (isFormCorrect) {
            stageRef.current = 'up'
            setCount(c => c + 1)
            setMessage('BOA!')
        } else {
            setMessage('Roubou (Postura)')
        }
    } else if (bicepsAngle < 90 && stageRef.current === 'down') {
         if(isFormCorrect) setMessage('Mais alto!')
    }
    return isFormCorrect
  }
//-------------EXERCICIOS (preguiça de fzr o lado direito) -----------------------------------------------//
  // Agachamento:
  const processSquat = (lm, ctx) => {
    const hip = lm[23] // Quadril esquerdo
    const knee = lm[25] // Joelho esquerdo
    const ankle = lm[27] // Tornozelo esquerdo
    const shoulder = lm[11] // Ombro esquerdo

    // Check visibility
    if (hip.visibility < 0.5 || knee.visibility < 0.5 || ankle.visibility < 0.5) {
        ctx.fillStyle = '#ffff00'
        ctx.font = 'bold 24px Arial'
        ctx.fillText('Posicione-se melhor (Corpo inteiro)', 10, 40)
        return false
    }

    const kneeAngle = calculateAngle(hip, knee, ankle)
    const hipAngle = calculateAngle(shoulder, hip, knee) // Tronco

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 24px Arial'
    ctx.fillText(`Joelho: ${kneeAngle.toFixed(0)}°`, 10, 40)
    ctx.fillText(`Tronco: ${hipAngle.toFixed(0)}°`, 10, 70)

    // Validador de postura 
    const isFormCorrect = hipAngle > 80 

    if (!isFormCorrect) {
        ctx.fillStyle = '#ff0000'
        ctx.fillText(`MANTENHA O TRONCO ERETO`, 10, 100)
        setMessage('Arrume a postura!')
    } else {
        ctx.fillStyle = '#00ff00'
        ctx.fillText(`Postura OK`, 10, 100)
    }

    // Em pé (> 160) -> "up" -> up é considerado posição inicial ou descanso
    if (kneeAngle > 160) {
        stageRef.current = 'up'
        if(isFormCorrect) setMessage('Agache!')
    }
    // Agachado (< 90) e estava "up" -> CONTA
    if (kneeAngle < 100 && stageRef.current === 'up') {
        if (isFormCorrect) {
            stageRef.current = 'down'
            setCount(c => c + 1)
            setMessage('SUBIU!')
        } else {
             setMessage('Roubou (Postura)')
        }
    } else if (kneeAngle < 140 && stageRef.current === 'up') {
        if(isFormCorrect) setMessage('Mais baixo!')
    }
    
    return isFormCorrect 
  }
  //-------------------------------------------------------------//

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
            

            //switch de exercicio
            switch (exerciseModeRef.current) {
                case 'biceps':
                    isCorrect = processBiceps(lm, ctx)
                    break
                case 'squat':
                    isCorrect = processSquat(lm, ctx)
                    break
                default:
                    isCorrect = processBiceps(lm, ctx)
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
        <div>Contagem: <span style={{ color: 'var(--primary)' }}>{count}</span></div>
        <div>Status: {message}</div>
        <div style={{ color: fps > 15 ? '#0f0' : '#f00' }}>FPS: {fps}</div>
      </div>

      {/* Modal de Seleção */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="feature-item animate" style={{
            width: '90%', maxWidth: '800px', color: '#fff',
            display: 'flex', flexDirection: 'row', gap: '30px', padding: '40px',
            alignItems: 'flex-start', position: 'relative'
          }}>
            
      {/* x de fechar */}
            <button 
                onClick={() => setShowModal(false)}
                style={{
                    position: 'absolute', top: '15px', right: '15px',
                    background: 'transparent', border: 'none', color: '#fff',
                    cursor: 'pointer', fontSize: '20px'
                }}
            >
                <FaTimes />
            </button>

            {/*  Opções */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                <h2 style={{ marginBottom: '10px', fontSize: '28px', color: '#fff' }}>Configuração</h2>
                
                <div style={{ width: '100%' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#ccc' }}>Câmera:</label>
                    <select
                        value={selectedDeviceId}
                        onChange={onChangeCamera}
                        style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 8,
                        border: '1px solid #555',
                        background: '#333',
                        color: '#fff',
                        fontSize: '16px'
                        }}
                    >
                        {devices.map((d, i) => (
                        <option key={d.deviceId || i} value={d.deviceId}>
                            {d.label || `Câmera ${i + 1}`}
                        </option>
                        ))}
                    </select>
                </div>

                <div style={{ width: '100%' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#ccc' }}>Exercício:</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                        onClick={() => { changeExercise('biceps'); setShowModal(false); }}
                        className="cta-button"
                        style={{ 
                            width: '100%', fontSize: '16px', minWidth: 'unset',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                        }}
                    >
                        <FaDumbbell size={20} /> Rosca Direta
                    </button>
                    <button 
                        onClick={() => { changeExercise('squat'); setShowModal(false); }}
                        className="cta-button"
                        style={{ 
                            width: '100%', fontSize: '16px', backgroundColor: 'var(--primaryDark)', minWidth: 'unset',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                        }}
                    >
                        <FaRunning size={20} /> Agachamento
                    </button>
                    </div>
                </div>
            </div>

            {/* camera modalll */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#ccc', textAlign: 'left' }}>Preview:</label>
                <div style={{ 
                    width: '100%', 
                    height: '300px', 
                    backgroundColor: '#000', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    border: '2px solid #444',
                    position: 'relative'
                }}>
                    {stream ? (
                        <video 
                            ref={onModalVideoRef}
                            autoPlay 
                            playsInline 
                            muted 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    ) : (
                        <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            color: '#666' 
                        }}>
                            Carregando câmera...
                        </div>
                    )}
                </div>
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
          Trocar Exercício: {currentExercise === 'biceps' ? 'Rosca Direta' : 'Agachamento'}
        </button>
      </div>

      <div style={{ position: 'relative', width: 640, height: 480, margin: '0 auto' }}>
        <video ref={videoRef} style={{ display: 'none' }} playsInline muted autoPlay />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{
            border: '3px solid var(--primary)',
            borderRadius: 12,
            backgroundColor: '#000',
            display: 'block'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
        <Link to="/" className="cta-button outline" style={{color: 'white', textDecoration: 'none'}}>← Voltar</Link>
        <button
          type="button"
          onClick={resetExercise}
          className="cta-button outline"
          style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '10px', borderRadius: 5, cursor: 'pointer'}}
        >
          Reiniciar (R)
        </button>
      </div>
    </div>
  )
}