let isExtensionActive = false;
let areFeaturesActiveInTab = false;
let menuElement = null;

//#region       INITIALIZATION & EVENT LISTENERS 
(function setupInitialStateAndListeners() {
    // obtenemos el estado inicial de la extensión desde el storage
    chrome.storage.sync.get("isExtensionActive", (data) => {
        isExtensionActive = data.isExtensionActive;
        // una vez que tenemos el estado inicial, actualizamos la UI por primera vez
        updateFeatureState();

        // registramos los listeners que reaccionarán a futuros cambios
        chrome.runtime.onMessage.addListener((message) => {
            if (message.command === 'updateState') {
                isExtensionActive = message.isExtensionActive;
                updateFeatureState();
            }
        });
        document.addEventListener('visibilitychange', updateFeatureState);
    });
})();
//#endregion

//#region       UPDATE FEATURES (activate/deactivate) 
function updateFeatureState() {
    const shouldBeActive = isExtensionActive && !document.hidden;
    if      (shouldBeActive && !areFeaturesActiveInTab) activateExtensionFeatures();
    else if (!shouldBeActive && areFeaturesActiveInTab) deactivateExtensionFeatures();
}

const activateExtensionFeatures = () => {
    areFeaturesActiveInTab = true;
    if (!menuElement) menuElement = createMenu();

    document.addEventListener('keydown', handleKeyDown);
    menukeyPressed();
    console.log("XeviTV: Funcionalidades activadas en esta pestaña");
};

const deactivateExtensionFeatures = () => {
    areFeaturesActiveInTab = false;
    document.removeEventListener('keydown', handleKeyDown);
    menuElement?.classList.remove("show"); // Ocultar el menú al desactivar la extensión
    console.log("XeviTV: Funcionalidades desactivadas en esta pestaña");
};
//#endregion

//#region       FUNCTION - createMenu 
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
    console.log("XeviTV: Elemento del menú creado y añadido al DOM");
    return menu;
}
//#endregion

//#region       FUNCTION - handleKyeDown 
const handleKeyDown = (event) => {
    if (event.key === 'Backspace') menukeyPressed();
}
//#endregion

//#region       FUNCTION - menukeyPressed 
async function menukeyPressed(){
    if (document.fullscreenElement) await document.exitFullscreen();    
    menuElement?.classList.toggle("show");
}
//#endregion