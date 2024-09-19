document.addEventListener('DOMContentLoaded', () => {
  let startX, startY, currentX, currentY;
  let startTime, currentAngle = 0;
  let velocity = 0;
  let spinning = false;

  // Set a resistance factor to simulate weight
  const resistanceFactor = 1.5; // Higher values make it feel heavier
  const maxVelocity = 10; // Limit maximum velocity

  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');
  const speedometerElement = document.getElementById('speedometer');
  const tickSound = new Audio('tick.mp3');

  const wheelData = [
    'GIFT', '$ 700', 'ONE MILLION', '$ 600', '$ 550', '$ 500', '$ 600',
    'BANKRUPT', '$ 650', 'FREE PLAY', '❓ 000', 'LOSE A TURN', '$ 800',
    'PRIZE', '$ 650', '$ 500', '$ 900', 'BANKRUPT', '$ 3500', 'WILD',
    '$ 900', '$ 700', '❓ 000', '$ 650', '$ 2500', '$ 5000', 'SURPRISE',
    'POWER', 'JACKPOT', 'V A U L T', 'EXPRESS 000'
  ];

  function playTick() {
    tickSound.currentTime = 0;
    tickSound.play();
  }

  function updateSpeedometer() {
    speedometerElement.textContent = `Speed: ${velocity.toFixed(2)}`;
  }

  function drawWheel() {
    const numberOfSegments = wheelData.length;
    const anglePerSegment = 2 * Math.PI / numberOfSegments;
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(currentAngle);

    wheelData.forEach((item, index) => {
      const angle = index * anglePerSegment;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + anglePerSegment);
      ctx.closePath();
      ctx.fillStyle = index % 2 === 0 ? '#ffcc00' : '#ffdd00';
      ctx.fill();
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.rotate(angle + anglePerSegment / 2);
      ctx.translate(radius * 0.7, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#000';
      ctx.fillText(item, 0, 0);
      ctx.restore();
    });

    ctx.restore();
  }

  function startDrag(event) {
    event.preventDefault();
    startX = event.clientX || event.touches[0].clientX;
    startY = event.clientY || event.touches[0].clientY;
    startTime = new Date().getTime();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
  }

  function onMove(event) {
    currentX = event.clientX || event.touches[0].clientX;
    currentY = event.clientY || event.touches[0].clientY;

    let deltaX = currentX - startX;
    let deltaY = currentY - startY;
    let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Apply resistance at the start to simulate weight
    let resistance = Math.min(distance / resistanceFactor, maxVelocity);

    // Slowly build up momentum as the user drags more
    velocity = Math.pow(resistance, 1.5); // Non-linear relationship for more realism

    // Rotate the wheel according to the velocity
    currentAngle += velocity * 0.01;
    drawWheel();

    // Update the speedometer
    updateSpeedometer();
  }

  function stopDrag() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', stopDrag);

    // Spin the wheel with the captured velocity
    spinWithVelocity();
  }

  function spinWithVelocity() {
    if (!spinning) {
      spinning = true;
      let totalRotation = currentAngle + (velocity * 100); // More rotation for inertia effect

      let ticks = Math.abs(velocity * 20); // Control number of ticks
      let tickInterval = setInterval(() => {
        playTick();
        ticks--;
        if (ticks <= 0) clearInterval(tickInterval);
      }, 100); // Speed up/slow down tick interval to match wheel's speed

      let spinInterval = setInterval(() => {
        currentAngle += velocity * 0.01;
        velocity *= 0.98; // Apply friction to slow down
        drawWheel();
        updateSpeedometer();

        if (velocity < 0.01) {
          clearInterval(spinInterval);
          spinning = false;
          velocity = 0;
          updateSpeedometer();
        }
      }, 16); // Approximately 60 FPS
    }
  }

  canvas.addEventListener('mousedown', startDrag);
  canvas.addEventListener('touchstart', startDrag);

  drawWheel();
  gsap.to({ angle: currentAngle }, {
    angle: totalRotation,
    duration: 5,
    ease: "power4.out",
    onUpdate: function() {
      currentAngle = this.targets()[0].angle;
      drawWheel();
      updateSpeedometer();
    },
    onComplete: () => {
      gsap.to({ angle: currentAngle }, {
        angle: totalRotation % (2 * Math.PI),
        duration: 1,
        ease: "elastic.out(1, 0.3)",
        onUpdate: function() {
          currentAngle = this.targets()[0].angle;
          drawWheel();
          updateSpeedometer();
        },
        onComplete: () => {
          spinning = false;
          velocity = 0;
          updateSpeedometer();
        }
      });
    }
  });
});
