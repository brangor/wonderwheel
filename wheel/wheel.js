const MAX_SPEED = 20;
const MIN_SPEED = -20;
const RESISTANCE = 8;

document.addEventListener('DOMContentLoaded', () => {
  let startX, startY, currentX, currentY;
  let startTime, currentAngle = 0;
  let velocity = 0;
  let spinning = false;

  // Set a resistance factor to simulate weight
  const resistanceFactor = RESISTANCE; // Higher values make it feel heavier
  const maxVelocity = MAX_SPEED; // Limit maximum velocity

  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');
  const speedometerElement = document.getElementById('speedometer');
  const winningPieceElement = document.getElementById('winningPiece');
  const tickSound = new Audio('tock.mp3');

  let lastSegmentIndex = null;

  function playTick() {
    const numberOfSegments = wheelData.length;
    const anglePerSegment = 2 * Math.PI / numberOfSegments;
    const currentSegmentIndex = Math.floor((currentAngle % (2 * Math.PI)) / anglePerSegment);

    if (currentSegmentIndex !== lastSegmentIndex) {
      tickSound.currentTime = 0;
      tickSound.play();
      lastSegmentIndex = currentSegmentIndex;
    }
  }

  function updateSpeedometer() {
    speedometerElement.textContent = `Speed: ${velocity.toFixed(2)}`;
  }

    const wheelData = [
      { text: 'GIFT', color: '#FF0000' },
      { text: '$700', color: '#00FF00' },
      { text: 'ONE MILLION', color: '#0000FF' },
      { text: '$600', color: '#FFFF00' },
      { text: '$550', color: '#FF00FF' },
      { text: '$500', color: '#00FFFF' },
      { text: '$600', color: '#FFA500' },
      { text: 'BANKRUPT', color: '#000000' },
      { text: '$650', color: '#008000' },
      { text: 'FREE PLAY', color: '#000080' },
      { text: '❓', color: '#808000' },
      { text: 'LOSE A TURN', color: '#800000' },
      { text: '$800', color: '#008080' },
      { text: 'PRIZE', color: '#C0C0C0' },
      { text: '$650', color: '#FF4500' },
      { text: '$500', color: '#2E8B57' },
      { text: '$900', color: '#4682B4' },
      { text: 'BANKRUPT', color: '#000000' },
      { text: '$3500', color: '#9ACD32' },
      { text: 'WILD', color: '#FF1493' },
      { text: '$900', color: '#1E90FF' },
      { text: '$700', color: '#FFD700' },
      { text: '❓', color: '#ADFF2F' },
      { text: '$650', color: '#FF69B4' },
      { text: '$2500', color: '#CD5C5C' },
      { text: '$5000', color: '#4B0082' },
      { text: 'SURPRISE', color: '#7FFF00' },
      { text: 'POWER', color: '#DC143C' },
      { text: 'JACKPOT', color: '#00CED1' },
      { text: 'VAULT', color: '#9400D3' },
      { text: 'EXPRESS 000', color: '#FF6347' }
    ];

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
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.rotate(angle + anglePerSegment / 3);
        ctx.translate(radius * 0.35, 0); // Move text closer to the midpoint of the arc slice
        ctx.rotate(Math.PI / 2);

        const text = item.text.split('').reverse().join(''); // Reverse the text for correct orientation
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFD700'; // Gold color for drop shadow
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        for (let i = 0; i < text.length; i++) {
          ctx.strokeText(text[i], 0, -i * 14); // Draw the drop shadow
          ctx.fillText(text[i], 0, -i * 14); // Draw the text
        }

        ctx.restore();
      });

      ctx.restore();
    }

  function startDrag(event) {
    if (spinning) return; // Prevent starting a new drag if the wheel is already spinning

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

    // Calculate the center of the wheel
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + canvas.width / 2;
    const centerY = rect.top + canvas.height / 2;

    // Calculate the angle from the center of the wheel to the current position
    let deltaX = currentX - centerX;
    let deltaY = currentY - centerY;

    // Calculate the drag distance
    let dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Calculate the drag duration
    let dragDuration = (new Date().getTime() - startTime) / 1000; // in seconds

    // Calculate the drag angle
    let dragAngle = Math.atan2(deltaY, deltaX);

    // Determine the direction of the drag
    let direction = Math.sign(Math.sin(dragAngle));

    // Calculate the velocity based on drag distance and duration
    velocity = (dragDistance / dragDuration) * direction * 0.01; // Adjust the factor as needed

    // Limit the velocity to the maximum allowed speed
    velocity = Math.min(Math.max(velocity, MIN_SPEED), MAX_SPEED);

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

  function resizeCanvas() {
    const container = document.querySelector('.wheel-container');
    const size = container.offsetWidth;
    canvas.width = size;
    canvas.height = size;
    drawWheel();
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

        // Check if the velocity is too low to cross a segment
        const numberOfSegments = wheelData.length;
        const anglePerSegment = 2 * Math.PI / numberOfSegments;
        const currentSegmentIndex = Math.floor((currentAngle % (2 * Math.PI)) / anglePerSegment);
        const nextSegmentIndex = Math.floor(((currentAngle + velocity * 0.01) % (2 * Math.PI)) / anglePerSegment);

        if (currentSegmentIndex !== nextSegmentIndex && Math.abs(velocity) < 2) {
          velocity = -velocity * 0.5; // Reverse direction with reduced speed
        }

        if (Math.abs(velocity) < 0.01) {
          clearInterval(spinInterval);
          spinning = false;
          velocity = 0;
          updateSpeedometer();

          //// Determine the winning piece
          //const winningIndex = Math.floor((currentAngle % (2 * Math.PI)) / anglePerSegment);
          //const winningPiece = wheelData[winningIndex].text;
          //winningPieceElement.textContent = winningPiece;
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
      let segmentAngle = 2 * Math.PI / wheelData.length;
      let targetAngle = Math.round(currentAngle / segmentAngle) * segmentAngle;

      gsap.to({ angle: currentAngle }, {
        angle: targetAngle,
        duration: 1,
        ease: "elastic.out(1.5, 0.5)",
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
