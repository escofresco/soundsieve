const { ipcRenderer } = require('electron')

const dragElm = document.getElementById('drag')
dragElm.ondragstart = (event) => {
  event.preventDefault()
  ipcRenderer.send('ondragstart', 'README.md')
}

dragElm.ondrop = (event) => {
  event.preventDefault()
  ipcRenderer.send('drop')
  document.getElementById("demo").style.backgroundColor = "green";
}
