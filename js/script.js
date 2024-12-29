const canvas = document.getElementById("rouletteCanvas");
const ctx = canvas.getContext("2d");
const resultDisplay = document.getElementById("result");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const colors = ["#9E2A2B", "#335C67", "#E09F3E", "#E1CE7A", "#540B0E"];
const sections = ["10万円", "1万円", "5000円", "1000円", "100円"];
const sectionSizes = [0.1, 1, 1, 1, 1];
const totalSize = sectionSizes.reduce((a, b) => a + b, 0);
const angles = sectionSizes.map(size => (2 * Math.PI * size) / totalSize);

let angle = 0;
let spinning = false;
let speed = 0;
let stopRequested = false;
let isReDrawing = false;
function drawRoulette() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let startAngle = angle;
    for (let i = 0; i < sections.length; i++) {
        const endAngle = startAngle + angles[i];
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((startAngle + endAngle) / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "20px Arial";
        ctx.fillText(sections[i], canvas.width / 2 - 20, 10);
        ctx.restore();
        startAngle = endAngle;
    }
    // ライン (当たりのマーカー)
    ctx.strokeStyle = "#fff64c";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2); 
    ctx.stroke();
}

function spinRoulette() {
    if (!spinning) return;
    // 減速
    if (stopRequested) {
        speed *= 0.97;
        if (speed < 0.01) {
            spinning = false;
            stopRequested = false;
            checkResult();
            return;
        }
    }
    angle += speed;
    drawRoulette();
    requestAnimationFrame(spinRoulette);
}

function checkResult() {
    let startAngle = 0;
    let selectedIndex = -1;
    for (let i = 0; i < angles.length; i++) {
        const endAngle = startAngle + angles[i];
        const adjustedAngle = (2 * Math.PI - (angle % (2 * Math.PI))) % (2 * Math.PI);
        if (adjustedAngle >= startAngle && adjustedAngle < endAngle) {
            selectedIndex = i;
            break;
        }
        startAngle = endAngle;
    }
    // 10万円の場合の処理
    if (sections[selectedIndex] === "10万円") {
        // 「10万円」の場合は再抽選
        resultDisplay.textContent = "再抽選中...";
        setTimeout(() => {
            startReSpin();
        }, 500);
    } else {
        // 10万円以外が選ばれた場合はその結果を表示
        resultDisplay.textContent = `今年のお年玉は... ${sections[selectedIndex]}`;
        stopButton.disabled = true;
        startButton.disabled = false;
    }
}

function startReSpin() {
    // 10万円以外が出るまで回転を続ける
    spinning = true;
    speed = Math.random() * 0.3 + 0.2;
    stopRequested = false;
    stopButton.disabled = false;
    startButton.disabled = true;
    spinRoulette();
}

startButton.addEventListener("click", () => {
    if (!spinning) {
        spinning = true;
        speed = Math.random() * 0.3 + 0.2;
        stopRequested = false;
        resultDisplay.textContent = "今年のお年玉は...";
        stopButton.disabled = false;
        startButton.disabled = true;
        spinRoulette();
    }
});

stopButton.addEventListener("click", () => {
    if (spinning) {
        stopRequested = true;
        stopButton.disabled = true;
        startButton.disabled = false;
    }
});

document.addEventListener('DOMContentLoaded',() => {
  const audio = document.getElementById('bgm');
  audio.volume = 0.3;
});

document.getElementById('startButton').addEventListener('click', function() {
  const audio = document.getElementById('start-audio');
  audio.play();
});

document.getElementById('stopButton').addEventListener('click', function() {
  const audio = document.getElementById('stop-audio');
  audio.play();
});

drawRoulette();
