/*
  Shared canvas drawing helpers.

  initCanvas(id)  — sets up mouse/touch drawing
  clearCanvas(id) — fills the canvas black
  getPixels(id)   — returns a 784-element array (28x28, values 0-1)
*/

function initCanvas(id) {
  const canvas = document.getElementById(id)
  const ctx    = canvas.getContext('2d')

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'white'
  ctx.lineWidth   = 20
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'

  let drawing = false, lx = 0, ly = 0

  function start(x, y) { drawing = true; lx = x; ly = y }
  function move(x, y) {
    if (!drawing) return
    ctx.beginPath()
    ctx.moveTo(lx, ly)
    ctx.lineTo(x, y)
    ctx.stroke()
    lx = x; ly = y
  }
  function stop() { drawing = false }

  canvas.addEventListener('mousedown',  e => start(e.offsetX, e.offsetY))
  canvas.addEventListener('mousemove',  e => move(e.offsetX, e.offsetY))
  canvas.addEventListener('mouseup',    stop)
  canvas.addEventListener('mouseleave', stop)

  canvas.addEventListener('touchstart', e => {
    e.preventDefault()
    const r = canvas.getBoundingClientRect(), t = e.touches[0]
    start(t.clientX - r.left, t.clientY - r.top)
  }, { passive: false })
  canvas.addEventListener('touchmove', e => {
    e.preventDefault()
    const r = canvas.getBoundingClientRect(), t = e.touches[0]
    move(t.clientX - r.left, t.clientY - r.top)
  }, { passive: false })
  canvas.addEventListener('touchend', stop)
}

function clearCanvas(id) {
  const canvas = document.getElementById(id)
  const ctx    = canvas.getContext('2d')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function getPixels(id) {
  const canvas = document.getElementById(id)
  const off    = document.createElement('canvas')
  off.width = 28; off.height = 28
  off.getContext('2d').drawImage(canvas, 0, 0, 28, 28)
  const imgData = off.getContext('2d').getImageData(0, 0, 28, 28)
  return Array.from({ length: 28 * 28 }, (_, i) => imgData.data[i * 4] / 255)
}
