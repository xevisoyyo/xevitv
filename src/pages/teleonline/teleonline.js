//.media-control-right-panel
  //.close-btn
    //.drawer-icon-container
window.addEventListener("load", ()=>{
  const closeBtn = document.querySelector(".drawer-icon-container")
  const parent = closeBtn.parentElement;
  const parent2 = parent.parentElement;
  setTimeout(()=>{
    const fullscreen = document.querySelector(".media-control-button.media-control-icon")
    fullscreen.click()
  }, 5000)
  //alert(parent2.innerHTML)
})