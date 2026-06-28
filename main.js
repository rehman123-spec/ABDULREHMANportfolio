document.addEventListener('DOMContentLoaded', () => {

    // 1. Header scroll effect
    const header = document.querySelector('.glass-header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('hidden');
            header.style.background = 'rgba(10, 10, 12, 0.8)';
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > 80) {
            // Scroll Down
            header.classList.add('hidden');
        } else {
            // Scroll Up
            header.classList.remove('hidden');
            header.style.background = 'rgba(10, 10, 12, 0.95)';
        }
        lastScroll = currentScroll;
    });

    // 2. Typewriter Effect in Hero Terminal
    const texts = [
        "Analyzing heuristic paths...",
        "Optimizing matrix operations -> O(1)",
        "Deploying edge AI models...",
        "System architecture robust.",
        "Awaiting next input_"
    ];
    let count = 0;
    let index = 0;
    let currentText = '';
    let letter = '';
    const typewriterElement = document.getElementById('typewriter-text');

    function type() {
        if (count === texts.length) {
            count = 0;
        }
        currentText = texts[count];
        letter = currentText.slice(0, ++index);

        typewriterElement.textContent = letter;
        if (letter.length === currentText.length) {
            setTimeout(() => {
                index = 0;
                count++;
                type();
            }, 2000);
        } else {
            setTimeout(type, 80);
        }
    }
    
    // Start typing effect after short delay
    setTimeout(type, 1000);

    // 3. Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 4. Contact Form Handler
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            btn.textContent = "Sending...";
            btn.disabled = true;
            btn.style.opacity = '0.7';

            // Simulate API call
            setTimeout(() => {
                btn.textContent = "Message Sent ✓";
                btn.style.background = "#27c93f";
                btn.style.color = "#fff";
                form.reset();
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.background = "var(--accent-gradient)";
                }, 3000);
            }, 1500);
        });
    }
});
