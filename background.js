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

//#region       When installed or updated | set isActive 
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        // 1. Establecer el estado inicial como activo
        await chrome.storage.sync.set({ isActive: true });
        updateIcon(true);
        console.log('Extensión instalada. Estado inicial: activa.');

        // 2. Cargar la lista de canales por defecto desde la variable al storage.sync
        await chrome.storage.sync.set({ channels: defaultChannels });
        console.log('Lista de canales por defecto cargada en chrome.storage.sync.');
    }
    // Si es una actualización, mantenemos los datos del usuario.
    // Pero nos aseguramos de que el icono esté en el estado correcto.
    const { isActive } = await chrome.storage.sync.get({ isActive: true });
    updateIcon(isActive);
});
//#endregion

//#region       When extension clicked | set isActive 
chrome.action.onClicked.addListener(async (tab) => {

  // Usamos .sync para que el estado también se sincronice
  const { isActive } = await chrome.storage.sync.get('isActive');
  const newState = !isActive;
  await chrome.storage.sync.set({ isActive: newState });
  updateIcon(newState);
  console.log(`La extensión ahora está ${newState ? 'activa' : 'inactiva'}`);

  // 3. (Futuro) Notificamos a todas las pestañas sobre el cambio de estado.
  // Por ahora, lo dejamos comentado hasta que creemos el content script.
  /*
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) {
    chrome.tabs.sendMessage(t.id, { command: 'updateState', isActive: newState });
  }
  */
});
//#endregion 

//#region       UPDATE ICON 
function updateIcon(isActive) {
    const iconPath = isActive ? icons.active : icons.inactive;
    chrome.action.setIcon({ path: iconPath });
}
//#endregion
