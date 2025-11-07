let isExtensionActive = false;
let areFeaturesActiveInTab = false; // Nuevo estado local de la pestaña

// 1. Escuchar cambios de estado globales (clic en el icono)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'updateState') {
        isExtensionActive = message.isExtensionActive;
        updateFeatureState();
    }
});

// 2. Escuchar cambios de visibilidad de la pestaña
document.addEventListener('visibilitychange', updateFeatureState);

// 3. Comprobar el estado inicial al cargar la página
chrome.storage.sync.get("isExtensionActive", (data) => {
    isExtensionActive = data.isExtensionActive;
    updateFeatureState();
});

function updateFeatureState() {
    const shouldBeActive = isExtensionActive && !document.hidden;

    if (shouldBeActive && !areFeaturesActiveInTab) {
        // Debe estar activo, pero no lo está -> Activar
        activateExtensionFeatures();
    } else if (!shouldBeActive && areFeaturesActiveInTab) {
        // No debe estar activo, pero lo está -> Desactivar
        deactivateExtensionFeatures();
    }
}

const activateExtensionFeatures = () => {
    areFeaturesActiveInTab = true;
    document.addEventListener('keydown', handleKeyDown);
    console.log("XeviTV: Funcionalidades activadas en esta pestaña.");

    if (!document.getElementById("xtv_menu")) {
        createMenu();
        console.log("XeviTV: Menú creado en esta pestaña.");
    }
};

const deactivateExtensionFeatures = () => {
    areFeaturesActiveInTab = false;
    document.removeEventListener('keydown', handleKeyDown);
    console.log("XeviTV: Funcionalidades desactivadas en esta pestaña.");
};

const handleKeyDown = (event) => {
    if (event.key === 'Backspace') menukeyPressed();
};

function createMenu(){
    const menu = document.createElement("div");
    menu.id = "xtv_menu";
    chrome.storage.local.get("channels", ({ channels }) => {
        if (!channels) return;
        for (const channel of channels) {
            const a = document.createElement("a");
            a.href = channel.url;
            a.textContent = channel.name;
            menu.appendChild(a);
        }
    });
    document.body.appendChild(menu);
}

async function menukeyPressed(){
    if (document.fullscreenElement) await document.exitFullscreen();

    const menu = document.getElementById("xtv_menu");
    if(menu.classList.contains("show")) menu.classList.remove("show");
    else menu.classList.add("show");
}