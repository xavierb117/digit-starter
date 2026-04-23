# Digit Recognizer — Deploy Starter

## Setup

**1. Install Node.js** from [nodejs.org](https://nodejs.org) (LTS version)

**2. Copy your model files** from Colab into this folder:
- `digit_model.onnx`
- `model/` folder (the TF.js version)

**3. Install dependencies**
```
npm install
```

**4. Start the server**
```
node server.js
```

Open **http://localhost:8080** for server-side inference  
Open **http://localhost:8080/browser** for browser-side inference

---

## What to fill in

There are two `TODO` comments to complete before the app works:

**`server.js`** — load the ONNX model and run inference in `/predict`

**`browser.html`** — call `model.predict()` and extract the result

The lesson walkthrough explains exactly what code to add.
