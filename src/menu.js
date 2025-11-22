let isExtensionActive = false;
let areFeaturesActiveInTab = false;
let menuElement = null;
let loadedChannels = [];

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

async function activateExtensionFeatures() {
    areFeaturesActiveInTab = true;
    if (!menuElement) {
        menuElement = await createMenu();
    }

    // Técnica de seguridad: quitar el listener antes de añadirlo para evitar duplicados.
    menuElement.removeEventListener('click', handleMenuClick);
    menuElement.addEventListener('click', handleMenuClick);
    menuElement.classList.add("show"); // Mostrar el menú
    console.log("XeviTV: Funcionalidades activadas en esta pestaña");
}

function deactivateExtensionFeatures() {
    areFeaturesActiveInTab = false;
    if (menuElement) {
        menuElement.removeEventListener('click', handleMenuClick);
        menuElement.classList.remove("show"); // Ocultar el menú
    }
    console.log("XeviTV: Funcionalidades desactivadas en esta pestaña");
}
//#endregion

//#region       FUNCTION - createMenu 
function createMenu() {
    return new Promise((resolve) => {
        const menu = document.createElement("div");
        menu.id = "xtv_menu";
        chrome.storage.sync.get("channels", ({ channels }) => {
            if (channels) {
                loadedChannels = channels;
                for (const channel of channels) {
                    const channelElement = document.createElement("span");
                    channelElement.dataset.url = channel.url;
                    channelElement.className = `channel${channel.selected ? " selected active" : ""}`;
                    channelElement.textContent = channel.name;
                    menu.appendChild(channelElement);
                }
            }
            document.body.appendChild(menu);
            console.log("XeviTV: Elemento del menú creado y añadido al DOM");
            resolve(menu);
        });
    });
}
//#endregion

//#region       EVENT HANDLERS (Keyboard & Click)
const handleMenuClick = async (event) => {
  const clickedElement = event.target;
  // Asegurarnos de que hemos hecho clic en un elemento de canal
  if (clickedElement.classList.contains("channel")) {
    // Si ya está seleccionado, no hacemos nada
    if (clickedElement.classList.contains("selected")) return;

    const newUrl = clickedElement.dataset.url;

    // Actualizamos la lista de canales para reflejar la nueva selección
    const updatedChannels = loadedChannels.map(channel => ({
      ...channel,
      selected: channel.url === newUrl
    }));

    // Guardamos la lista actualizada y luego navegamos
    await chrome.storage.sync.set({ channels: updatedChannels });
    location.href = newUrl;
  }
};
//#endregion

//#region       FUNCTION - menukeyPressed 
async function menukeyPressed(){
    if (document.fullscreenElement) await document.exitFullscreen();
}
//#endregion