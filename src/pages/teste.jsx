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

  // Estado para saber qual botão está pintado de azul (Visual)
  const [currentExercise, setCurrentExercise] = useState('biceps') 
  
  // Ref para o MediaPipe ler instantaneamente sem travar (Lógica)
  const exerciseModeRef = useRef('biceps') 

  // Função que o botão vai chamar ao ser clicado
  const changeExercise = (newExercise) => {
    setCurrentExercise(newExercise)      // Atualiza visual
    exerciseModeRef.current = newExercise // Atualiza lógica interna
    resetExercise()                      // Zera contagem
  }

  // Inicia/reativa a câmera com o deviceId escolhido
  const startCamera = useCallback(async (deviceId) => {
    // parar stream anterior
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

  // Lista câmeras disponíveis 
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

          // FPS
          fpsCounterRef.current.frames++
          const now = Date.now()
          if (now - fpsCounterRef.current.lastTime >= 1000) {
            setFps(fpsCounterRef.current.frames)
            fpsCounterRef.current.frames = 0
            fpsCounterRef.current.lastTime = now
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

          if (results.poseLandmarks) {
            const lm = results.poseLandmarks
            const shoulder = lm[11] //ombro
            const elbow = lm[13] //cotovelo
            const wrist = lm[15] //pulso
            const hip = lm[23] //quadril

            const angle = calculateAngle(shoulder, elbow, wrist)
            const bicepsAngle = calculateAngle(shoulder, elbow, wrist)
            const formAngle = calculateAngle(hip, shoulder, elbow)

            ctx.fillStyle = '#fff'
            ctx.font = 'bold 24px Arial'
            ctx.fillText(`Bíceps: ${bicepsAngle.toFixed(0)}°`, 10, 40)
            ctx.fillText(`Postura: ${formAngle.toFixed(0)}°`, 10, 70)

            const isFormCorrect = formAngle < 30

            if (!isFormCorrect) {
              ctx.fillStyle = '#ff0000'
                ctx.fillText(`⚠️ COTOVELO MOVEL! (${formAngle.toFixed(0)}°)`, 10, 80)
                setMessage('Mantenha o cotovelo parado!')
            } else {
                ctx.fillStyle = '#00ff00'
                ctx.fillText(`Postura OK`, 10, 80)
            }

            // estado down = braço esticado
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
                    
                    setMessage('Roubo de movimento')

                  }
            }
            const color = isFormCorrect ? '#00ff00' : '#ff0000'
            drawConnectors(ctx, lm, POSE_CONNECTIONS, { color: '#00ff00', lineWidth: 4 })
            drawLandmarks(ctx, lm, { color: '#ff0000', lineWidth: 2, radius: 4 })
          }

          isProcessingRef.current = false
        })

        poseRef.current = pose

        // 1) inicia com a câmera padrão
        const stream = await startCamera()
        if (!mounted) return

        // 2) popula lista de câmeras e seleciona a atual
        const cams = await listCameras()
        const curId = stream.getVideoTracks()[0]?.getSettings()?.deviceId
        if (curId) setSelectedDeviceId(curId)
        if (!cams.length) console.warn('Nenhuma câmera encontrada')

        // 3) loop de detecção
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

  // Reinicia contagem e estado do exercício (agora memorizado p/ atalho)
  const resetExercise = useCallback(() => {
    setCount(0)
    setMessage('Inicie o exercício')
    stageRef.current = 'down'
    fpsCounterRef.current = { frames: 0, lastTime: Date.now() }
    const c = canvasRef.current
    if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height)
  }, [])

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    if (angle > 180) angle = 360 - angle
    return angle
  }

  useEffect(() => {
    // Atalho: tecla R para reiniciar
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

        {/* Seletor de câmera */}
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
        <Link to="/" className="cta-button outline">← Voltar</Link>
        <button
          type="button"
          onClick={resetExercise}
          className="cta-button outline"
          title="Atalho: R"
        >
          Reiniciar exercício (R)
        </button>
      </div>
    </div>
  )
}
