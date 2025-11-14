/**
 * Este script se ejecuta en las páginas de teleonline.org/canal/*
 * Su objetivo es:
 * 1. Activar el audio simulando un clic en el botón de volumen de la página.
 * 3. Poner el reproductor en pantalla completa con la primera interacción del usuario.
 */

// Inicia la espera de los controles del reproductor cuando el script se carga.
waitForControls();

/**
 * Se ejecuta cuando los botones y el vídeo están listos.
 * @param {HTMLElement} volumeButton - El botón de volumen de la página.
 * @param {HTMLVideoElement} videoElement - El elemento de vídeo.
 */
function onControlsReady(volumeButton, videoElement) {
    console.log("XeviTV: Controles iniciales y vídeo detectados.");

    const clickVolumeButton = () => {
        // Solo hacemos clic si el botón de volumen todavía es visible (no se ha usado ya).
        if (volumeButton.style.display !== 'none') {
            setTimeout(() => volumeButton.click(), 300); // Pequeño retardo para ganar la "carrera de condiciones"
            console.log("XeviTV: Clic en el botón de volumen para activar audio.");
        }
    };

    // 1. Esperar a que el vídeo empiece a reproducirse para evitar que la página anule el clic.
    videoElement.addEventListener('playing', () => {
        // Si la pestaña está activa, activamos el audio.
        if (!document.hidden) {
            clickVolumeButton();
        } else {
            // Si la pestaña no está activa, esperamos a que el usuario vuelva a ella.
            console.log("XeviTV: La pestaña no está activa. Esperando a que sea visible para activar el audio.");
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) clickVolumeButton();
            }, { once: true });
        }
    }, { once: true });

    // 2. Preparamos la pantalla completa para el primer clic REAL del usuario.
    document.addEventListener('click', (event) => {
        // Solo actuar si:
        // 1. El clic es del usuario (isTrusted).
        // 2. No estamos ya en pantalla completa.
        // 3. El clic NO se hizo dentro del contenedor del reproductor.
        if (event.isTrusted && !document.fullscreenElement && !event.target.closest('[data-player]')) {
            const currentFullscreenButton = document.querySelector('button[data-fullscreen]');
            if (currentFullscreenButton) {
                currentFullscreenButton.click();
                console.log("XeviTV: Clic del usuario detectado, intentando pantalla completa.");
            }
        }
    });
}

/**
 * Espera a que los botones de control y el vídeo estén disponibles en la página.
 */
function waitForControls() {
    const observer = new MutationObserver((mutations, obs) => {        
        // El botón de volumen que añade la propia página
        const volumeButton = document.getElementById('volume-button');
        // El botón de fullscreen que crea el reproductor Clappr
        const fullscreenButton = document.querySelector(".media-control-button.media-control-icon[data-fullscreen]");
        // El elemento de vídeo
        const videoElement = document.querySelector('video[data-html5-video]');

        // Si encontramos los tres elementos, procedemos.
        if (volumeButton && fullscreenButton && videoElement) {
            obs.disconnect(); // Dejamos de observar, nuestro trabajo ha terminado.
            onControlsReady(volumeButton, videoElement);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });    
}
