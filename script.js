// ============================================
// TOASTED VGB - JavaScript
// PayPal-inspired scroll animations and interactions
// ============================================

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================
const navbarToggle = document.getElementById('navbarToggle');
const navbarMenu = document.getElementById('navbarMenu');

if (navbarToggle) {
  navbarToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
    
    // Animate hamburger icon
    const spans = navbarToggle.querySelectorAll('span');
    spans[0].style.transform = navbarMenu.classList.contains('active') 
      ? 'rotate(45deg) translate(6px, 6px)' 
      : 'rotate(0) translate(0, 0)';
    spans[1].style.opacity = navbarMenu.classList.contains('active') ? '0' : '1';
    spans[2].style.transform = navbarMenu.classList.contains('active') 
      ? 'rotate(-45deg) translate(6px, -6px)' 
      : 'rotate(0) translate(0, 0)';
  });
}

// Close mobile menu when clicking on a link
const navbarLinks = document.querySelectorAll('.navbar-link, .navbar-menu .btn');
navbarLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      navbarMenu.classList.remove('active');
      
      // Reset hamburger icon
      const spans = navbarToggle.querySelectorAll('span');
      spans[0].style.transform = 'rotate(0) translate(0, 0)';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'rotate(0) translate(0, 0)';
    }
  });
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      const offsetTop = target.offsetTop - 80; // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// ============================================
// SCROLL ANIMATIONS - Intersection Observer
// ============================================
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

// Create intersection observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      
      // Optional: stop observing after animation (performance optimization)
      // observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all elements with animation classes
const animatedElements = document.querySelectorAll(
  '.animate-on-scroll, .animate-fade-in, .animate-slide-up, .animate-scale'
);

animatedElements.forEach(element => {
  observer.observe(element);
});

// ============================================
// PARALLAX EFFECT (Subtle)
// ============================================
let ticking = false;

function updateParallax() {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.hero');
  
  parallaxElements.forEach(element => {
    const speed = 0.5;
    const yPos = -(scrolled * speed);
    element.style.transform = `translateY(${yPos}px)`;
  });
  
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
});

// ============================================
// STAGGERED ANIMATIONS FOR GRIDS
// ============================================
function animateGridItems() {
  const grids = document.querySelectorAll('.features-grid, .testimonials-grid');
  
  grids.forEach(grid => {
    const items = grid.querySelectorAll('.feature-card, .testimonial-card, .card');
    
    items.forEach((item, index) => {
      // Add stagger class based on index
      if (!item.classList.contains('stagger-1') && 
          !item.classList.contains('stagger-2') && 
          !item.classList.contains('stagger-3')) {
        const staggerClass = `stagger-${(index % 6) + 1}`;
        item.classList.add(staggerClass);
      }
    });
  });
}

// Initialize staggered animations
animateGridItems();

// ============================================
// BUTTON HOVER EFFECTS
// ============================================
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
  button.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-2px)';
  });
  
  button.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
  
  button.addEventListener('mousedown', function() {
    this.style.transform = 'translateY(0) scale(0.98)';
  });
  
  button.addEventListener('mouseup', function() {
    this.style.transform = 'translateY(-2px) scale(1)';
  });
});

// ============================================
// CARD TILT EFFECT (3D - Optional Enhancement)
// ============================================
const cards = document.querySelectorAll('.card, .feature-card, .testimonial-card');

cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  });
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
// Reduce animations on low-end devices
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.animate-on-scroll, .animate-fade-in, .animate-slide-up, .animate-scale').forEach(element => {
    element.classList.add('animated');
  });
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
window.addEventListener('load', () => {
  // Trigger hero animation
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    setTimeout(() => {
      heroContent.classList.add('animated');
    }, 100);
  }
  
  // Add loaded class to body for CSS transitions
  document.body.classList.add('loaded');
});

// ============================================
// CONSOLE EASTER EGG
// ============================================
console.log('%cTOASTED VGB 🎥', 'color: #FFD700; font-size: 24px; font-weight: bold;');
console.log('%cThe Video Guestbook Your Wedding Guests Will Actually Love!', 'color: #FFF; font-size: 14px;');
console.log('%cBuilt with ❤️ for unforgettable memories', 'color: #FFD700; font-size: 12px;');
