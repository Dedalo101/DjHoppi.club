// Simple generative hops and bubbles demo

const plantCanvas = document.getElementById('plantCanvas');
const hopsCanvas = document.getElementById('hopsCanvas');
const bubblesCanvas = document.getElementById('bubblesCanvas');

if (plantCanvas && hopsCanvas && bubblesCanvas) {
  // Set all canvas sizes
  const parent = hopsCanvas.parentElement;
  plantCanvas.width = hopsCanvas.width = bubblesCanvas.width = parent.offsetWidth;
  plantCanvas.height = hopsCanvas.height = bubblesCanvas.height = parent.offsetHeight;
  const plantCtx = plantCanvas.getContext('2d');
  const hopsCtx = hopsCanvas.getContext('2d');
  const bubblesCtx = bubblesCanvas.getContext('2d');

  // Bubble parameters: always start from the bottom
  const bubbleCount = 20;
  const bubbles = Array.from({ length: bubbleCount }, (_, i) => ({
    x: Math.random() * bubblesCanvas.width,
    y: bubblesCanvas.height + Math.random() * 40, // always start at or just below bottom
    r: 10 + Math.random() * 20,
    speed: 0.3 + Math.random() * 0.3, // slower speed
    phase: Math.random() * Math.PI * 2,
    oscillate: 20 + Math.random() * 20
  }));

  // Hop parameters
  const hopCount = 5;
  const hops = Array.from({ length: hopCount }, (_, i) => ({
    x: Math.random() * hopsCanvas.width,
    y: Math.random() * hopsCanvas.height,
    scale: 0.5 + Math.random(),
    meltPhase: Math.random() * Math.PI * 2
  }));

  function drawHop(x, y, scale, melt) {
    hopsCtx.save();
    hopsCtx.translate(x, y);
    hopsCtx.scale(scale, scale);
    hopsCtx.beginPath();
    hopsCtx.moveTo(0, 0);
    // Melting effect: distort the petal length
    for (let i = 0; i < 7; i++) {
      const angle = Math.PI * 2 * i / 7;
      const meltOffset = Math.sin(melt + angle * 2) * 4;
      hopsCtx.rotate(Math.PI / 3.5);
      hopsCtx.lineTo(0, 20 + meltOffset);
      hopsCtx.rotate(Math.PI / 3.5);
      hopsCtx.lineTo(0, 0);
    }
    hopsCtx.closePath();
    hopsCtx.fillStyle = 'rgba(178,255,89,0.7)';
    hopsCtx.shadowColor = 'rgba(50,100,20,0.3)';
    hopsCtx.shadowBlur = 8;
    hopsCtx.fill();
    hopsCtx.restore();
  }

  function drawBubbles(time) {
    bubblesCtx.clearRect(0, 0, bubblesCanvas.width, bubblesCanvas.height);
    // Animate bubble color
    const hue = (time / 40) % 360;
    for (let i = 0; i < bubbleCount; i++) {
      let b = bubbles[i];
      // Oscillate laterally
      let lateral = Math.sin(time / 800 + b.phase + b.y / 50) * b.oscillate;
      b.y -= b.speed;
      if (b.y < -b.r) {
        b.y = bubblesCanvas.height + b.r;
        b.x = Math.random() * bubblesCanvas.width;
        b.phase = Math.random() * Math.PI * 2;
      }
      bubblesCtx.beginPath();
      bubblesCtx.arc(b.x + lateral, b.y, b.r, 0, 2 * Math.PI);
      // Animate color
      let bubbleHue = (hue + b.phase * 60) % 360;
      bubblesCtx.fillStyle = `hsla(${bubbleHue}, 80%, 85%, 0.22)`;
      bubblesCtx.fill();
    }
  }


  // --- Hop Plant Growth ---


  // --- Multi-plant State ---
  let mouseX = plantCanvas.width / 2;
  plantCanvas.addEventListener('mousemove', e => {
    const rect = plantCanvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (plantCanvas.width / rect.width);
  });

  let isMobile = window.innerWidth <= 600;
  const PLANT_COUNT = isMobile ? 3 : 5;
  let plants = [];
  function resetPlants() {
    plants = [];
    for (let i = 0; i < PLANT_COUNT; i++) {
      let x = plantCanvas.width * (0.15 + 0.7 * i / (PLANT_COUNT - 1));
      plants.push({
        stems: [
          {
            x: x,
            y: plantCanvas.height - 2,
            angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.18,
            length: 0,
            maxLength: isMobile ? 90 + Math.random() * 30 : 160 + Math.random() * 40,
            thickness: isMobile ? 2.5 : 4.5,
            grown: false,
            children: [],
            parent: null
          }
        ],
        finished: false
      });
    }
  }
  resetPlants();



  function growStem(stem, depth = 0) {
    // Smooth, slower growth for natural look
    const growthSpeed = (isMobile ? 0.7 : 1.1) * (0.7 + Math.random() * 0.2);
    if (depth === 0 && PLANT_COUNT === 1) {
      // Only center plant follows mouse if single plant
      stem.x += (mouseX - stem.x) * 0.04;
    }
    if (stem.length < stem.maxLength) {
      stem.length += growthSpeed;
    } else if (!stem.grown && depth < (isMobile ? 2 : 3)) {
      // More branches, shorter, but only after main stem is fully grown
      let branches = (depth === 0) ? (isMobile ? 3 : 5) : (isMobile ? 2 : 3);
      for (let i = 0; i < branches; i++) {
        let spread = (Math.PI / 1.7) * (i / (branches - 1) - 0.5);
        let angle = stem.angle + spread + (Math.random() - 0.5) * 0.12;
        let maxLength = (isMobile ? 38 : 60) + Math.random() * (isMobile ? 10 : 18) * (1 - depth * 0.18);
        let thickness = Math.max(1.2, stem.thickness * (0.6 + Math.random() * 0.2));
        let child = {
          x: stem.x + Math.cos(stem.angle) * stem.maxLength,
          y: stem.y + Math.sin(stem.angle) * stem.maxLength,
          angle,
          length: 0,
          maxLength,
          thickness,
          grown: false,
          children: [],
          parent: stem
        };
        stem.children.push(child);
      }
      stem.grown = true;
    }
    for (let child of stem.children) growStem(child, depth + 1);
  }


  // Recursively check if all tips have flowered (i.e., all leaves are at max length and have no children)
  function allTipsFlowered(stem) {
    if (stem.children.length === 0 && stem.length >= stem.maxLength) {
      return true;
    }
    return stem.children.every(child => allTipsFlowered(child));
  }

  function drawStem(ctx, stem, depth = 0, time = 0, fade = 0) {
    ctx.save();
    // Animate stem color
    const hue = (time / 40 + depth * 30) % 360;
    ctx.strokeStyle = `hsl(${hue}, 60%, 40%)`;
    ctx.lineWidth = stem.thickness;
    ctx.globalAlpha = 1 - fade;
    ctx.beginPath();
    ctx.moveTo(stem.x, stem.y);
    let endX = stem.x + Math.cos(stem.angle) * stem.length;
    let endY = stem.y + Math.sin(stem.angle) * stem.length;
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
    // Draw children
    if (stem.children.length === 0 && stem.length >= stem.maxLength && depth > 0) {
      // Clamp flower position to always be on frame (mobile and desktop)
      let margin = isMobile ? 10 : 16;
      let flowerX = Math.max(margin, Math.min(endX, plantCanvas.width - margin));
      let flowerY = Math.max(margin, Math.min(endY, plantCanvas.height - margin));
      drawHangingHopFlower(ctx, flowerX, flowerY, stem.angle, isMobile ? 0.7 : 1.0, time / 1000);
      // Draw a small circle at the tip for extra visibility
      ctx.save();
      ctx.beginPath();
      ctx.arc(flowerX, flowerY, isMobile ? 4 : 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#b2ff59';
      ctx.globalAlpha = 0.7 * (1 - fade);
      ctx.shadowColor = '#558b2f';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
    for (let child of stem.children) drawStem(ctx, child, depth + 1, time, fade);
  }



  function drawPlant(ctx, plant, time) {
    for (let stem of plant.stems) drawStem(ctx, stem, 0, time, 0);
  }


  // Draw a stylized, hanging hop flower (cone-like, layered)
  function drawHangingHopFlower(ctx, x, y, angle, scale, phase) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2); // Hang down from branch
    ctx.scale(scale, scale);
    // Animate color
    const hue = (Date.now() / 40 + x + y) % 360;
    // Draw 4-5 layered scales, favicon-inspired
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
    // Draw stem
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `hsl(${hue}, 60%, 40%)`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.restore();
  }


  function animate(time) {
    // Plant layer
    plantCtx.clearRect(0, 0, plantCanvas.width, plantCanvas.height);
    let allFinished = true;
    for (let plant of plants) {
      if (!plant.finished) {
        growStem(plant.stems[0]);
        drawPlant(plantCtx, plant, time);
        if (allTipsFlowered(plant.stems[0])) {
          plant.finished = true;
        } else {
          allFinished = false;
        }
      } else {
        drawPlant(plantCtx, plant, time);
      }
    }
    if (allFinished) {
      setTimeout(resetPlants, 1200);
      for (let plant of plants) plant.finished = false;
    }

    // Hops layer: draw hops at the same positions as bubbles
    hopsCtx.clearRect(0, 0, hopsCanvas.width, hopsCanvas.height);
    for (let i = 0; i < bubbleCount; i++) {
      let b = bubbles[i];
      let lateral = Math.sin(time / 800 + b.phase + b.y / 50) * b.oscillate;
      let x = b.x + lateral;
      let y = b.y;
      let scale = 0.3 + 0.15 * Math.sin(time / 1000 + b.phase);
      let melt = Math.sin(time / 900 + b.phase) * 2;
      drawHop(x, y, scale, melt);
    }
    // Bubbles layer
    drawBubbles(time);
    requestAnimationFrame(animate);
  }
  animate(0);
}
