/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.ts you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */

import { contextBridge, ipcRenderer } from 'electron'
import { BrowserWindow } from '@electron/remote'

contextBridge.exposeInMainWorld('fileops', {
  getProjectDir: (): Promise<Electron.OpenDialogReturnValue> =>
    ipcRenderer.invoke('open-directory-dialog'),
  fileExists: (path: string): Promise<string> => ipcRenderer.invoke('file-exists', path),
  writeFile: (path: string, content: string): Promise<boolean> =>
    ipcRenderer.invoke('write-file', { path, content }),
  readFile: (path: string): Promise<string> => ipcRenderer.invoke('read-file', path),
})

contextBridge.exposeInMainWorld('myWindowAPI', {
  minimize() {
    BrowserWindow.getFocusedWindow()?.minimize()
  },

  toggleMaximize() {
    const win = BrowserWindow.getFocusedWindow()

    if (win && win.isMaximized()) {
      win?.unmaximize()
    } else {
      win?.maximize()
    }
  },

  close() {
    BrowserWindow.getFocusedWindow()?.close()
  },
})
