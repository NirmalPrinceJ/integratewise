// IntegrateWise lightweight interactions

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const mobileBtn = document.querySelector('.mobile-menu-btn');

    // Smooth scrolling for on-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            const targetId = anchor.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                event.preventDefault();
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    if (mobileBtn && navbar) {
        mobileBtn.addEventListener('click', () => {
            const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
            mobileBtn.setAttribute('aria-expanded', String(!expanded));
            navbar.classList.toggle('open');
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navbar.classList.contains('open')) {
                navbar.classList.remove('open');
                mobileBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
});
