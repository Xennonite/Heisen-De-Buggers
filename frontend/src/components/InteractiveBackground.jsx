import React, { useRef, useEffect } from 'react';

export default function InteractiveBackground({ density = 50, speed = 0.5, glowColor = '#ecda98' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

      class Particle {
        constructor() {
          this.reset();
          this.y = Math.random() * canvas.height; 
        }
        
        reset() {
          this.x = Math.random() * canvas.width;
          this.y = canvas.height + Math.random() * 100;
          this.size = Math.random() * 4 + 2; // Slightly larger
          this.speedY = -(Math.random() * speed + 0.2);
          this.speedX = (Math.random() - 0.5) * speed;
          this.life = 0;
          this.maxLife = Math.random() * 300 + 100;
          this.shape = Math.floor(Math.random() * 3); // 0: circle, 1: square (weight), 2: triangle (scale)
          this.rotation = Math.random() * Math.PI * 2;
          this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        }

        update() {
          this.y += this.speedY;
          this.x += this.speedX;
          this.rotation += this.rotationSpeed;
          this.life++;

          // Repulse from mouse
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          
          const maxDistance = 200;
          let force = (maxDistance - distance) / maxDistance;
          
          if (distance < maxDistance) {
            this.x -= forceDirectionX * force * 5;
            this.y -= forceDirectionY * force * 5;
          }

          if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20 || this.life >= this.maxLife) {
            this.reset();
          }
        }

        draw() {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.rotation);
          
          let opacity = 1;
          if (this.life < 30) opacity = this.life / 30;
          if (this.life > this.maxLife - 30) opacity = (this.maxLife - this.life) / 30;
          
          ctx.fillStyle = glowColor + Math.floor(opacity * 180).toString(16).padStart(2, '0');
          ctx.shadowBlur = 15;
          ctx.shadowColor = glowColor;
          
          ctx.beginPath();
          if (this.shape === 0) {
            // Circle (Coin/Token)
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          } else if (this.shape === 1) {
            // Square (Calibration Weight)
            ctx.rect(-this.size, -this.size, this.size * 2, this.size * 2);
          } else if (this.shape === 2) {
            // Triangle (Balance Scale Pivot)
            ctx.moveTo(0, -this.size * 1.5);
            ctx.lineTo(this.size, this.size);
            ctx.lineTo(-this.size, this.size);
            ctx.closePath();
          }
          
          ctx.fill();
          ctx.restore();
        }
      }

    const init = () => {
      particles = [];
      for (let i = 0; i < density; i++) {
        particles.push(new Particle());
      }
    };
    
    init();

    let animationFrameId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, speed, glowColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-10 opacity-70"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
