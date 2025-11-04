const icons = {
  active: {
    "16": "icons/16_active.png",
    "48": "icons/48_active.png"
  },
  inactive: {
    "16": "icons/16_inactive.png",
    "48": "icons/48_inactive.png"
  }
};

const defaultChannels = [
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

//#region       On extension installed or updated | set isExtensionActive 
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      console.log('Extensión instalada.');

      // 1. Establecer el estado inicial de la extensión como activo
      const newState = true;
      await setExtensionState(newState);

      // 2. Cargar la lista de canales por defecto desde la variable al storage.sync
      await chrome.storage.sync.set({ channels: defaultChannels });
      console.log('Lista de canales por defecto cargada en chrome.storage.sync.');
    }
});
//#endregion

//#region       On extension clicked | set extension state 
chrome.action.onClicked.addListener(async (tab) => {
  const newState = !(await getExtensionState());
  await setExtensionState(newState);
  updateListenersOnAlltabs(newState);
});
//#endregion 

//#region   set extension state 
async function setExtensionState(newState) {
  await chrome.storage.sync.set({ isExtensionActive: newState });
  updateIcon(newState);
  console.log(`Extensión ${newState ? 'activa' : 'inactiva'}`);
}
//#endregion

//#region   get extension state 
async function getExtensionState() {
  const { isExtensionActive } = await chrome.storage.sync.get('isExtensionActive');
  return isExtensionActive;
}
//#endregion

//#region   update listeners on all tabs  
async function updateListenersOnAlltabs(newState) {
  // Notificamos a todas las pestañas sobre el cambio de estado.
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) {
    chrome.tabs.sendMessage(t.id, { 
      command: 'updateState',
      isExtensionActive: newState
    }).catch(() => {}); // Evita los avisos de promesa rechazada en pestañas sin content script 
                        // (por ejemplo, páginas chrome:// o pestañas no recargadas tras actualizar la extensión)
  }
}
//#endregion

//#region       UPDATE ICON 
function updateIcon(isExtensionActive) {
    const iconPath = isExtensionActive ? icons.active : icons.inactive;
    chrome.action.setIcon({ path: iconPath });
}
//#endregion
