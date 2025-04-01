import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'
import { initialize, enable } from '@electron/remote/main/index.js'
import fs from 'fs/promises'
import { exec, spawn } from 'child_process'
import { SerialPort } from 'serialport'

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

const currentDir = fileURLToPath(new URL('.', import.meta.url))
const isDevelopment = process.env.NODE_ENV !== 'production'

let mainWindow: BrowserWindow | undefined

initialize()

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    width: 1200,
    height: 820,
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

// Shell command IPCs
ipcMain.handle('execute', async (_event, args) => {
  const [command, commandArgs] = args
  console.log(commandArgs)
  return new Promise((resolve) => {
    const process = spawn(command, commandArgs)

    process.stdout.on('data', (data) => {
      mainWindow?.webContents.send('build-output', data.toString())
    })

    process.stderr.on('data', (data) => {
      mainWindow?.webContents.send('build-output', data.toString())
    })

    process.on('close', (code) => {
      mainWindow?.webContents.send('build-output', `Process exited with code ${code} \n`)
      resolve(code === 0)
    })
  })
})

ipcMain.handle('get-user-info', () => {
  const info = os.userInfo()
  info.homedir = os.homedir()
  return info
})

// IPC for getting serial ports
ipcMain.handle('get-serial-ports', async () => {
  try {
    const ports = await SerialPort.list()
    return ports.map((port) => ({
      path: port.path,
      manufacturer: port.manufacturer,
      serialNumber: port.serialNumber,
      pnpId: port.pnpId,
      locationId: port.locationId,
      vendorId: port.vendorId,
      productId: port.productId,
    }))
  } catch (error) {
    console.error('Error listing serial ports:', error)
    return []
  }
})

// IPC for flashing chips using esptool
ipcMain.handle('flash-firmware', async (event, data): Promise<boolean> => {
  let command: string

  const resourcePath = isDevelopment
    ? path.join(process.cwd(), 'public')
    : path.join(process.resourcesPath, 'app')

  if (platform == 'win32') {
    command = path.join(resourcePath, 'esptool.exe')
  } else if (platform == 'linux') {
    if (process.arch === 'x64') {
      command = path.join(resourcePath, 'esptool')
    } else if (process.arch === 'arm64') {
      command = path.join(resourcePath, 'esptoolarm64')
    } else if (process.arch === 'arm') {
      command = path.join(resourcePath, 'esptoolarm')
    } else {
      console.log('Architecture not supported')
      mainWindow?.webContents.send('build-output', `Architecture not supported \n`)
      return false
    }
    exec('chmod 744 ' + command)
  } else if (platform === 'darwin') {
    command = path.join(resourcePath, 'esptoolmac')
  } else {
    console.log('Platform not supported')
    mainWindow?.webContents.send('build-output', `Platform not supported \n`)
    return false
  }
  const commandArgs: string[] = [
    '-p',
    data.port,
    '-b',
    data.baud,
    'write_flash',
    '0x0',
    data.projPath + 'firmware-merged.bin',
  ]

  console.log(commandArgs)
  return new Promise((resolve) => {
    try {
      const process = spawn(command, commandArgs)

      process.stdout.on('data', (data) => {
        mainWindow?.webContents.send('build-output', data.toString())
      })

      process.stderr.on('data', (data) => {
        mainWindow?.webContents.send('build-output', data.toString())
      })

      process.on('close', (code) => {
        mainWindow?.webContents.send('build-output', `Process exited with code ${code} \n`)
        resolve(code === 0)
      })
    } catch (error) {
      mainWindow?.webContents.send('build-output', `Failed to start process: ${error}\n`)
      return false
    }
  })
})
