// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// Header Scroll Effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            nav.classList.remove('active');
        }
    });
});

// Animate on Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    if (!el.closest('.produtos-grid')) {
        observer.observe(el);
    }
});

// Counter Animation
function animateCounter(element, target) {
    let count = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
            clearInterval(timer);
            count = target;
        }
        element.textContent = '+' + Math.floor(count);
    }, 30);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(document.getElementById('stat1'), 300);
            animateCounter(document.getElementById('stat2'), 20);
            animateCounter(document.getElementById('stat3'), 100);
            statsObserver.disconnect();
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Contact Form Handler
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Enviando...</span> <i class="fas fa-spinner fa-spin"></i>';

        setTimeout(() => {
            formSuccess.style.display = 'block';
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Enviar Mensagem</span> <i class="fas fa-paper-plane"></i>';

            setTimeout(() => {
                formSuccess.style.display = 'none';
            }, 5000);
        }, 1500);
    });
}

// Highlight Band Counters
function animateBandCounter(element) {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const duration = 1500;
    const startTime = performance.now();

    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.floor(eased * target);
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.textContent = target;
        }
    }
    requestAnimationFrame(step);
}

const bandCounters = document.querySelectorAll('.count');
if (bandCounters.length > 0) {
    const bandObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                bandCounters.forEach(el => animateBandCounter(el));
                bandObserver.disconnect();
            }
        });
    }, { threshold: 0.4 });
    bandObserver.observe(document.querySelector('.highlight-band'));
}

// Produtos: animação em cascata da esquerda para a direita (repetível ao rolar)
const produtosGrid = document.querySelector('.produtos-grid');
if (produtosGrid) {
    const produtosObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const cards = produtosGrid.querySelectorAll('.produto-card');
            if (entry.isIntersecting) {
                cards.forEach(card => card.classList.add('visible'));
            } else {
                cards.forEach(card => card.classList.remove('visible'));
            }
        });
    }, { threshold: 0.15 });
    produtosObserver.observe(produtosGrid);
}

// Serviços: spotlight que segue o mouse nos cards
document.querySelectorAll('.service-card').forEach(card => {
    const glow = card.querySelector('.service-glow');
    if (!glow) return;

    let raf = null;
    card.addEventListener('mousemove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mx', x + 'px');
            card.style.setProperty('--my', y + 'px');
            raf = null;
        });
    });

    card.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
    });
});
