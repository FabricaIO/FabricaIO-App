import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'
import { initialize, enable } from '@electron/remote/main/index.js'
import fs from 'fs/promises'

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

const currentDir = fileURLToPath(new URL('.', import.meta.url))

let mainWindow: BrowserWindow | undefined

initialize()

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    width: 1500,
    height: 900,
    useContentSize: true,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
        ),
      ),
    },
  })

  enable(mainWindow.webContents)

  if (process.env.DEV) {
    mainWindow.loadURL(process.env.APP_URL)
  } else {
    mainWindow.loadFile('index.html')
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow()
  }
})

// IPC for opening an external URL
ipcMain.handle('open-external', async (event, data: string) => {
  shell.openExternal(data)
})

// Handle IPC events for file operations
ipcMain.handle('open-directory-dialog', async (): Promise<Electron.OpenDialogReturnValue> => {
  if (mainWindow) {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })
    return result
  }
  return { canceled: true, filePaths: [] }
})

ipcMain.handle('file-exists', async (event, data: string): Promise<boolean> => {
  try {
    await fs.access(path.normalize(data))
    return true
  } catch {
    return false
  }
})

ipcMain.handle('read-file', async (event, data: string): Promise<string> => {
  try {
    return (await fs.readFile(path.normalize(data))).toString('utf-8')
  } catch {
    return ''
  }
})

ipcMain.handle(
  'write-file',
  async (event, data: { path: string; content: string }): Promise<boolean> => {
    try {
      await fs.writeFile(path.normalize(data.path), data.content, { flag: 'w+' })
      return true
    } catch {
      return false
    }
  },
)

ipcMain.handle('make-dir', async (event, data: string): Promise<boolean> => {
  try {
    await fs.mkdir(path.normalize(data), { recursive: true })
    return true
  } catch {
    return false
  }
})
