/*
 * Entry point for Electron
 */
// Import the app and BrowserWindow modules of the electron package to be able
// to manage application's lifecycle events, as well as create and control
// browser windows.
const { app, BrowserWindow, ipcMain } = require('electron')

ipcMain.on('ondragstart', (event, filePath) => {
  event.sender.startDrag({
    file: filePath,
    icon: "Image from iOS.jpg"
  })
})

function createWindow () {
  // After that, you define a function that creates a new browser window with
  // node integration enabled, loads index.html file into this window
  // and opens Developer Tools.
  // https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()
}

// Create a new browser window by invoking the createWindow function once the
// Electron application is initialized.
// https://www.electronjs.org/docs/api/app#appwhenready
app.whenReady().then(createWindow)

// Add a new listener that tries to quit the application when it no longer has
// any open windows. This listener is a no-op on macOS due to the operating
// system's window management behavior.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Add a new listener that creates a new browser window only if when the
// application has no visible windows after being activated. For example, after
// launching the application for the first time, or re-launching the already
// running application.
// https://support.apple.com/en-ca/guide/mac-help/mchlp2469/mac
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
