# Plan de Desarrollo - Extensión "XeviTV"
Por favor habla en castellano.
Los cambios paso a paso y preguntando antes, para poder testearlos individualmente.

## Objetivo Principal
Crear una extensión que, al estar activa, pone vídeos de canales de TV en pantalla completa y permite cambiar de canal a través de un menú invocado por una tecla.

## Pasos a seguir e ir completando
### Configuración inicial de la extensión
- [x] **Setup Inicial del `background.js`**: Lógica para instalar la extensión, guardar el estado (activo/inactivo) en `chrome.storage.local` y cambiar el icono de la extensión según el estado.

### Fase 1: Content Script general y Menú de canales
- [-] **Definir lista de canales de ejemplo**: Crear una estructura de datos simple en el código.
- [+] **Crear `content-script.js`**: Registrarlo en `manifest.json` para que se inyecte en las páginas.
- [+] **Implementar listener de teclado**: Hacer que el listener del content de cada pestaña se active o desactive al activar o desactivar la extensión.
- [ ] **Crear HTML/CSS del menú**: Diseñar el overlay y la lista de canales.

- [ ] **Comunicación con Content Scripts**: Implementar el envío de mensajes desde `background.js` a los `content-script.js` para que las páginas web puedan reaccionar al cambio de estado de la extensión.
- [ ] **Crear `content-script.js`**: Desarrollar el script que se inyectará en las páginas y escuchará los mensajes del background script.
- [ ] **Definir la funcionalidad principal**: ¿Qué hará la extensión en la página cuando esté activa? (Ej: modificar el DOM, resaltar elementos, etc.).

### Fase 2: Funcionalidad Principal
- [ ] Implementar la entrada automática a pantalla completa.
- [ ] Al invocar el menú, salir de la pantalla completa.
- [ ] Al hacer clic en un canal, navegar a la nueva URL.

### Fase 3: Gestión de Canales (Futuro)
- [ ] Crear una página de opciones para que el usuario pueda añadir/editar/borrar canales.
- [ ] Guardar la lista de canales personalizada en `chrome.storage`.
