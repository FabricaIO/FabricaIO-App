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

// Expose IPC functions to JavaScript

contextBridge.exposeInMainWorld('fileops', {
  getProjectDir: (): Promise<Electron.OpenDialogReturnValue> =>
    ipcRenderer.invoke('open-directory-dialog'),
  fileExists: (path: string): Promise<boolean> => ipcRenderer.invoke('file-exists', path),
  readFile: (path: string): Promise<string> => ipcRenderer.invoke('read-file', path),
  readBinaryFile: (path: string): Promise<ArrayBuffer> =>
    ipcRenderer.invoke('read-binary-file', path),
  writeFile: (path: string, content: string): Promise<boolean> =>
    ipcRenderer.invoke('write-file', { path, content }),
  makeDir: (path: string): Promise<boolean> => ipcRenderer.invoke('make-dir', path),
})

contextBridge.exposeInMainWorld('shell', {
  execCommand: (command: string, args: string[]): Promise<boolean> =>
    ipcRenderer.invoke('execute', [command, args]),
  onBuildOutput: (callback: (data: string) => void) => {
    ipcRenderer.on('build-output', (_event, value) => callback(value))
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
  getUserInfo: (): Promise<{ uid: number; gid: number; homedir: string }> =>
    ipcRenderer.invoke('get-user-info'),
  platform: process.platform,
})

contextBridge.exposeInMainWorld('serial', {
  listSerialPorts: (): Promise<
    Array<{
      path: string
      manufacturer?: string
      serialNumber?: string
      pnpId?: string
      locationId?: string
      vendorId?: string
      productId?: string
    }>
  > => ipcRenderer.invoke('get-serial-ports'),
  flashFirmware: (data: { port: string; baud: string; projPath: string }): Promise<boolean> =>
    ipcRenderer.invoke('flash-firmware', data),
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
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
})

contextBridge.exposeInMainWorld('ota', {
  uploadFirmware: (options: {
    firmware: number[]
    deviceAddress: string
    username: string
    password: string
    onProgress: (loaded: number, total: number) => void
  }): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve, reject) => {
      // Set up progress listener
      const progressHandler = (
        _event: Electron.IpcRendererEvent,
        progress: { loaded: number; total: number },
      ) => {
        if (options.onProgress) {
          options.onProgress(progress.loaded, progress.total)
        }
      }

      // Add progress listener
      ipcRenderer.on('ota-progress', progressHandler)

      // Forward request to main process with the array as second argument
      ipcRenderer
        .invoke('ota-update', {
          firmware: options.firmware,
          deviceAddress: options.deviceAddress,
          username: options.username,
          password: options.password,
        })
        .then((result) => {
          resolve(result as { success: boolean; error?: string })
        })
        .catch((error) => {
          reject({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
          })
        })
        .finally(() => {
          // Clean up listener
          ipcRenderer.removeListener('ota-progress', progressHandler)
        })
    })
  },
})
