const sounds = ["Kick", "Snare", "Clap", "HiHat"];
const steps = 16;

const sequencer = document.getElementById("sequencer");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const bpmInput = document.getElementById("bpmInput");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");

const kickSelect = document.getElementById("kickSelect");
const snareSelect = document.getElementById("snareSelect");
const clapSelect = document.getElementById("clapSelect");
const hatSelect = document.getElementById("hatSelect");

let rows = [];
let currentStep = 0;
let interval;
let isPlaying = false;

function triggerSound(name) {
  let samplePath;

  if (name === "Kick") samplePath = kickSelect.value;
  if (name === "Snare") samplePath = snareSelect.value;
  if (name === "Clap") samplePath = clapSelect.value;
  if (name === "HiHat") samplePath = hatSelect.value;

  if (!samplePath) return;

  const audio = new Audio(samplePath);
  audio.currentTime = 0;
  audio.play();
}

sounds.forEach((sound) => {
  const row = document.createElement("div");
  row.classList.add("sequencer-row");

  const label = document.createElement("span");
  label.textContent = sound === "HiHat" ? "Hi-Hat" : sound;
  label.classList.add("sound-label");

  row.appendChild(label);

  const rowSteps = [];

  for (let i = 0; i < steps; i++) {
    const step = document.createElement("button");
    step.classList.add("step");

    if (i === 0 || i === 4 || i === 8 || i === 12) {
      step.classList.add("bar-step");
    }

    step.addEventListener("click", () => {
      step.classList.toggle("active");
    });

    row.appendChild(step);
    rowSteps.push(step);
  }

  rows.push({ sound, steps: rowSteps });
  sequencer.appendChild(row);
});

const defaultPattern = {
    Kick: [0, 1, 6, 8, 14],
    Snare: [2, 10, 15],
    Clap: [4, 12],
    HiHat: [0, 2, 4, 6, 8, 9, 10, 12, 13, 14]
  };
  
  function loadDefaultPattern() {
    rows.forEach((row) => {
      row.steps.forEach((step, index) => {
        if (defaultPattern[row.sound].includes(index)) {
          step.classList.add("active");
        }
      });
    });
  }
  
  loadDefaultPattern();

function runSequencer() {
  rows.forEach((row) => {
    row.steps.forEach((step, i) => {
      step.classList.remove("playing");

      if (i === currentStep) {
        step.classList.add("playing");

        if (step.classList.contains("active")) {
          triggerSound(row.sound);
        }
      }
    });
  });

  currentStep++;

  if (currentStep >= steps) {
    currentStep = 0;
  }
}

function startSequencer() {
  clearInterval(interval);

  const bpm = Number(bpmInput.value);
  const stepDuration = (60000 / bpm) / 4;

  interval = setInterval(runSequencer, stepDuration);
  isPlaying = true;
}

function stopSequencer() {
  clearInterval(interval);
  isPlaying = false;
  currentStep = 0;

  rows.forEach((row) => {
    row.steps.forEach((step) => {
      step.classList.remove("playing");
    });
  });
}

playBtn.addEventListener("click", startSequencer);
stopBtn.addEventListener("click", stopSequencer);

clearBtn.addEventListener("click", () => {
    rows.forEach((row) => {
      row.steps.forEach((step) => {
        step.classList.remove("active");
      });
    });
  
    stopSequencer();
  });

bpmInput.addEventListener("change", () => {
  if (isPlaying) {
    startSequencer();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();

    if (isPlaying) {
      stopSequencer();
    } else {
      startSequencer();
    }
  }

  const key = event.key.toLowerCase();

  if (key === "a") triggerSound("Kick");
  if (key === "s") triggerSound("Snare");
  if (key === "d") triggerSound("Clap");
  if (key === "f") triggerSound("HiHat");
});

async function loadAudioBuffer(audioContext, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  }
  
  async function downloadLoop() {
    const bpm = Number(bpmInput.value);
    const stepDuration = (60 / bpm) / 4;
    const loopBars = 2;
    const totalSteps = steps * loopBars;
    const totalDuration = stepDuration * totalSteps;
  
    const offlineCtx = new OfflineAudioContext(
      2,
      44100 * totalDuration,
      44100
    );
  
    const sampleMap = {
      Kick: kickSelect.value,
      Snare: snareSelect.value,
      Clap: clapSelect.value,
      HiHat: hatSelect.value
    };
  
    const buffers = {};
  
    for (const sound of sounds) {
      buffers[sound] = await loadAudioBuffer(offlineCtx, sampleMap[sound]);
    }
  
    for (let loop = 0; loop < loopBars; loop++) {
      rows.forEach((row) => {
        row.steps.forEach((step, index) => {
          if (step.classList.contains("active")) {
            const source = offlineCtx.createBufferSource();
            source.buffer = buffers[row.sound];
            source.connect(offlineCtx.destination);
  
            const startTime = (loop * steps + index) * stepDuration;
            source.start(startTime);
          }
        });
      });
    }
  
    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = audioBufferToWav(renderedBuffer);
  
    const url = URL.createObjectURL(wavBlob);
    const link = document.createElement("a");
  
    link.href = url;
    link.download = "browser-beat-machine-loop.wav";
    link.click();
  
    URL.revokeObjectURL(url);
  }
  
  function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
  
    let samples;
  
    if (numChannels === 2) {
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);
      samples = interleave(left, right);
    } else {
      samples = buffer.getChannelData(0);
    }
  
    const dataLength = samples.length * 2;
    const bufferArray = new ArrayBuffer(44 + dataLength);
    const view = new DataView(bufferArray);
  
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bitDepth / 8, true);
    view.setUint16(32, numChannels * bitDepth / 8, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, "data");
    view.setUint32(40, dataLength, true);
  
    floatTo16BitPCM(view, 44, samples);
  
    return new Blob([view], { type: "audio/wav" });
  }
  
  function interleave(left, right) {
    const result = new Float32Array(left.length + right.length);
    let index = 0;
  
    for (let i = 0; i < left.length; i++) {
      result[index++] = left[i];
      result[index++] = right[i];
    }
  
    return result;
  }
  
  function floatTo16BitPCM(view, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }
  }
  
  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  
  downloadBtn.addEventListener("click", downloadLoop);