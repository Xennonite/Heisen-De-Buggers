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
          this.y = -(Math.random() * 100 + 30); // Start above the screen
          this.size = Math.random() * 4 + 4; 
          this.speedY = (Math.random() * speed + 0.5); // Positive = Falling Down
          this.speedX = (Math.random() - 0.5) * speed; 
          this.life = 0;
          this.maxLife = Math.random() * 400 + 200;
          this.shape = Math.floor(Math.random() * 3); 
          this.rotation = Math.random() * Math.PI * 2;
          this.rotationSpeed = (Math.random() - 0.5) * 0.02; 
        }

        update() {
          this.y += this.speedY;
          this.x += this.speedX;
          this.rotation += this.rotationSpeed;
          this.life++;

          // Repulse from mouse (Snappy)
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          const maxDistance = 250;
          if (distance < maxDistance && distance > 0) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (maxDistance - distance) / maxDistance;
            
            // Soft, gentle push
            this.x -= forceDirectionX * force * 5;
            this.y -= forceDirectionY * force * 5;
          }

          // Wrap horizontally, reset if falls off the bottom
          if (this.x < -30) this.x = canvas.width + 30;
          if (this.x > canvas.width + 30) this.x = -30;
          if (this.y > canvas.height + 30 || this.life >= this.maxLife) {
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
          
          // Boost opacity for visibility at small sizes
          const alpha = Math.min(Math.floor(opacity * 255), 255).toString(16).padStart(2, '0');
          const color = glowColor + alpha;
          ctx.fillStyle = color;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          
          ctx.shadowBlur = 15;
          ctx.shadowColor = glowColor;
          
          if (this.shape === 0) {
            // Ashoka Chakra (24 spokes)
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            for (let i = 0; i < 24; i++) {
              ctx.moveTo(0, 0);
              ctx.lineTo(Math.cos((i * Math.PI) / 12) * this.size, Math.sin((i * Math.PI) / 12) * this.size);
            }
            ctx.stroke();
          } else if (this.shape === 1) {
            // Golden Star (8-pointed)
            ctx.beginPath();
            for (let i = 0; i < 16; i++) {
              const radius = i % 2 === 0 ? this.size : this.size * 0.4;
              const angle = (i * Math.PI) / 8;
              if (i === 0) ctx.moveTo(radius, 0);
              else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }
            ctx.closePath();
            ctx.fill();
          } else if (this.shape === 2) {
            // Balance Scale
            const s = this.size;
            // Base
            ctx.fillRect(-s*0.8, s*0.8, s*1.6, s*0.2);
            // Pillar
            ctx.fillRect(-s*0.1, -s*0.6, s*0.2, s*1.4);
            // Beam
            ctx.fillRect(-s, -s*0.6, s*2, s*0.15);
            // Strings and Pans
            ctx.beginPath();
            ctx.moveTo(-s, -s*0.6); ctx.lineTo(-s - s*0.4, s*0.4);
            ctx.moveTo(-s, -s*0.6); ctx.lineTo(-s + s*0.4, s*0.4);
            ctx.moveTo(s, -s*0.6); ctx.lineTo(s - s*0.4, s*0.4);
            ctx.moveTo(s, -s*0.6); ctx.lineTo(s + s*0.4, s*0.4);
            ctx.stroke();
            // Pans
            ctx.fillRect(-s - s*0.5, s*0.4, s*1.0, s*0.15);
            ctx.fillRect(s - s*0.5, s*0.4, s*1.0, s*0.15);
          }
          
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
