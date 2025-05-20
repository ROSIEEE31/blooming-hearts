document.addEventListener('DOMContentLoaded', () => {
    const ctaButton = document.querySelector('.cta-button');
    
    ctaButton.addEventListener('click', () => {
        // Add a smooth animation when clicking the button
        ctaButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            ctaButton.style.transform = 'scale(1)';
        }, 200);
        
        // Here you can add navigation logic or other actions
        console.log('Let\'s Get Started button clicked!');
    });
}); 