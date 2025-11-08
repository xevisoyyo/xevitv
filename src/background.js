const icons = {
  active: {
    "16": "/icons/16_active.png",
    "48": "/icons/48_active.png"
  },
  inactive: {
    "16": "/icons/16_inactive.png",
    "48": "/icons/48_inactive.png"
  }
};

//#region       INITIALIZATION 
(async () => {
  await syncInitialState();
  await saveChannelsLocaly();
  console.log('XeviTV: Extensión inicializada.');
})();
//#endregion

//#region       EVENT LISTENERS 
chrome.runtime.onInstalled.addListener(async (details) => { // ON EXTENSION INSTALLED | set extension state to active 
  if (details.reason === 'install') {
    console.log('XeviTV: Extensión instalada.');

    const newState = true;
    await switchExtensionState(newState);
  }
});

chrome.action.onClicked.addListener(async (tab) => {        // ON EXTENSION CLICKED | set extension state and update listeners on all tabs 
  const newState = !(await getExtensionState());
  await switchExtensionState(newState);
});
//#endregion 

//#region       FUNCTION - switchExtensionState 
async function switchExtensionState(newState) {
  await chrome.storage.sync.set({ isExtensionActive: newState });
  await updateIcon(newState);
  await updateListenersOnAlltabs(newState);
  console.log(`Extensión ${newState ? 'activa' : 'inactiva'}`);
}
//#endregion

//#region       FUNCTION - getExtensionState 
async function getExtensionState() {
  // Pedimos el valor y establecemos un valor por defecto de 'true' si no se encuentra.
  // Esto evita que la función devuelva 'undefined' en la primera ejecución.
  const { isExtensionActive } = await chrome.storage.sync.get({ isExtensionActive: true });
  return isExtensionActive; // Ahora esto siempre será true o false.
}
//#endregion

//#region       FUNCTION - updateListenersOnAllTabs 
async function updateListenersOnAlltabs(newState) {
  // Notificamos a todas las pestañas sobre el cambio de estado.
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) {
    chrome.tabs.sendMessage(t.id, { 
      command: 'updateState',
      isExtensionActive: newState
    }).catch(() => {}); // evita los avisos de promesa rechazada en pestañas sin content script (por ejemplo, páginas chrome:// o pestañas no recargadas tras actualizar la extensión)
  }
  console.log('XeviTV: Estado sincronizado en todas las pestañas.');
}
//#endregion

//#region       FUNCTION - updateIcon 
async function updateIcon(isExtensionActive) {
    const iconPath = isExtensionActive ? icons.active : icons.inactive;
    await chrome.action.setIcon({ path: iconPath });
    console.log('XeviTV: Icono sincronizado.');
}
//#endregion

//#region       FUNCTION - syncInitialState
async function syncInitialState() {
  const isExtensionActive = await getExtensionState();
  // Actualizamos el icono y notificamos a las pestañas.
  await updateIcon(isExtensionActive);
  await updateListenersOnAlltabs(isExtensionActive);
}
//#endregion

//#region       FUNCTION - saveChannelsLocaly 
async function saveChannelsLocaly() {
    const channels = [
    {
      "name": "Antena 3",
      "dir": "antena3",
      "platform": "atresplayer",
      "url": "https://www.atresplayer.com/directos/antena3/"
    },
    {
      "name": "Cuatro",
      "dir": "cuatro",
      "platform": "cuatro",
      "url": "https://www.cuatro.com/en-directo/"
    },
    {
      "name": "Tele 5",
      "dir": "telecinco",
      "platform": "telecinco",
      "url": "https://www.telecinco.es/endirecto/"
    }
  ];
  await new Promise(resolve => setTimeout(resolve, 200)); // simula delay
  await chrome.storage.local.set({ channels });
  console.log('Canales guardados en local storage.');
}
//#endregion