import { calculateAngle, getPixelCoords, smoothValue, getColorForProgress, drawProgressArc, drawGhostLimb } from './utils'

export const processBiceps = (lm, ctx, { stageRef, smoothedAnglesRef }, { setMessage, handleRepCompletion }) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    
    const shoulder = lm[11] // Ombro esquerdo
    const elbow = lm[13] // Cotovelo esquerdo
    const wrist = lm[15] // Pulso esquerdo
    const hip = lm[23] // Quadril esquerdo

    // Check visibility
    if (shoulder.visibility < 0.5 || elbow.visibility < 0.5 || wrist.visibility < 0.5) {
        ctx.fillStyle = '#ffff00'
        ctx.font = 'bold 24px Poppins, Arial'
        ctx.fillText('Posicione-se melhor', 10, 40)
        return false
    }

    const rawBicepsAngle = calculateAngle(shoulder, elbow, wrist)
    const rawFormAngle = calculateAngle(hip, shoulder, elbow) // Postura do cotovelo

    // Aplicar suavização (EMA)
    const bicepsAngle = smoothValue('biceps', rawBicepsAngle, smoothedAnglesRef.current)
    const formAngle = smoothValue('elbowForm', rawFormAngle, smoothedAnglesRef.current)

    // --- Visual Feedback Avançado ---
    const pShoulder = getPixelCoords(shoulder, width, height)
    const pElbow = getPixelCoords(elbow, width, height)
    const pWrist = getPixelCoords(wrist, width, height)

    // Progresso: 160° (inicio) -> 30° (fim)
    const progress = Math.max(0, Math.min(1, (160 - bicepsAngle) / (160 - 30)))
    const color = getColorForProgress(progress)

    // 1. Barra de Progresso no Cotovelo
    drawProgressArc(ctx, pElbow, 45, progress, color)

    // 2. Indicador de Ângulo Colorido (Linha do braço)
    ctx.beginPath()
    ctx.moveTo(pShoulder.x, pShoulder.y)
    ctx.lineTo(pElbow.x, pElbow.y)
    ctx.lineTo(pWrist.x, pWrist.y)
    ctx.strokeStyle = color
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.stroke()

    // 3. Ghost Overlay (Silhueta da meta)
    if (stageRef.current === 'down') {
        // Meta: Braço flexionado (pulso próximo ao ombro)
        // Estimativa simples: vetor do cotovelo em direção ao ombro
        const dx = pShoulder.x - pElbow.x
        const dy = pShoulder.y - pElbow.y
        const targetWristX = pElbow.x + dx * 0.9
        const targetWristY = pElbow.y + dy * 0.9
        drawGhostLimb(ctx, pElbow, { x: targetWristX, y: targetWristY })
    }

    // Texto de Feedback (Estilizado)
    ctx.font = 'bold 20px Poppins, Arial'
    ctx.fillStyle = '#fff'
    // Fundo do texto
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(5, 10, 220, 100)
    
    ctx.fillStyle = '#fff'
    ctx.fillText(`Bíceps: ${bicepsAngle.toFixed(0)}°`, 15, 40)
    ctx.fillText(`Postura: ${formAngle.toFixed(0)}°`, 15, 70)

    // validador da postura
    const isFormCorrect = formAngle < 35

    if (!isFormCorrect) {
        ctx.fillStyle = '#ff4444'
        ctx.fillText(`COTOVELO FIXO!`, 15, 100)
        setMessage('Arrume a postura!')
    } else {
        ctx.fillStyle = '#00ff00'
        ctx.fillText(`Postura OK`, 15, 100)
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
            handleRepCompletion('biceps')
            setMessage('BOA!')
        } else {
            setMessage('Roubou (Postura)')
        }
    } else if (bicepsAngle < 90 && stageRef.current === 'down') {
         if(isFormCorrect) setMessage('Mais alto!')
    }
    return isFormCorrect
}
