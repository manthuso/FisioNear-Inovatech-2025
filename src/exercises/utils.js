export const getPixelCoords = (landmark, width, height) => ({
  x: landmark.x * width,
  y: landmark.y * height
})

export const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    if (angle > 180) angle = 360 - angle
    return angle
}

export const smoothValue = (key, newValue, cache) => {
    const prev = cache[key] || newValue
    // SmoothAngle = (AngleAtual * 0.2) + (AngleAnterior * 0.8)
    const smoothed = (newValue * 0.2) + (prev * 0.8)
    cache[key] = smoothed
    return smoothed
}

export const getColorForProgress = (progress) => {
    // Red (0) -> Yellow (0.5) -> Green (1)
    const p = Math.max(0, Math.min(1, progress))
    const r = p < 0.5 ? 255 : Math.round(255 * (1 - (p - 0.5) * 2))
    const g = p < 0.5 ? Math.round(255 * (p * 2)) : 255
    return `rgb(${r}, ${g}, 0)`
}

export const drawProgressArc = (ctx, center, radius, progress, color) => {
    // Fundo do arco
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 8
    ctx.stroke()

    // Arco de progresso
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, -Math.PI / 2, -Math.PI / 2 + (progress * 2 * Math.PI))
    ctx.strokeStyle = color
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.stroke()
}

export const drawGhostLimb = (ctx, start, end) => {
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.lineWidth = 12
    ctx.setLineDash([5, 10])
    ctx.stroke()
    ctx.setLineDash([])
}
