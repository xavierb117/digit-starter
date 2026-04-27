/*
  Digit Recognizer — Node.js server

  Routes:
    GET  /         -> server.html  (model runs here on the server)
    GET  /browser  -> browser.html (model runs in the browser via TF.js)
    POST /predict  -> receives 28x28 pixel array, returns predicted digit
*/

const express = require('express')
const ort     = require('onnxruntime-node')
const path    = require('path')

const app = express()
app.use(express.json())
app.use(express.static(__dirname))


// ── Load model ────────────────────────────────────────────────────────────────
// TODO: load your model here
const sessionPromise = ort.InferenceSession.create('./digit_model.onnx');



sessionPromise && sessionPromise
  .then(() => {
    console.log('Model loaded.')
    console.log('Server-side:  http://localhost:8080/')
    console.log('Browser-side: http://localhost:8080/browser')
  })
  .catch(err => {
    console.error('Could not load model:', err.message)
  })


// ── Preprocessing ─────────────────────────────────────────────────────────────
// Mirrors bbox_normalize() from your training pipeline.
// Crops to the bounding box of the drawn digit, then resizes back to 28x28.
// The preprocessing at inference time must match what was used during training.

function bboxNormalize(pixels, pad = 2) {
  let r0 = 27, r1 = 0, c0 = 27, c1 = 0

  for (let r = 0; r < 28; r++) {
    for (let c = 0; c < 28; c++) {
      if (pixels[r * 28 + c] > 0.2) {
        if (r < r0) r0 = r;  if (r > r1) r1 = r
        if (c < c0) c0 = c;  if (c > c1) c1 = c
      }
    }
  }

  if (r0 > r1) return pixels  // blank canvas

  r0 = Math.max(0,  r0 - pad);  r1 = Math.min(27, r1 + pad)
  c0 = Math.max(0,  c0 - pad);  c1 = Math.min(27, c1 + pad)

  const cropH = r1 - r0 + 1
  const cropW = c1 - c0 + 1
  const out   = new Float32Array(28 * 28)

  for (let r = 0; r < 28; r++) {
    for (let c = 0; c < 28; c++) {
      const srcR = r0 + (r / 27) * (cropH - 1)
      const srcC = c0 + (c / 27) * (cropW - 1)
      const r1i  = Math.floor(srcR),  r2i = Math.min(27, r1i + 1)
      const c1i  = Math.floor(srcC),  c2i = Math.min(27, c1i + 1)
      const dr   = srcR - r1i,        dc  = srcC - c1i

      out[r * 28 + c] =
        pixels[r1i * 28 + c1i] * (1 - dr) * (1 - dc) +
        pixels[r1i * 28 + c2i] * (1 - dr) * dc        +
        pixels[r2i * 28 + c1i] * dr        * (1 - dc) +
        pixels[r2i * 28 + c2i] * dr        * dc
    }
  }

  return out
}


// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'server.html'))
})

app.get('/browser', (req, res) => {
  res.sendFile(path.join(__dirname, 'browser.html'))
})

app.post('/predict', async (req, res) => {
  // pixels: 784 floats (28x28, white digit on black, downsampled client-side)
  const pixels     = new Float32Array(req.body.pixels)
  const normalized = bboxNormalize(pixels)

  // Wrap in an ONNX tensor: shape [batch, height, width, channels]
  const tensor = new ort.Tensor('float32', normalized, [1, 28, 28, 1])

  // TODO: run inference here
  // 1. Await sessionPromise to get the loaded session
  // 2. Call session.run() with the tensor, using session.inputNames[0] as the key
  // 3. Extract the probability array from results[session.outputNames[0]].data
  // 4. Find the digit with the highest probability

  const session = await sessionPromise;

  const inputName = session.inputNames[0];
  const feeds = {};
  feeds[inputName] = tensor;

  // Run model
  const results = await session.run(feeds);

  // Get output (usually first key)
  const output = results[Object.keys(results)[0]];

  // Convert to normal JS array
  const probs = Array.from(output.data);

  // Get predicted digit
  const digit = probs.indexOf(Math.max(...probs));


  res.json({ digit, confidence: probs[digit], probs: Array.from(probs) })
})


app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080')
})
