import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

export default function PoseDetector() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('Aguardando modelo...')
  const [fps, setFps] = useState(0)
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  
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
//-------------------------------------------------------------//
//Exercicio de Biceps:
  const processBiceps = (lm, ctx) => {
    const shoulder = lm[11] // Ombro esquerdo
    const elbow = lm[13] // Cotovelo esquerdo
    const wrist = lm[15] // Pulso esquerdo
    const hip = lm[23] // Quadril esquerdo

    const bicepsAngle = calculateAngle(shoulder, elbow, wrist)
    const formAngle = calculateAngle(hip, shoulder, elbow) // Postura do cotovelo

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 24px Arial'
    ctx.fillText(`Bíceps: ${bicepsAngle.toFixed(0)}°`, 10, 40)
    ctx.fillText(`Postura: ${formAngle.toFixed(0)}°`, 10, 70)

    // validador da postura
    const isFormCorrect = formAngle < 40

    if (!isFormCorrect) {
        ctx.fillStyle = '#ff0000'
        ctx.fillText(`COTOVELO INCORRETO`, 10, 100)
        setMessage('Arrume a postura!')
    } else {
        ctx.fillStyle = '#00ff00'
        ctx.fillText(`Postura OK`, 10, 100)
    }

    if (bicepsAngle > 160) {
        stageRef.current = 'down'
        if(isFormCorrect) setMessage('Puxe!')
    }

    if (bicepsAngle < 50 && stageRef.current === 'down') {
        if (isFormCorrect) {
            stageRef.current = 'up'
            setCount(c => c + 1)
            setMessage('BOA!')
        } else {
            setMessage('Roubou (Postura)')
        }
    }
    return isFormCorrect
  }
//-------------EXERCICIOS (preguiça de fzr o lado direito) -----------------------------------------------//
  // Agachamento:
  const processSquat = (lm, ctx) => {
    const hip = lm[23] // Quadril esquerdo
    const knee = lm[25] // Joelho esquerdo
    const ankle = lm[27] // Tornozelo esquerdo

    const kneeAngle = calculateAngle(hip, knee, ankle)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 24px Arial'
    ctx.fillText(`Joelho: ${kneeAngle.toFixed(0)}°`, 10, 40)

    // Em pé (> 160) -> "up" -> up é considerado posição inicial ou descanso
    if (kneeAngle > 160) {
        stageRef.current = 'up'
        setMessage('Agache!')
    }
    // Agachado (< 90) e estava "up" -> CONTA
    if (kneeAngle < 90 && stageRef.current === 'up') {
        stageRef.current = 'down'
        setCount(c => c + 1)
        setMessage('SUBIU!')
    }
    
    return true 
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
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
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

        <label style={{ marginLeft: 'auto', fontWeight: 600 }}>
          Câmera:
          <select
            value={selectedDeviceId}
            onChange={onChangeCamera}
            style={{
              marginLeft: 8,
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #444',
              background: '#111',
              color: '#fff'
            }}
          >
            {devices.map((d, i) => (
              <option key={d.deviceId || i} value={d.deviceId}>
                {d.label || `Câmera ${i + 1}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Botões de trocar de exercicio*/ } 
      <div style={{ display: 'flex', gap: 15, justifyContent: 'center', marginBottom: 20 }}>
          <button 
            onClick={() => changeExercise('biceps')}
            style={{
                padding: '12px 24px',
                background: currentExercise === 'biceps' ? '#007bff' : '#333',
                color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
            }}>
            Rosca Direta
          </button>

          <button 
            onClick={() => changeExercise('squat')}
            style={{
                padding: '12px 24px',
                background: currentExercise === 'squat' ? '#007bff' : '#333',
                color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
            }}>
            Abio's Agachamento
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