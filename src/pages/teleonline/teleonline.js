/**
 * Este script se ejecuta en las páginas de teleonline.org/canal/*
 * Su objetivo es:
 * 1. Activar el audio del reproductor de forma fiable usando su API.
 * 2. Poner el reproductor en pantalla completa con la primera interacción del usuario.
 */

/**
 * Configura un MutationObserver para esperar a que los controles del reproductor
 * y el botón de volumen estén disponibles en el DOM.
 */
function waitForPlayerAndSetup() {
    const targetNode = document.getElementById('tab-content');

    if (!targetNode) {
        console.error("XeviTV: No se encontró el contenedor del reproductor ('#tab-content').");
        return;
    }

    console.log("XeviTV: Observando el contenedor del reproductor para detectar cambios...");

    const observer = new MutationObserver((mutationsList, obs) => {
        // 1. Buscamos el elemento del DOM donde Clappr se renderiza.
        const playerElement = document.querySelector('[data-player]');

        if (playerElement) {
            // 2. Una vez que el elemento existe, buscamos la instancia del reproductor.
            // La página la guarda en una propiedad del elemento.
            const clapprInstance = playerElement.clappr;
            
            // 3. Buscamos el botón de pantalla completa.
            const fullscreenButton = playerElement.querySelector('button[data-fullscreen]');

            // 4. Solo si la instancia y el botón están listos, procedemos.
            if (clapprInstance && fullscreenButton) {
                console.log("XeviTV: Instancia de Clappr y controles detectados. Activando funcionalidades.");
                
                // Usamos la API de Clappr para activar el audio de forma fiable.
                // Esto evita que el reproductor se vuelva a silenciar por su propia configuración.
                clapprInstance.unmute();
                clapprInstance.setVolume(85); // Opcional: ajusta el volumen a un nivel cómodo
                console.log("XeviTV: Audio activado a través de la API de Clappr.");
                
                // Preparamos la pantalla completa para el primer clic del usuario.
                document.addEventListener('click', () => {
                    fullscreenButton.click();
                }, { once: true });
                console.log("XeviTV: Funcionalidad de pantalla completa lista. Haz clic en cualquier lugar para entrar.");

                // Ocultamos el botón de volumen manual de la página, ya que no lo necesitamos.
                const volumeButton = document.getElementById('volume-button');
                if (volumeButton) volumeButton.style.display = 'none';

                // 5. Dejamos de observar, nuestro trabajo aquí ha terminado.
                obs.disconnect();
            }
        }
    });

    // Empezamos a observar el nodo objetivo en busca de cambios en sus hijos.
    observer.observe(targetNode, { childList: true, subtree: true });
}

// Inicia la espera del reproductor cuando el script se carga.
waitForPlayerAndSetup();
