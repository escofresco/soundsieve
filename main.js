/*
 * +------------------------------------+
 * |                                    |
 * |      Entry point for electron      |
 * |                                    |
 * +------------------------------------+
 */
if (process.env.NODE_ENV !== 'production') {
  // Load .env if this isn't in production
  require('dotenv').config();
}

// File libs
const fs = require('fs');
const path = require('path');

// REST
const request = require('request')

// Prevent duplicate overwrite
const { COPYFILE_EXCL } = fs.constants

/*
 * +---------------------+
 * |                     |
 * |      App Logic      |
 * |                     |
 * +---------------------+
 */
// Import the app and BrowserWindow modules of the electron package to be able
// to manage application's lifecycle events, as well as create and control
// browser windows.
const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')
const createWindow = () => {
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

  win.loadFile('src/index.html')
  win.webContents.openDevTools()
}

/*
 * +---------------------+
 * |                     |
 * |         AWS         |
 * |                     |
 * +---------------------+
 *
 *  S3
 * ====
 */
const API_GATEWAY_ENDPOINT_URL = 'https://0cxd0qvaa9.execute-api.us-west-2.amazonaws.com/Production'
const AWS = require('aws-sdk');
const BUCKET_NAME = 'soundsieve-uploads'
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const s3 = new AWS.S3({
   accessKeyId: AWS_ACCESS_KEY_ID,
   secretAccessKey: AWS_SECRET_ACCESS_KEY
})
const uploadFile = (fileName) => {
    // Read content from the file
    const fileContent = fs.readFileSync(fileName)

    // Setting up S3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: 'cat.jpg', // File name you want to save as in S3
        Body: fileContent
    }

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err
        }
        console.log(`File uploaded successfully. ${data.Location}`)
    })
}

/*
 *  API Logic for Cloud Formation
 * ===============================
 */
const identifyObjects = ((filepath) => {
  console.log('Loading...')
  const options = {
    url: API_GATEWAY_ENDPOINT_URL,
    body: JSON.stringify({
      img_url: filepath
    }),
    headers: {
      'User-Agent': 'request',
      'Content-Type': 'application/json'
    }
  }

  const callback = (error, response, body) => {
    if (error) {
      console.log(error)
    } else if (response.statusCode == 200) {
      // const info = JSON.parse(body)
      console.log(body)
    } else {
      console.log(response.statusCode)
    }
  }
  request.post(options, callback)
})

const doSeparation = (filepath) => {
  // Make a POST request to the backend
  return identifyObjects(filepath)
}
/* ------- End AWS ------- */


/*
 * +---------------------+
 * |                     |
 * |      Receivers      |
 * |                     |
 * +---------------------+
 */

// nativeTheme.shouldUseDarkColors paddle for renderer
ipcMain.on('isDarkTheme', (event) => {
  event.returnValue = nativeTheme.shouldUseDarkColors
})

ipcMain.on('separate', (_, filepath) => {
  doSeparation(filepath)
})

/*
 *  Drag receivers
 * ========================
 */
ipcMain.on('ondragstart', (event, filePath) => {
  event.sender.startDrag({
    file: filePath,
    icon: "Image from iOS.jpg"
  })
})

ipcMain.on('ondrop', (event, src) => {
  console.log(`${src} has been dropped`)
  upload(path.join('tmp', src))
  // fs.copyFile(src, 'destination.txt', COPYFILE_EXCL, (err) => {
  //   if (err) throw err;
  //   console.log('source.txt was copied to destination.txt');
  // });
})

ipcMain.on('ondragover', (e) => {
})

ipcMain.on('ondragenter', (event) => {
})

ipcMain.on('dragleave', (event) => {
})
/* ------- End Receivers ------- */

/*
 * +---------------------+
 * |                     |
 * |      Listeners      |
 * |                     |
 * +---------------------+
 */

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
/* ------- End Listeners ------- */
