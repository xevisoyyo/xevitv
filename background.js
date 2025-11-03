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

//#region       When installed or updated | set isActive 
chrome.runtime.onInstalled.addListener(() => {
    const newState = true;
    chrome.storage.local.set({ isActive: newState });
    updateIcon(newState);
    console.log(`Extensión instalada. Activa: ${newState}.`);
});
//#endregion

//#region       When extension clicked | set isActive 
chrome.action.onClicked.addListener(async (tab) => {

  const { isActive } = await chrome.storage.local.get('isActive');
  const newState = !isActive;
  await chrome.storage.local.set({ isActive: newState });
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
