// IntegrateWise - Main JavaScript

// Page Load Indicator
window.addEventListener('load', function() {
    document.body.classList.add('page-loaded');
    // Remove any loading overlay if present
    const loader = document.querySelector('.page-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = mobileToggle.querySelectorAll('span');
            spans[0].style.transform = navMenu.classList.contains('active') ? 'rotate(45deg) translateY(8px)' : '';
            spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = navMenu.classList.contains('active') ? 'rotate(-45deg) translateY(-8px)' : '';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                const spans = mobileToggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            }
        });
    }
    
    // Smooth Scroll for Anchor Links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Active Navigation Link
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    }
    
    // Update active link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Button Loading States
    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.setAttribute('data-original-text', button.innerHTML);
            button.disabled = true;
            button.classList.add('btn-loading');
            button.innerHTML = '<span class="btn-spinner"></span> Loading...';
        } else {
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
                button.removeAttribute('data-original-text');
            }
            button.disabled = false;
            button.classList.remove('btn-loading');
        }
    }

    // Prevent double-clicks on buttons
    const actionButtons = document.querySelectorAll('.btn, button');
    actionButtons.forEach(button => {
        let isProcessing = false;
        
        button.addEventListener('click', function(e) {
            // Only prevent default for buttons without href or with href="#"
            const href = this.getAttribute('href');
            const isFormButton = this.type === 'submit' || this.closest('form');
            
            if (isFormButton || href === '#' || !href) {
                if (isProcessing) {
                    e.preventDefault();
                    return false;
                }
                
                if (!this.classList.contains('btn-loading')) {
                    isProcessing = true;
                    setButtonLoading(this, true);
                    
                    // Reset after delay (replace with actual async operation)
                    setTimeout(() => {
                        isProcessing = false;
                        setButtonLoading(this, false);
                    }, 2000);
                }
            } else {
                // For navigation buttons, add a subtle loading state
                if (!isProcessing) {
                    isProcessing = true;
                    this.classList.add('btn-loading');
                    
                    // Allow navigation to proceed
                    setTimeout(() => {
                        isProcessing = false;
                    }, 500);
                }
            }
        });
    });

    // Form Validation (for contact forms)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = form.querySelector('button[type="submit"], .btn[type="submit"]');
            if (submitButton) {
                setButtonLoading(submitButton, true);
            }
            
            // Basic validation
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                    
                    // Remove error class after user types
                    const removeError = function() {
                        this.classList.remove('error');
                        this.removeEventListener('input', removeError);
                    };
                    input.addEventListener('input', removeError);
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (isValid) {
                // Simulate form submission (replace with actual API call)
                setTimeout(() => {
                    if (submitButton) {
                        setButtonLoading(submitButton, false);
                    }
                    
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.textContent = 'Thank you! We\'ll get back to you soon.';
                    form.appendChild(successMessage);
                    
                    // Reset form
                    form.reset();
                    
                    // Remove success message after 5 seconds
                    setTimeout(() => {
                        successMessage.remove();
                    }, 5000);
                }, 1500);
            } else {
                if (submitButton) {
                    setButtonLoading(submitButton, false);
                }
            }
        });
    });
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.problem-card, .feature-card, .service-card, .industry-card');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: fadeInUp 0.6s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .success-message {
            background-color: #10b981;
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            text-align: center;
        }
        
        input.error, textarea.error {
            border-color: #ef4444;
        }
    `;
    document.head.appendChild(style);
    
    // Platform selection helper
    function initPlatformSelector() {
        const selector = document.getElementById('platform-selector');
        if (!selector) return;
        
        const recommendations = {
            'high-budget-hybrid': ['MuleSoft', 'Boomi'],
            'medium-budget-saas': ['Workato', 'Make'],
            'low-budget-simple': ['Zapier', 'Make'],
            'salesforce-heavy': ['Data Cloud', 'MuleSoft'],
            'self-hosted': ['n8n']
        };
        
        selector.addEventListener('change', function() {
            const selected = this.value;
            const resultDiv = document.getElementById('platform-result');
            
            if (selected && recommendations[selected]) {
                const platforms = recommendations[selected];
                resultDiv.innerHTML = `
                    <h4>Recommended Platforms:</h4>
                    <div class="platform-recommendations">
                        ${platforms.map(p => `<span class="platform-tag">${p}</span>`).join('')}
                    </div>
                `;
            }
        });
    }
    
    initPlatformSelector();
});

// Utility function for formatting numbers
function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(num);
}

// Lazy loading images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length > 0 && 'IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
});

// Performance: Preload critical resources
if ('requestIdleCallback' in window) {
    requestIdleCallback(function() {
        // Preload next likely page
        const links = document.querySelectorAll('a[href^="contact"], a[href^="services"]');
        links.forEach(link => {
            const rel = document.createElement('link');
            rel.rel = 'prefetch';
            rel.href = link.href;
            document.head.appendChild(rel);
        });
    });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Page error:', e.error);
    // You can add error reporting here
});

// Check if page is fully loaded
if (document.readyState === 'complete') {
    document.body.classList.add('page-loaded');
}
