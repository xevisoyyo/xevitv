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

//#region       On Startup | sync icon with stored state 
(async () => {
  const isExtensionActive = await getExtensionState();
  updateIcon(isExtensionActive);
  await updateListenersOnAlltabs(isExtensionActive);
})();
//#endregion

saveChannelsLocaly();

//#region       On extension installed or updated | set isExtensionActive 
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      console.log('Extensión instalada.');

      const newState = true;
      await setExtensionState(newState);
    }
});
//#endregion

//#region       On extension clicked | set extension state 
chrome.action.onClicked.addListener(async (tab) => {
  const newState = !(await getExtensionState());
  await setExtensionState(newState);
  await updateListenersOnAlltabs(newState);
});
//#endregion 

//#region       set extension state 
async function setExtensionState(newState) {
  await chrome.storage.sync.set({ isExtensionActive: newState });
  updateIcon(newState);
  console.log(`Extensión ${newState ? 'activa' : 'inactiva'}`);
}
//#endregion

//#region       get extension state 
async function getExtensionState() {
  // Pedimos el valor y establecemos un valor por defecto de 'true' si no se encuentra.
  // Esto evita que la función devuelva 'undefined' en la primera ejecución.
  const { isExtensionActive } = await chrome.storage.sync.get({ isExtensionActive: true });
  return isExtensionActive; // Ahora esto siempre será true o false.
}
//#endregion

//#region       update listeners on all tabs  
async function updateListenersOnAlltabs(newState) {
  // Notificamos a todas las pestañas sobre el cambio de estado.
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) {
    chrome.tabs.sendMessage(t.id, { 
      command: 'updateState',
      isExtensionActive: newState
    }).catch(() => {}); // Evita los avisos de promesa rechazada en pestañas sin content script (por ejemplo, páginas chrome:// o pestañas no recargadas tras actualizar la extensión)
  }
  console.log('XeviTV: Estado sincronizado en todas las pestañas.');
}
//#endregion

//#region       UPDATE ICON 
function updateIcon(isExtensionActive) {
    const iconPath = isExtensionActive ? icons.active : icons.inactive;
    chrome.action.setIcon({ path: iconPath });
    console.log('XeviTV: Icono sincronizado.');
}
//#endregion

//#region       SAVE CHANNELS LOCALY 
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