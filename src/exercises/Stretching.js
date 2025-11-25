import { calculateAngle, getPixelCoords, smoothValue, getColorForProgress, drawProgressArc } from './utils'

export const processStretching = (lm, ctx, { stageRef, smoothedAnglesRef, exerciseDataRef }, { setMessage, handleRepCompletion }) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    
    // Landmarks
    const leftShoulder = lm[11]
    const rightShoulder = lm[12]
    const leftElbow = lm[13]
    const rightElbow = lm[14]
    const leftWrist = lm[15]
    const rightWrist = lm[16]
    const nose = lm[0]

    // Check visibility
    if (leftShoulder.visibility < 0.5 || rightShoulder.visibility < 0.5 || 
        leftWrist.visibility < 0.5 || rightWrist.visibility < 0.5) {
        ctx.fillStyle = '#ffff00'
        ctx.font = 'bold 24px Poppins, Arial'
        ctx.fillText('Posicione-se melhor', 10, 40)
        return false
    }

    // Logic: Arms Overhead Stretch
    // Check if wrists are above nose (y is smaller is higher)
    const isArmsUp = leftWrist.y < nose.y && rightWrist.y < nose.y
    
    // Check if arms are relatively straight
    const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist)
    const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist)
    
    // Smooth angles
    const sLeftArm = smoothValue('leftArmStretch', leftArmAngle, smoothedAnglesRef.current)
    const sRightArm = smoothValue('rightArmStretch', rightArmAngle, smoothedAnglesRef.current)

    const isStraight = sLeftArm > 140 && sRightArm > 140

    // Visual Feedback
    const pLeftWrist = getPixelCoords(leftWrist, width, height)
    const pRightWrist = getPixelCoords(rightWrist, width, height)
    const pLeftShoulder = getPixelCoords(leftShoulder, width, height)
    const pRightShoulder = getPixelCoords(rightShoulder, width, height)

    // Draw lines
    ctx.beginPath()
    ctx.moveTo(pLeftShoulder.x, pLeftShoulder.y)
    ctx.lineTo(pLeftWrist.x, pLeftWrist.y)
    ctx.moveTo(pRightShoulder.x, pRightShoulder.y)
    ctx.lineTo(pRightWrist.x, pRightWrist.y)
    ctx.strokeStyle = isArmsUp && isStraight ? '#00ff00' : '#ffffff'
    ctx.lineWidth = 4
    ctx.stroke()

    // State Machine for Holding
    if (!exerciseDataRef.current) {
        exerciseDataRef.current = { holdStartTime: null }
    }

    const HOLD_DURATION = 5000 // 5 seconds

    if (isArmsUp && isStraight) {
        if (stageRef.current !== 'holding') {
            stageRef.current = 'holding'
            exerciseDataRef.current.holdStartTime = Date.now()
        }

        const elapsed = Date.now() - exerciseDataRef.current.holdStartTime
        const progress = Math.min(elapsed / HOLD_DURATION, 1)
        
        // Draw Timer/Progress
        ctx.fillStyle = '#00ff00'
        ctx.font = 'bold 30px Poppins'
        ctx.fillText(`SEGURE: ${(elapsed / 1000).toFixed(1)}s`, width / 2 - 80, 50)

        // Draw Progress Circle around user or center
        drawProgressArc(ctx, { x: width/2, y: 100 }, 40, progress, '#00ff00')

        if (elapsed >= HOLD_DURATION) {
            handleRepCompletion('stretching')
            setMessage('ALONGAMENTO CONCLUÍDO!')
            stageRef.current = 'cooldown' // Wait for user to lower arms
            exerciseDataRef.current.holdStartTime = null
        } else {
            setMessage('MANTENHA...')
        }

    } else {
        // Reset if arms drop
        if (stageRef.current === 'holding') {
            setMessage('NÃO PARE AGORA!')
            // Optional: Reset timer or pause? Let's reset for strictness
            stageRef.current = 'neutral'
            exerciseDataRef.current.holdStartTime = null
        } else if (stageRef.current === 'cooldown') {
             // Wait until arms are down to reset to neutral
             if (!isArmsUp) {
                 stageRef.current = 'neutral'
                 setMessage('Prepare-se')
             } else {
                 setMessage('Relaxe os braços')
             }
        } else {
            stageRef.current = 'neutral'
            setMessage('Levante os braços')
            exerciseDataRef.current.holdStartTime = null
        }
    }
}
