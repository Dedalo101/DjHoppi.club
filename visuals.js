// Hop flower rain only, triggered by mouse move/touch
const plantCanvas = document.getElementById('plantCanvas');
const hopsCanvas = document.getElementById('hopsCanvas');

if (plantCanvas && hopsCanvas) {
  const parent = hopsCanvas.parentElement;
  plantCanvas.width = hopsCanvas.width = parent.offsetWidth;
  plantCanvas.height = hopsCanvas.height = parent.offsetHeight;
  const hopsCtx = hopsCanvas.getContext('2d');

  function createHopFlower(x = null, y = null) {
    return {
      x: x !== null ? x : Math.random() * hopsCanvas.width,
      y: y !== null ? y : -30,
      r: 18 + Math.random() * 10,
      speed: 1.2 + Math.random() * 1.8,
      popped: false,
      popProgress: 0
    };
  }

  let hopFlowers = [];

  function spawnHopFlowers(count, x = null) {
    for (let i = 0; i < count; i++) {
      let fx = x !== null ? x + (Math.random() - 0.5) * 60 : null;
      hopFlowers.push(createHopFlower(fx));
    }
  }

  // Desktop: rain on mousemove
  plantCanvas.addEventListener('mousemove', e => {
    const rect = plantCanvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (plantCanvas.width / rect.width);
    spawnHopFlowers(6, mx);
  });
  // Mobile: rain on touch
  plantCanvas.addEventListener('touchmove', e => {
    const rect = plantCanvas.getBoundingClientRect();
    for (let t of e.touches) {
      const mx = (t.clientX - rect.left) * (plantCanvas.width / rect.width);
      spawnHopFlowers(6, mx);
    }
  });

  function drawHopFlower(ctx, hop, time) {
    ctx.save();
    ctx.translate(hop.x, hop.y);
    let scale = hop.r / 24;
    ctx.scale(scale, scale);
    const hue = (time / 40 + hop.x + hop.y) % 360;
    for (let layer = 0; layer < 5; layer++) {
      ctx.beginPath();
      let yOffset = 7 * layer;
      let width = 14 - layer * 2.2;
      let height = 10 - layer * 1.5;
      ctx.ellipse(0, yOffset, width, height, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.globalAlpha = 0.7 - layer * 0.11;
      ctx.fillStyle = `hsl(${hue + layer * 8}, 80%, ${68 - layer * 7}%)`;
      ctx.shadowColor = `hsl(${hue + layer * 8}, 60%, 40%)`;
      ctx.shadowBlur = 7 - layer * 1.5;
      ctx.fill();
    }
    ctx.restore();
  }
  function drawPop(ctx, hop) {
    ctx.save();
    ctx.translate(hop.x, hop.y);
    let progress = hop.popProgress;
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / 8);
      ctx.beginPath();
      ctx.arc(0, 0, 10 + progress * 30, 0, Math.PI * 2);
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = `rgba(178,255,89,${0.7 * (1 - progress)})`;
      ctx.lineWidth = 2 + 6 * (1 - progress);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  hopsCanvas.addEventListener('click', function(e) {
    const rect = hopsCanvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (hopsCanvas.width / rect.width);
    const my = (e.clientY - rect.top) * (hopsCanvas.height / rect.height);
    for (let hop of hopFlowers) {
      if (!hop.popped && Math.hypot(mx - hop.x, my - hop.y) < hop.r) {
        hop.popped = true;
        hop.popProgress = 0;
      }
    }
  });

  function animate(time) {
    hopsCtx.clearRect(0, 0, hopsCanvas.width, hopsCanvas.height);
    for (let hop of hopFlowers) {
      if (!hop.popped) {
        drawHopFlower(hopsCtx, hop, time);
        hop.y += hop.speed;
      } else {
        drawPop(hopsCtx, hop);
        hop.popProgress += 0.04;
      }
    }
    hopFlowers = hopFlowers.filter(hop => (!hop.popped && hop.y < hopsCanvas.height + 40) || (hop.popped && hop.popProgress < 1));
    requestAnimationFrame(animate);
  }
  animate(0);
}

// --- Hop Flower Rain Logic ---
function createHopFlower() {
  return {
    x: Math.random() * hopsCanvas.width,
    y: -30,
    r: 22 + Math.random() * 8,
    speed: 1.2 + Math.random() * 1.2,
    popped: false,
    popProgress: 0
  };
}
let hopFlowers = [];
function spawnHopFlowers() {
  for (let i = 0; i < 5; i++) {
    hopFlowers.push(createHopFlower());
  }
}
spawnHopFlowers();
setInterval(spawnHopFlowers, 10000);
function drawHopFlower(ctx, hop, time) {
  ctx.save();
  ctx.translate(hop.x, hop.y);
  let scale = hop.r / 24;
  ctx.scale(scale, scale);
  const hue = (time / 40 + hop.x + hop.y) % 360;
  for (let layer = 0; layer < 5; layer++) {
    ctx.beginPath();
    let yOffset = 7 * layer;
    let width = 14 - layer * 2.2;
    let height = 10 - layer * 1.5;
    ctx.ellipse(0, yOffset, width, height, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.globalAlpha = 0.7 - layer * 0.11;
    ctx.fillStyle = `hsl(${hue + layer * 8}, 80%, ${68 - layer * 7}%)`;
    ctx.shadowColor = `hsl(${hue + layer * 8}, 60%, 40%)`;
    ctx.shadowBlur = 7 - layer * 1.5;
    ctx.fill();
  }
  ctx.restore();
}
function drawPop(ctx, hop) {
  ctx.save();
  ctx.translate(hop.x, hop.y);
  let progress = hop.popProgress;
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 8);
    ctx.beginPath();
    ctx.arc(0, 0, 10 + progress * 30, 0, Math.PI * 2);
    ctx.globalAlpha = 1 - progress;
    ctx.strokeStyle = `rgba(178,255,89,${0.7 * (1 - progress)})`;
    ctx.lineWidth = 2 + 6 * (1 - progress);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
hopsCanvas.addEventListener('click', function(e) {
  const rect = hopsCanvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (hopsCanvas.width / rect.width);
  const my = (e.clientY - rect.top) * (hopsCanvas.height / rect.height);
  for (let hop of hopFlowers) {
    if (!hop.popped && Math.hypot(mx - hop.x, my - hop.y) < hop.r) {
      hop.popped = true;
      hop.popProgress = 0;
    }
  }
});
