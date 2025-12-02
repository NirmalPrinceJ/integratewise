// IntegrateWise Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.problem-card, .arch-layer, .agent-card, .outcome-card, .pricing-card, .diff-card'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add animation class handler
    document.querySelectorAll('.animate-in').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });

    // Stagger animations for grid items
    const grids = document.querySelectorAll('.problems-grid, .agents-grid, .outcomes-grid, .pricing-grid, .diff-grid');
    
    grids.forEach(grid => {
        const gridObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const children = entry.target.children;
                    Array.from(children).forEach((child, index) => {
                        setTimeout(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                    gridObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        gridObserver.observe(grid);
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navCta = document.querySelector('.nav-cta');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            
            // Create mobile menu if it doesn't exist
            let mobileMenu = document.querySelector('.mobile-menu');
            
            if (!mobileMenu) {
                mobileMenu = document.createElement('div');
                mobileMenu.className = 'mobile-menu';
                mobileMenu.innerHTML = `
                    <div class="mobile-menu-content">
                        <a href="#problem">Problem</a>
                        <a href="#solution">Solution</a>
                        <a href="#agents">AI Agents</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#contact" class="btn btn-primary">Schedule Demo</a>
                    </div>
                `;
                
                // Add styles
                mobileMenu.style.cssText = `
                    position: fixed;
                    top: 70px;
                    left: 0;
                    right: 0;
                    background: white;
                    padding: 24px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    transform: translateY(-100%);
                    opacity: 0;
                    transition: all 0.3s ease;
                    z-index: 999;
                `;
                
                const content = mobileMenu.querySelector('.mobile-menu-content');
                content.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                `;
                
                mobileMenu.querySelectorAll('a:not(.btn)').forEach(link => {
                    link.style.cssText = `
                        font-size: 16px;
                        font-weight: 500;
                        color: #374151;
                        padding: 12px 0;
                        border-bottom: 1px solid #f3f4f6;
                    `;
                });
                
                document.body.appendChild(mobileMenu);
                
                // Close menu when clicking links
                mobileMenu.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => {
                        mobileMenu.style.transform = 'translateY(-100%)';
                        mobileMenu.style.opacity = '0';
                        mobileMenuBtn.classList.remove('active');
                    });
                });
            }
            
            // Toggle menu visibility
            if (mobileMenuBtn.classList.contains('active')) {
                mobileMenu.style.transform = 'translateY(0)';
                mobileMenu.style.opacity = '1';
            } else {
                mobileMenu.style.transform = 'translateY(-100%)';
                mobileMenu.style.opacity = '0';
            }
        });
    }

    // Counter animation for stats
    const animateCounter = (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.round(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    };

    // Observe stats for counter animation
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Stats are text-based, so we'll just add a subtle animation
                    entry.target.querySelectorAll('.stat-card').forEach((card, index) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 150);
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }

    // Add hover effects to cards
    document.querySelectorAll('.stat-card, .problem-card, .agent-card, .pricing-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    console.log('IntegrateWise landing page loaded successfully');
});


