import { calculateAngle, getPixelCoords, smoothValue, getColorForProgress, drawProgressArc, drawGhostLimb } from './utils'

export const processSquat = (lm, ctx, { stageRef, smoothedAnglesRef }, { setMessage, handleRepCompletion }) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height

    const hip = lm[23] // Quadril esquerdo
    const knee = lm[25] // Joelho esquerdo
    const ankle = lm[27] // Tornozelo esquerdo
    const shoulder = lm[11] // Ombro esquerdo

    // Check visibility
    if (hip.visibility < 0.5 || knee.visibility < 0.6 || ankle.visibility < 0.6) {
        ctx.fillStyle = '#ffff00'
        ctx.font = 'bold 24px Poppins, Arial'
        ctx.fillText('Posicione-se melhor', 10, 40)
        return false
    }

    const rawKneeAngle = calculateAngle(hip, knee, ankle)
    const rawHipAngle = calculateAngle(shoulder, hip, knee) // Tronco

    // Aplicar suavização (EMA)
    const kneeAngle = smoothValue('knee', rawKneeAngle, smoothedAnglesRef.current)
    const hipAngle = smoothValue('hip', rawHipAngle, smoothedAnglesRef.current)

    // --- Visual Feedback Avançado ---
    const pHip = getPixelCoords(hip, width, height)
    const pKnee = getPixelCoords(knee, width, height)
    const pAnkle = getPixelCoords(ankle, width, height)

    // Progresso: 170° (em pé) -> 80° (agachado)
    const progress = Math.max(0, Math.min(1, (170 - kneeAngle) / (170 - 80)))
    const color = getColorForProgress(progress)

    // 1. Barra de Progresso no Joelho
    drawProgressArc(ctx, pKnee, 45, progress, color)

    // 2. Indicador de Ângulo Colorido (Perna)
    ctx.beginPath()
    ctx.moveTo(pHip.x, pHip.y)
    ctx.lineTo(pKnee.x, pKnee.y)
    ctx.lineTo(pAnkle.x, pAnkle.y)
    ctx.strokeStyle = color
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.stroke()

    // 3. Ghost Overlay
    if (stageRef.current === 'up') {
        // Meta: Coxa paralela ao chão
        const thighLen = Math.sqrt(Math.pow(pHip.x - pKnee.x, 2) + Math.pow(pHip.y - pKnee.y, 2))
        const direction = pHip.x > pKnee.x ? 1 : -1
        const targetHipX = pKnee.x + (thighLen * direction) // Coxa horizontal
        const targetHipY = pKnee.y // Mesma altura do joelho
        
        drawGhostLimb(ctx, pKnee, { x: targetHipX, y: targetHipY })
    }

    // Texto
    ctx.font = 'bold 20px Poppins, Arial'
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(5, 10, 220, 100)

    ctx.fillStyle = '#fff'
    ctx.fillText(`Joelho: ${kneeAngle.toFixed(0)}°`, 15, 40)
    ctx.fillText(`Tronco: ${hipAngle.toFixed(0)}°`, 15, 70)

    // Validador de postura 
    const isFormCorrect = hipAngle > 80 

    if (!isFormCorrect) {
        ctx.fillStyle = '#ff4444'
        ctx.fillText(`TRONCO ERETO!`, 15, 100)
        setMessage('Arrume a postura!')
    } else {
        ctx.fillStyle = '#00ff00'
        ctx.fillText(`Postura OK`, 15, 100)
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
            handleRepCompletion('squat')
            setMessage('SUBIU!')
        } else {
             setMessage('Roubou (Postura)')
        }
    } else if (kneeAngle < 140 && stageRef.current === 'up') {
        if(isFormCorrect) setMessage('Mais baixo!')
    }
    
    return isFormCorrect 
}
