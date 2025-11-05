// 1. Comprobar el estado inicial de la extensión al cargar la página
chrome.storage.sync.get("isExtensionActive", ({ isExtensionActive }) => {
    if (isExtensionActive) {
        activateKeyListener();
        createMenu();
    }
});

// 2. Escuchar cambios de estado (clic en el icono) desde el background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'updateState') {
        if(message.isExtensionActive){
            activateKeyListener();
            !document.getElementById("xtv_menu") && createMenu();
        } else {
            deactivateKeyListener();
        }
    }
});

const handleKeyDown = (event) => {
    if (event.key === 'Backspace') menukeyPressed();
};

const activateKeyListener = () => {
    document.addEventListener('keydown', handleKeyDown);
    console.log("XeviTV: Listener de teclado activado.");
};

const deactivateKeyListener = () => {
    document.removeEventListener('keydown', handleKeyDown);
    console.log("XeviTV: Listener de teclado desactivado.");
};

async function createMenu(){
    const menu = document.createElement("div");
    menu.id = "xtv_menu";
    await chrome.storage.local.get("channels", ({ channels }) => {
        for (const channel of channels) {
            const a = document.createElement("a");
            a.href = channel.url;
            a.target = "_blank";
            a.textContent = channel.name;
            menu.appendChild(a);
        }
    });
    document.body.appendChild(menu);
}

async function menukeyPressed(){
    if (document.fullscreenElement) await document.exitFullscreen();

    const menu = document.getElementById("xtv_menu");
    if(menu.classList.contains("show")) menu.classList.remove("show");
    else menu.classList.add("show");

}