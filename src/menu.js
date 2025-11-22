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

    menuElement.removeEventListener('click', handleMenuClick); // técnica de seguridad: quitar el listener antes de añadirlo para evitar duplicados.
    menuElement.addEventListener('click', handleMenuClick);
    document.removeEventListener("keydown", handleKeydown);
    document.addEventListener("keydown", handleKeydown);
    menuElement.classList.add("show"); // mostrar el menú
    console.log("XeviTV: Funcionalidades activadas en esta pestaña");
}

function deactivateExtensionFeatures() {
    areFeaturesActiveInTab = false;
    if (menuElement) {
        menuElement.removeEventListener('click', handleMenuClick);
        document.removeEventListener("keydown", handleKeydown);
        menuElement.classList.remove("show"); // ocultar el menú
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

//#region       EVENT HANDLERS - click 
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

//#region       EVENT HANDLERS - keydown 
const handleKeydown = (event) => {
    const key = event.key;
    console.log("xtv: ", key)
    const channelElements = document.querySelectorAll("#xtv_menu span");
    if (channelElements.length < 2) return;
    const activeChannelElement = channelElements[0].parentElement.querySelector(".selected") || channelElements[0];
    if(key === "ArrowUp"){
        const previousChannelElement = activeChannelElement.previousElementSibling || channelElements[channelElements.length - 1];
        activeChannelElement.classList.remove("selected");
        previousChannelElement.classList.add("selected");
    }
    else if(key == "ArrowDown"){
        const nextChannelElement = activeChannelElement.nextElementSibling || channelElements[0];
        activeChannelElement.classList.remove("selected");
        nextChannelElement.classList.add("selected");
    }
}
//#endregion

//#region       FUNCTION - menukeyPressed 
async function menukeyPressed(){
    if (document.fullscreenElement) await document.exitFullscreen();
}
//#endregion