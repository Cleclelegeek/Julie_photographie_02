/**
 * Julie Photographie - Portfolio Website
 * Script JavaScript pour les interactions
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================
    // BOUTON CTA "Découvrez mon travail"
    // ============================
    const ctaButton = document.querySelector('.cta-button');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Scroll vers la section "Échantillon de travail"
            const workSection = document.querySelector('.work-samples');
            if (workSection) {
                workSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    // ============================
    // ANIMATION AU SCROLL (optionnel)
    // ============================
    // Observer pour détecter quand les éléments entrent dans le viewport
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    // Animation au défilement (reveal)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                entry.target.classList.remove('hidden');
            }
        });
    }, observerOptions);

    // Marquer les éléments comme cachés au départ
    document.querySelectorAll('section, header').forEach(el => el.classList.add('hidden'));
    // Observer tous les éléments cachés
    document.querySelectorAll('.hidden').forEach(el => observer.observe(el));
    
    // ============================
    // GESTION DES IMAGES
    // ============================
    // Vérifier que toutes les images sont bien chargées
    const images = document.querySelectorAll('img');
    let imagesLoaded = 0;
    
    images.forEach(img => {
        if (img.complete) {
            imagesLoaded++;
        } else {
            img.addEventListener('load', function() {
                imagesLoaded++;
                checkAllImagesLoaded();
            });
            
            img.addEventListener('error', function() {
                console.warn(`Image non chargée: ${this.src}`);
                imagesLoaded++;
                checkAllImagesLoaded();
            });
        }
    });
    
    function checkAllImagesLoaded() {
        if (imagesLoaded === images.length) {
            console.log('Toutes les images sont chargées');
            document.body.classList.add('images-loaded');
        }
    }
    
    // Vérification initiale
    if (imagesLoaded === images.length) {
        document.body.classList.add('images-loaded');
    }

    // Masquer le préloader quand toutes les images sont chargées
    function hidePreloaderIfReady() {
        if (document.body.classList.contains('images-loaded')) {
            const pre = document.getElementById('preloader');
            if (pre) {
                pre.style.opacity = '0';
                pre.style.pointerEvents = 'none';
                setTimeout(() => pre.remove(), 600);
            }
        }
    }

    // appeler après chaque image chargée
    function checkAllImagesLoaded() {
        if (imagesLoaded === images.length) {
            document.body.classList.add('images-loaded');
            hidePreloaderIfReady();
        }
    }
    
    // ============================
    // SMOOTH SCROLL pour les ancres
    // ============================
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Parallax disabled per user request (no moving palms)
    // Old parallax code removed to keep decorative elements static.
    
    // Animation au survol des images
    document.querySelectorAll('.images img').forEach((img) => {
        img.addEventListener('mouseover', () => {
            img.style.transform = 'scale(1.2)';
        });
        img.addEventListener('mouseout', () => {
            img.style.transform = 'scale(1)';
        });
    });

    // Soumettre le formulaire de contact (frontend uniquement)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        // utilitaires pour stocker le journal localement
        const LOG_KEY = 'julie_contact_log_v1';

        function getLog() {
            try {
                const raw = localStorage.getItem(LOG_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) { return []; }
        }

        function saveLog(entries) {
            try { localStorage.setItem(LOG_KEY, JSON.stringify(entries)); } catch (e) { console.warn('Impossible de sauvegarder le log', e); }
        }

        function renderLog() {
            const container = document.getElementById('contact-log-content');
            if (!container) return;
            const entries = getLog();
            if (entries.length === 0) {
                container.textContent = 'Aucun message enregistré.';
                return;
            }
            container.textContent = entries.map((it, i) => {
                return `--- Message #${i+1} ---\nDate: ${it.date}\nNom: ${it.name}\nEmail: ${it.email}\n\n${it.message}\n`;
            }).join('\n');
        }

        // exportLogFile removed: download of messages disabled by request

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = (contactForm.querySelector('#name') || {}).value || '';
            const email = (contactForm.querySelector('#email') || {}).value || '';
            const message = (contactForm.querySelector('#message') || {}).value || '';
            const now = new Date();

            const entry = { date: now.toLocaleString(), name, email, message };
            const entries = getLog();
            entries.push(entry);
            saveLog(entries);

            // afficher confirmation
            const confirmMsg = document.createElement('div');
            confirmMsg.className = 'contact-confirm';
            confirmMsg.textContent = 'Merci — votre message a été enregistré.';
            contactForm.parentNode.insertBefore(confirmMsg, contactForm);
            setTimeout(() => { confirmMsg.style.opacity = '0'; confirmMsg.remove(); }, 4000);

            // mettre à jour le panneau de log si ouvert
            const logEl = document.getElementById('contact-log');
            if (logEl && !logEl.hidden) renderLog();

            contactForm.reset();
        });

        // gestion du panneau d'administration local
        const viewBtn = document.getElementById('view-log');
        const logPanel = document.getElementById('contact-log');
        const closeBtn = logPanel && logPanel.querySelector('.close-log');

        if (viewBtn && logPanel) {
            // animate showing/hiding the log panel
            viewBtn.addEventListener('click', () => {
                if (logPanel.classList.contains('open')) {
                    // hide with animation
                    logPanel.classList.remove('open');
                    const onEnd = (e) => {
                        if (e.target === logPanel) {
                            logPanel.hidden = true;
                            logPanel.removeEventListener('transitionend', onEnd);
                        }
                    };
                    logPanel.addEventListener('transitionend', onEnd);
                } else {
                    // show with animation
                    logPanel.hidden = false;
                    // allow layout to update
                    requestAnimationFrame(() => {
                        logPanel.classList.add('open');
                    });
                    renderLog();
                }
            });
        }

        // download/export button removed — no client-side export available

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (logPanel.classList.contains('open')) {
                    logPanel.classList.remove('open');
                    logPanel.addEventListener('transitionend', function onEnd(e){
                        if (e.target === logPanel){ logPanel.hidden = true; logPanel.removeEventListener('transitionend', onEnd); }
                    });
                } else {
                    logPanel.hidden = true;
                }
            });
        }

        
    }

    // Smooth animated <details> open/close (measure height) — improves closing animation
    (function enhanceDetails(){
        const detailsList = document.querySelectorAll('details');
        detailsList.forEach(details => {
            // wrap non-summary children into a body element for height measurement
            const summary = details.querySelector('summary');
            if (!summary) return;

            // avoid double-wrapping
            if (details._hasDetailsBody) return;

            const body = document.createElement('div');
            body.className = 'details-body';
            body.style.overflow = 'hidden';
            body.style.maxHeight = details.open ? (details.scrollHeight + 'px') : '0px';
            body.style.transition = 'max-height 360ms ease, opacity 260ms ease, transform 320ms ease';
            // move all siblings after summary into body
            let node = summary.nextSibling;
            const nodes = [];
            while (node) {
                nodes.push(node);
                node = node.nextSibling;
            }
            nodes.forEach(n => body.appendChild(n));
            details.appendChild(body);

            // intercept clicks on summary to animate
            summary.addEventListener('click', (e) => {
                e.preventDefault();
                if (details.open) {
                    // close
                    const currentHeight = body.scrollHeight;
                    body.style.maxHeight = currentHeight + 'px';
                    // force reflow
                    void body.offsetHeight;
                    body.style.maxHeight = '0px';
                    details.dispatchEvent(new CustomEvent('closing'));
                    const onEnd = (ev) => {
                        if (ev.propertyName === 'max-height') {
                            details.removeAttribute('open');
                            body.removeEventListener('transitionend', onEnd);
                        }
                    };
                    body.addEventListener('transitionend', onEnd);
                } else {
                    // open
                    details.setAttribute('open', '');
                    // start from 0
                    body.style.maxHeight = '0px';
                    // force reflow
                    void body.offsetHeight;
                    body.style.maxHeight = body.scrollHeight + 'px';
                    details.dispatchEvent(new CustomEvent('opening'));
                    // after transition, remove max-height to allow natural height
                    const onEndOpen = (ev) => {
                        if (ev.propertyName === 'max-height') {
                            body.style.maxHeight = '';
                            body.removeEventListener('transitionend', onEndOpen);
                        }
                    };
                    body.addEventListener('transitionend', onEndOpen);
                }
            });

            details._hasDetailsBody = true;
        });
    })();
    // Logo always visible — suppression de toute logique de masquage
    console.log('Julie Photographie - Site web chargé avec succès');
    // Debug layout: enable with ?debug=1 or toggle with Ctrl+Shift+D
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === '1') document.body.classList.add('debug-layout');
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
                document.body.classList.toggle('debug-layout');
            }
        });
    } catch (e) { /* ignore in very old browsers */ }
});

// ============================
// FONCTIONS UTILITAIRES
// ============================

/**
 * Fonction pour créer un effet de fade-in sur un élément
 * @param {HTMLElement} element - L'élément à animer
 * @param {number} duration - Durée de l'animation en ms
 */
function fadeIn(element, duration = 600) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease`;
    
    setTimeout(() => {
        element.style.opacity = '1';
    }, 10);
}

/**
 * Fonction pour détecter si un élément est visible dans le viewport
 * @param {HTMLElement} element - L'élément à vérifier
 * @returns {boolean}
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
