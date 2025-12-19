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

  // Bubble parameters
  const bubbleCount = 20;
  const bubbles = Array.from({ length: bubbleCount }, (_, i) => ({
    x: Math.random() * bubblesCanvas.width,
    y: bubblesCanvas.height - Math.random() * bubblesCanvas.height,
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
  // Plant state
  let mouseX = plantCanvas.width / 2;
  plantCanvas.addEventListener('mousemove', e => {
    const rect = plantCanvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (plantCanvas.width / rect.width);
  });

  let plant = {
    stems: [
      {
        x: plantCanvas.width / 2,
        y: plantCanvas.height,
        angle: -Math.PI / 2,
        length: 0,
        maxLength: 160 + Math.random() * 60,
        thickness: 7,
        grown: false,
        children: [],
        parent: null
      }
    ],
    flowers: []
  };

  function growStem(stem, depth = 0) {
    // Faster, more consistent growth
    const growthSpeed = 1.2 + Math.random() * 0.3;
    if (depth === 0) {
      // Main stem follows mouse
      stem.x += (mouseX - stem.x) * 0.08;
    }
    if (stem.length < stem.maxLength) {
      stem.length += growthSpeed;
    } else if (!stem.grown && depth < 4) {
      // Branching
      let branches = 2; // Always 2 for fuller plant
      for (let i = 0; i < branches; i++) {
        let angle = stem.angle + (i === 0 ? -1 : 1) * (Math.PI / (3 + depth) + Math.random() * 0.2);
        let maxLength = 60 + Math.random() * (70 - 10 * depth);
        let thickness = Math.max(2, stem.thickness * (0.6 + Math.random() * 0.3));
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

  function drawStem(ctx, stem, depth = 0, time = 0) {
    ctx.save();
    // Animate stem color
    const hue = (time / 40 + depth * 30) % 360;
    ctx.strokeStyle = `hsl(${hue}, 60%, 40%)`;
    ctx.lineWidth = stem.thickness;
    ctx.beginPath();
    ctx.moveTo(stem.x, stem.y);
    let endX = stem.x + Math.cos(stem.angle) * stem.length;
    let endY = stem.y + Math.sin(stem.angle) * stem.length;
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
    // Draw children
    if (stem.children.length === 0 && stem.length >= stem.maxLength && depth > 0) {
      // Draw a visible, hanging hop flower at the end of grown branch
      drawHangingHopFlower(ctx, endX, endY, stem.angle, 1.1, time / 1000);
      // Draw a small circle at the tip for extra visibility
      ctx.save();
      ctx.beginPath();
      ctx.arc(endX, endY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#b2ff59';
      ctx.globalAlpha = 0.7;
      ctx.shadowColor = '#558b2f';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
    for (let child of stem.children) drawStem(ctx, child, depth + 1, time);
  }

  function drawPlant(ctx, time) {
    ctx.clearRect(0, 0, plantCanvas.width, plantCanvas.height);
    for (let stem of plant.stems) drawStem(ctx, stem, 0, time);
  }


  // Draw a stylized, hanging hop flower (cone-like, layered)
  function drawHangingHopFlower(ctx, x, y, angle, scale, phase) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2); // Hang down from branch
    ctx.scale(scale, scale);
    // Animate color
    const hue = (Date.now() / 40 + x + y) % 360;
    // Draw 3-4 layered scales
    for (let layer = 0; layer < 4; layer++) {
      ctx.beginPath();
      let yOffset = 8 * layer;
      let width = 18 - layer * 3;
      let height = 12 - layer * 2;
      ctx.ellipse(0, yOffset, width, height, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.globalAlpha = 0.7 - layer * 0.13;
      ctx.fillStyle = `hsl(${hue + layer * 10}, 70%, ${70 - layer * 8}%)`;
      ctx.shadowColor = `hsl(${hue + layer * 10}, 60%, 40%)`;
      ctx.shadowBlur = 8 - layer * 2;
      ctx.fill();
    }
    // Draw stem
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `hsl(${hue}, 60%, 40%)`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.restore();
  }

  function animate(time) {
    // Plant layer
    growStem(plant.stems[0]);
    drawPlant(plantCtx, time);

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
