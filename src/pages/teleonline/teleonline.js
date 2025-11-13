window.addEventListener("load", ()=>{
  const volumeButton = document.getElementById('volume-button');
  const fullscreenButton = document.querySelector(".cc-button.media-control-button.media-control-icon");
  setTimeout(()=>{
    fullscreenButton.click();
  }, 3000);
})