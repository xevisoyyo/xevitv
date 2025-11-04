console.log("XeviTV content script cargado.");

// 1. Comprobar el estado inicial de la extensión al cargar la página
chrome.storage.sync.get("isExtensionActive", ({ isExtensionActive }) => {
    if (isExtensionActive) {
        activateKeyListener();
    }
});

// 2. Escuchar cambios de estado (clic en el icono) desde el background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'updateState') {
        message.isExtensionActive ? activateKeyListener() : deactivateKeyListener();
    }
});

const handleKeyDown = (event) => {
    if (event.key === 'Backspace') console.log("Tecla 'Backspace' presionada. Aquí se mostrará/ocultará el menú.");
};

const activateKeyListener = () => {
    document.addEventListener('keydown', handleKeyDown);
    console.log("XeviTV: Listener de teclado activado.");
};

const deactivateKeyListener = () => {
    document.removeEventListener('keydown', handleKeyDown);
    console.log("XeviTV: Listener de teclado desactivado.");
};