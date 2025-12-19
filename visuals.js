// Simple generative hops and bubbles demo
const hopsCanvas = document.getElementById('hopsCanvas');
const bubblesCanvas = document.getElementById('bubblesCanvas');

if (hopsCanvas && bubblesCanvas) {
  hopsCanvas.width = bubblesCanvas.width = hopsCanvas.parentElement.offsetWidth;
  hopsCanvas.height = bubblesCanvas.height = hopsCanvas.parentElement.offsetHeight;
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
      bubblesCtx.fillStyle = 'rgba(255,255,255,0.2)';
      bubblesCtx.fill();
    }
  }

  function animate(time) {
    hopsCtx.clearRect(0, 0, hopsCanvas.width, hopsCanvas.height);
    for (let i = 0; i < hopCount; i++) {
      let h = hops[i];
      // Melting shader effect
      let melt = Math.sin(time / 900 + h.meltPhase) * 2;
      drawHop(h.x, h.y, h.scale, melt);
    }
    drawBubbles(time);
    requestAnimationFrame(animate);
  }
  animate(0);
}
