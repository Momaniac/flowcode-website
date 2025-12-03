/* FLOW CODE - MAIN SCRIPT
   Contiene:
   1. Animación de Partículas (Solo se activa si existe el canvas)
   2. Lógica del Formulario de Contacto (Envío a Email vía FormSubmit)
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // ======================================================
    // 1. ANIMACIÓN DE PARTÍCULAS (HERO SECTION)
    // ======================================================
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        
        // Configuración visual de la red
        const config = {
            particleCount: window.innerWidth < 768 ? 45 : 90,
            connectionRadius: 140,
            mouseRadius: 250,
            baseColor: 'rgba(34, 211, 238, ', // Color Cyan
            speed: 0.5
        };

        // Estado del mouse
        let mouse = { x: null, y: null };

        // Rastrear movimiento del mouse sobre el canvas
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            if(e.clientY >= rect.top && e.clientY <= rect.bottom) {
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            } else {
                mouse.x = null;
                mouse.y = null;
            }
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        function resize() {
            const container = document.getElementById('particles-container');
            if(container) {
                width = canvas.width = container.offsetWidth;
                height = canvas.height = container.offsetHeight;
            } else {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            }
            initParticles();
        }

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * config.speed;
                this.vy = (Math.random() - 0.5) * config.speed;
                this.size = Math.random() * 2 + 1; 
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.mouseRadius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (config.mouseRadius - distance) / config.mouseRadius;
                        const directionX = forceDirectionX * force * this.size;
                        const directionY = forceDirectionY * force * this.size;

                        this.x -= directionX * 0.6;
                        this.y -= directionY * 0.6;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = config.baseColor + '0.7)';
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            let count = config.particleCount;
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.update();
                p.draw();

                for (let j = i; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dx = p.x - p2.x;
                    let dy = p.y - p2.y;
                    let distance = Math.sqrt(dx*dx + dy*dy);

                    if (distance < config.connectionRadius) {
                        ctx.beginPath();
                        let opacity = 1 - (distance / config.connectionRadius);
                        ctx.strokeStyle = config.baseColor + (opacity * 0.2) + ')';
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    // ======================================================
    // 2. LÓGICA DEL FORMULARIO DE CONTACTO (EMAIL DIRECTO)
    // ======================================================
    const contactForm = document.getElementById('demoForm');
    
    // CONFIGURACIÓN: Reemplaza con tu correo real
    // Usamos el endpoint /ajax/ para que responda en JSON y no redirija la página
    const EMAIL_TARGET = "https://formsubmit.co/ajax/contacto@develop.com.mx"; 

    if (contactForm) {
        const modal = document.getElementById('successModal');
        const closeBtn = document.querySelector('.close-modal');
        const confirmBtn = document.getElementById('closeBtn');

        const openModal = () => {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            // 1. UI Loading
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Enviando...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            // 2. Capturar datos
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // 3. Enviar a FormSubmit
            try {
                // Verificamos si el usuario cambió el correo placeholder
                if (EMAIL_TARGET.includes("TU_CORREO_AQUI")) {
                    alert("⚠️ ALERTA DE DESARROLLADOR: \nRecuerda editar el archivo script.js y poner tu correo real en la variable EMAIL_TARGET.");
                    throw new Error("Correo no configurado");
                }

                const response = await fetch(EMAIL_TARGET, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) throw new Error('Error al enviar el correo');

                // 4. Éxito
                contactForm.reset();
                openModal();

            } catch (error) {
                console.error("Error:", error);
                // Si es un error de configuración, no mostramos alerta genérica
                if (error.message !== "Correo no configurado") {
                    alert("Hubo un problema de conexión. Intenta nuevamente.");
                }
            } finally {
                // 5. Restaurar botón
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
            }
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (confirmBtn) confirmBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

});