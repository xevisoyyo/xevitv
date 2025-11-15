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
// Se ejecuta cuando el navegador se inicia. Restaura el estado del icono.
chrome.runtime.onStartup.addListener(async () => {
  const isExtensionActive = await getExtensionState();  // comprueba si la extensión está activa o no
  await updateIcon(isExtensionActive);                  // actualiza el icono
  console.log('XeviTV: Navegador iniciado, icono actualizado.');
});
//#endregion

//#region       EVENT LISTENERS 
chrome.runtime.onInstalled.addListener(async (details) => { // ON EXTENSION INSTALLED | set extension state to active 
  // Este código se ejecuta UNA SOLA VEZ (al instalar/actualizar).
  // Es el lugar perfecto para la configuración inicial.
  await ensureChannelsExistOnStorage();

  if (details.reason === 'install') {
    console.log('XeviTV: Extensión instalada por primera vez.');
    // Establece el estado inicial (activa) solo en la primera instalación.
    const newState = true;
    await chrome.storage.sync.set({ isExtensionActive: newState });
    await updateIcon(newState);
  }
  else if (details.reason === 'update') {
    // En una actualización, nos aseguramos de que todas las pestañas tengan el estado más reciente.
    const currentState = await getExtensionState();
    await updateIcon(currentState);
    await updateListenersOnAlltabs(currentState);
  }
});

chrome.action.onClicked.addListener(async (tab) => {        // ON EXTENSION CLICKED | set extension state and update listeners on all tabs 
  const newState = !(await getExtensionState());
  await switchExtensionState(newState);
});
//#endregion 

//#region       FUNCTION - getExtensionState 
async function getExtensionState() {
  // pedimos el valor y establecemos un valor por defecto de 'true' si no se encuentra.
  // esto evita que la función devuelva 'undefined' en la primera ejecución.
  const { isExtensionActive } = await chrome.storage.sync.get({ isExtensionActive: true });
  return isExtensionActive;
}
//#endregion

//#region       FUNCTION - updateIcon 
async function updateIcon(isExtensionActive) {
    const iconPath = isExtensionActive ? icons.active : icons.inactive;
    await chrome.action.setIcon({ path: iconPath });
    console.log('XeviTV: Icono sincronizado.');
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
    }).catch(() => {}); // Evita errores en pestañas que no tienen el content script.
  }
  console.log('XeviTV: Estado sincronizado en todas las pestañas.');
}
//#endregion

//#region       FUNCTION - switchExtensionState 
async function switchExtensionState(newState) {
  await chrome.storage.sync.set({ isExtensionActive: newState });
  await updateIcon(newState);
  await updateListenersOnAlltabs(newState);
  console.log(`XeviTV: Extensión ${newState ? 'activada' : 'desactivada'}.`);
}
//#endregion

//#region       FUNCTION - ensureChannelsExistOnStorage
async function ensureChannelsExistOnStorage() {
  // Comprobamos si ya existen canales en el storage.
  // Usamos desestructuración para extraer 'channels' directamente del resultado.
  const { channels } = await chrome.storage.sync.get('channels');
  if (channels) {
    return;
  }

  // Si no existen, creamos la lista por defecto.
  const defaultChannels = [
    {
      "name": "Antena 3",
      "dir": "antena3",
      "url": "https://www.atresplayer.com/directos/antena3/",
      "selected": false
    },
    {
      "name": "Cuatro",
      "dir": "cuatro",
      "url": "https://www.cuatro.com/en-directo/",
      "selected": false
    },
    {
      "name": "La 1",
      "dir": "teleonline",
      "url": "https://teleonline.org/canal/la-1/",
      "selected": true // Marcamos uno como seleccionado por defecto
    },
    {
      "name": "Tele 5",
      "dir": "telecinco",
      "url": "https://www.telecinco.es/endirecto/",
      "selected": false
    }
  ];

  // Guardamos la lista por defecto en chrome.storage.sync
  await chrome.storage.sync.set({ channels: defaultChannels });
  console.log('XeviTV: Canales por defecto guardados en sync storage.');
}
//#endregion