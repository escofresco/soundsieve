/*
 * +------------------------------------+
 * |                                    |
 * |           Frontend Logic           |
 * |                                    |
 * +------------------------------------+
 */
const { ipcRenderer, nativeTheme } = require('electron')
const dragElm = document.getElementById('drag')
const IS_DARK_THEME = ipcRenderer.sendSync('isDarkTheme');
/*
 * +---------------------+
 * |                     |
 * |       Senders       |
 * |                     |
 * +---------------------+
 *
 *  Source separation senders
 * ==============================
 */
const separate = (filepath) => { ipcRenderer.send('separate', filepath) }

/*
 *  Drag senders
 * =================
 */
const drop = (filepath) => { ipcRenderer.send('ondrop', fpath) }

/*
 * +---------------------+
 * |                     |
 * |      Listeners      |
 * |                     |
 * +---------------------+
 *
 *   Drag listeners
 *  ===================
 */
dragElm.ondragstart = (event) => {
  event.preventDefault()
  ipcRenderer.send('ondragstart', '/Users/jonasz/Developer/projects/soundsieve/README.md')
}

document.ondrop = (event) => {
	event.preventDefault();
	event.stopPropagation();
  let fpath;

	for (const f of event.dataTransfer.files) {
		// Using the path attribute to get absolute file path
		console.log('File Path of dragged files: ', f.path)
    fpath = f.path;
	}
  drop(fpath)
  separate(fpath)
};

document.ondragover = (e) => {
	e.preventDefault();
	e.stopPropagation();
};

document.ondragenter = (event) => {
	console.log('File is in the Drop Space');
};

document.ondragleave = (event) => {
	console.log('File has left the Drop Space');
};
