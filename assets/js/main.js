/**
 * Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Common Elements ---
    const vignette = document.getElementById('vignette-overlay');
    
    // --- Detect Current Page ---
    const isSplash = document.getElementById('splash-screen');
    const isHub = document.getElementById('hub-page');

    // --- Mobile Double Tap Logic ---
    function setupDoubleTap() {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouch) return;

        const interactiveElements = document.querySelectorAll('.hub-card, #start-btn');
        
        interactiveElements.forEach(el => {
            el.addEventListener('click', (e) => {
                // If not already active, prevent click and activate
                if (!el.classList.contains('hover-active')) {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent document click from clearing immediately
                    
                    // Clear other active elements
                    interactiveElements.forEach(other => {
                        if (other !== el) other.classList.remove('hover-active');
                    });
                    
                    el.classList.add('hover-active');
                }
                // If already active, let the click happen (navigate)
            });
        });

        // Clear on click outside
        document.addEventListener('click', (e) => {
            interactiveElements.forEach(el => {
                if (!el.contains(e.target)) {
                    el.classList.remove('hover-active');
                }
            });
        });
    }

    // ==========================================
    // HUB PAGE LOGIC
    // ==========================================
    if (isHub) {
        // 1. Fade In Effect (Vignette Out)
        setTimeout(() => {
            if (vignette) vignette.classList.remove('vignette-active');
        }, 100);

        // 2. Initialize Sidebar & Navigation
        initializeHubEvents();
        
        // 3. Setup Mobile Interactions
        setupDoubleTap();
    }

    function initializeHubEvents() {
        const menuBtn = document.getElementById('menu-btn');
        const backBtn = document.getElementById('back-btn');
        const closeBtn = document.getElementById('close-btn');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        const sidebar = document.getElementById('sidebar');
        const body = document.body;

        if (!menuBtn || !sidebar) return;

        function openSidebar() {
            body.classList.add('sidebar-open');
            animateStats();
        }

        function closeSidebar() {
            body.classList.remove('sidebar-open');
        }

        function animateStats() {
            const stats = document.querySelectorAll('.stat-value');
            stats.forEach((stat, index) => {
                // Store original value to prevent loss on re-animation
                if (!stat.dataset.target) {
                    stat.dataset.target = stat.textContent;
                }
                const originalText = stat.dataset.target;

                // Check if it's a number we can animate (remove dots, commas, symbols)
                // Handle Brazilian format (1.000) and US format (1,000) by removing both separators
                const numericValue = parseInt(originalText.replace(/\./g, '').replace(/,/g, '').replace(/%/g, ''));
                
                if (!isNaN(numericValue) && originalText !== '∞') {
                    // Reset to 0 immediately
                    stat.textContent = originalText.includes('%') ? '0%' : '0';

                    setTimeout(() => {
                        let start = 0;
                        const duration = 4000; // Increased to 4 seconds
                        const startTime = performance.now();
                        
                        function update(currentTime) {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            
                            // Ease out quart
                            const ease = 1 - Math.pow(1 - progress, 4);
                            
                            const currentVal = Math.floor(start + (numericValue - start) * ease);
                            
                            // Format back with commas/symbols
                            if (originalText.includes('%')) {
                                stat.textContent = currentVal + '%';
                            } else {
                                // Use Brazilian locale for dot separators (1.000)
                                stat.textContent = currentVal.toLocaleString('pt-BR');
                            }
                            
                            if (progress < 1) {
                                requestAnimationFrame(update);
                            } else {
                                stat.textContent = originalText; // Ensure exact final value
                                
                                // Pop Effect
                                stat.classList.add('stat-pop');
                                setTimeout(() => stat.classList.remove('stat-pop'), 500);
                                
                                // Shiny Particles (Confetti mini burst at stat location)
                                if (typeof confettiSystem !== 'undefined') {
                                    const rect = stat.getBoundingClientRect();
                                    // Small burst of 5-10 particles
                                    for(let i=0; i<8; i++) {
                                        confettiSystem.particles.push(confettiSystem.createParticle(
                                            rect.left + rect.width/2, 
                                            rect.top + rect.height/2,
                                            0.3 // Low force for stats
                                        ));
                                    }
                                    confettiSystem.animate();
                                }
                            }
                        }
                        
                        requestAnimationFrame(update);
                    }, index * 100); // 0.1s gap between starts
                }
            });
        }

        menuBtn.addEventListener('click', openSidebar);
        closeBtn.addEventListener('click', closeSidebar);
        
        // Reason Modal Logic
        const reasonBtn = document.getElementById('reason-btn');
        const reasonOverlay = document.getElementById('reason-overlay');
        const reasonBackBtn = document.getElementById('back-btn-reason');
        
        if (reasonBtn && reasonOverlay) {
            reasonBtn.addEventListener('click', () => {
                // Close sidebar first
                closeSidebar();
                
                // Activate Overlay
                reasonOverlay.classList.add('active');
                
                // Start Fireworks (if class exists)
                if (typeof Fireworks !== 'undefined') {
                    // Assuming Fireworks is a class or global object we can init/start
                    // Based on typical implementation, it might auto-start or need a trigger
                    // If it's the canvas animation loop, it might be running but hidden
                    // Let's ensure it's active if there's a start method
                    if (window.fireworksInstance && window.fireworksInstance.start) {
                        window.fireworksInstance.start();
                    }
                }
            });
            
            if (reasonBackBtn) {
                reasonBackBtn.addEventListener('click', () => {
                    reasonOverlay.classList.remove('active');
                });
            }
        }
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Back Button Logic -> Go to Index
        backBtn.addEventListener('click', () => {
            // Trigger Vignette
            vignette.classList.add('vignette-active');
            
            // Navigate after animation
            setTimeout(() => {
                // Go up two levels from assets/html/ to root
                window.location.href = '../../index.html';
            }, 1000);
        });
    }

    // ==========================================
    // SPLASH SCREEN LOGIC
    // ==========================================
    if (isSplash) {
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.splash-footer');
        const startBtn = document.getElementById('start-btn');
        const progressContainer = document.querySelector('.progress-container');
        const splashTitle = document.querySelector('.splash-text');

        // Check if we should skip animation (e.g. returning from Hub)
        let sessionStarted = false;
        try {
            if (typeof AppStorage !== 'undefined') {
                sessionStarted = AppStorage.session.get('session_started');
            }
        } catch (e) {
            console.warn('Storage check failed:', e);
        }
        
        function showStartButton() {
            if (progressContainer) progressContainer.style.display = 'none';
            if (progressText) progressText.style.display = 'none';
            if (startBtn) startBtn.classList.remove('hidden');
            if (splashTitle) {
                splashTitle.textContent = 'Pronto!';
                splashTitle.setAttribute('data-text', 'Pronto!');
            }
        }

        if (sessionStarted) {
            // Skip loading, show button immediately
            showStartButton();
            
            // Fade in vignette if it was active
            if (vignette) {
                vignette.classList.add('vignette-active');
                setTimeout(() => vignette.classList.remove('vignette-active'), 100);
            }
        } else {
            // Run Loading Animation
            let progress = 0;
            const interval = setInterval(() => {
                // Random increment
                progress += Math.random() * 5;
                if (progress > 100) progress = 100;

                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `${Math.floor(progress)}%`;

                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(showStartButton, 500);
                }
            }, 100);
        }

        // Start Interaction
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                // 1. Confetti (Check if system exists)
                if (typeof confettiSystem !== 'undefined') {
                    const rect = startBtn.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    confettiSystem.burst(centerX, centerY);
                }

                // 2. Vignette & Navigate
                if (vignette) vignette.classList.add('vignette-active');
                
                // Save state
                try {
                    if (typeof AppStorage !== 'undefined') {
                        AppStorage.session.set('session_started', true);
                    }
                } catch (e) {
                    console.warn('Storage save failed:', e);
                }

                setTimeout(() => {
                    // Navigate to Hub
                    window.location.href = 'assets/html/hub.html';
                }, 1000);
            });
            
            // Setup mobile tap for start button specifically
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            if (isTouch) {
                startBtn.addEventListener('click', (e) => {
                    if (!startBtn.classList.contains('hover-active')) {
                        e.preventDefault();
                        e.stopImmediatePropagation(); // Stop the main click handler
                        startBtn.classList.add('hover-active');
                    }
                });
                
                document.addEventListener('click', (e) => {
                    if (!startBtn.contains(e.target)) {
                        startBtn.classList.remove('hover-active');
                    }
                });
            }
        }
    }
});
