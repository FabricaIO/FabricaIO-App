import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'
import { initialize, enable } from '@electron/remote/main/index.js'
import fs from 'fs/promises'
import { spawn, execFile } from 'child_process'
import { SerialPort, ReadlineParser } from 'serialport'
import AdmZip from 'adm-zip'
import electronUpdater, { type AppUpdater } from 'electron-updater'

export function getAutoUpdater(): AppUpdater {
  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  const { autoUpdater } = electronUpdater
  return autoUpdater
}

// Needed in case process is undefined under Linux
const platform = process.platform || os.platform()

const currentDir = fileURLToPath(new URL('.', import.meta.url))
const isDevelopment = process.env.NODE_ENV !== 'production'

let mainWindow: BrowserWindow | undefined

initialize()

// Serial port management
let serialport: SerialPort | null = null
let parser: ReadlineParser | null = null

// Close and cleanup serial port
const closeSerialPort = async (): Promise<void> => {
  return new Promise((resolve) => {
    if (parser) {
      parser.removeAllListeners('data')
      parser.removeAllListeners('error')
      parser.destroy()
      parser = null
    }

    if (serialport) {
      serialport.removeAllListeners('open')
      serialport.removeAllListeners('error')
      if (serialport.isOpen) {
        serialport.close((err) => {
          if (err) {
            console.error('Error closing port:', err)
          }
          console.log('Serial port closed event fired')
          if (serialport) {
            serialport.destroy()
          }
          serialport = null
          resolve()
        })
      } else {
        serialport.destroy()
        serialport = null
        resolve()
      }
    } else {
      resolve()
    }
  })
}

function createWindow() {
  // process.env.PATH += ':/run/host/usr/bin' // Possible Flatpak fix not currently in use
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

function checkForUpdates(): Promise<electronUpdater.UpdateCheckResult | null> {
  getAutoUpdater().logger = console
  return getAutoUpdater().checkForUpdatesAndNotify()
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

// Handle IPC events for opening a directory
ipcMain.handle('open-directory-dialog', async (): Promise<Electron.OpenDialogReturnValue> => {
  if (mainWindow) {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })
    return result
  }
  return { canceled: true, filePaths: [] }
})

// Handle IPC events for opening a file
ipcMain.handle(
  'open-file-dialog',
  async (
    event,
    extension: string,
    typeName: string,
    path = '',
  ): Promise<Electron.OpenDialogReturnValue> => {
    if (mainWindow) {
      const result = await dialog.showOpenDialog(mainWindow, {
        defaultPath: path,
        properties: ['openFile'],
        filters: [{ name: typeName, extensions: [extension] }],
      })
      return result
    }
    return { canceled: true, filePaths: [] }
  },
)

// Handle IPC events for saving a file
ipcMain.handle(
  'save-file-dialog',
  async (
    event,
    extension: string,
    typeName: string,
    path = '',
  ): Promise<Electron.SaveDialogReturnValue> => {
    if (mainWindow) {
      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: path,
        filters: [{ name: typeName, extensions: [extension] }],
      })
      return result
    }
    return { canceled: true, filePath: '' }
  },
)

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

ipcMain.handle('read-binary-file', async (event, data: string): Promise<ArrayBuffer> => {
  try {
    const buffer = await fs.readFile(path.normalize(data))
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer
  } catch (error) {
    console.error('Error reading binary file:', error)
    throw error
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

ipcMain.handle(
  'write-binary-file',
  async (event, data: { path: string; buffer: ArrayBuffer }): Promise<boolean> => {
    try {
      await fs.writeFile(path.normalize(data.path), Buffer.from(data.buffer), { flag: 'w+' })
      return true
    } catch (error) {
      console.error('Error writing binary file:', error)
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

ipcMain.handle('delete', async (event, data: string): Promise<boolean> => {
  try {
    await fs.rm(path.normalize(data), { recursive: true })
    return true
  } catch {
    return false
  }
})

ipcMain.handle('get-temp-file', async (event, filename: string): Promise<string> => {
  const tmpDir = os.tmpdir()
  const timestamp = Date.now()
  const tempFile = path.normalize(path.join(tmpDir, `${timestamp}-${filename}`))
  return tempFile
})

// Extracts a zip file, removing the contents from the root directory inside the zip file
ipcMain.handle(
  'extract-zip',
  async (event, data: { zipPath: string; targetPath: string }): Promise<boolean> => {
    try {
      const zip = new AdmZip(path.normalize(data.zipPath))
      const zipEntries = zip.getEntries()

      const firstEntry = zipEntries[0]
      if (!firstEntry || !firstEntry.entryName) {
        // Zip file is empty
        return false
      }
      const rootFolder = firstEntry.entryName.split('/')[0]

      // Extract all entries, removing the root folder from paths
      for (const entry of zipEntries) {
        const relativePath = entry.entryName.replace(rootFolder + '/', '')
        if (relativePath && !entry.isDirectory) {
          const content = entry.getData()
          const targetFile = path.normalize(path.join(data.targetPath, relativePath))
          const targetDir = path.dirname(path.normalize(targetFile))

          // Ensure target directory exists
          await fs.mkdir(targetDir, { recursive: true })

          // Write file
          await fs.writeFile(targetFile, content)
        }
      }

      return true
    } catch (error) {
      console.error('Error extracting zip:', error)
      return false
    }
  },
)

// Shell command IPCs
ipcMain.handle('execute', async (_event, args) => {
  const [command, commandArgs] = args
  console.log(commandArgs)
  return new Promise((resolve) => {
    const process = spawn(command, commandArgs)

    process.on('error', (err) => {
      console.error('Failed to start subprocess. ' + err.message)
      resolve(false)
    })

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

// IPC handler to open serial port and start monitoring
ipcMain.handle('serial:open', async (event, { path: portPath, baudRate }) => {
  try {
    // Close any existing port
    await closeSerialPort()
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Create new port with autoOpen disabled for manual control
    serialport = new SerialPort({
      path: portPath,
      baudRate: baudRate || 115200,
      autoOpen: false,
    })

    // Create parser for line-based data (one event per line)
    parser = new ReadlineParser({ delimiter: '\n' })

    // Register all event handlers before piping and opening the port
    serialport.once('open', () => {
      console.log('Serial port opened event fired')
      mainWindow?.webContents.send('serial:opened')
    })

    serialport.on('error', (error) => {
      console.error('Serial port error event:', error.message)
      mainWindow?.webContents.send('serial:error', error.message)
    })

    // Parser data handler - fires for each complete line (delimiter = '\n')
    parser.on('data', (line: string) => {
      console.log('Parser received line:', line)
      mainWindow?.webContents.send('serial:data', line)
    })

    parser.on('error', (error) => {
      console.error('Parser error event:', error.message)
      mainWindow?.webContents.send('serial:error', `Parser error: ${error.message}`)
    })

    // Pipe port to parser for later use if needed
    console.log('Piping serialport to parser')
    serialport.pipe(parser)

    // Finally open the port
    console.log('Opening serial port:', portPath)
    serialport.open((err) => {
      if (err) {
        console.error('Failed to open port:', err.message)
        mainWindow?.webContents.send('serial:error', err.message)
      } else {
        console.log('Serial port opened successfully')
      }
    })

    return true
  } catch (error) {
    console.error('Error in serial:open:', error)
    await closeSerialPort()
    return false
  }
})

// IPC handler to close serial port
ipcMain.handle('serial:close', async () => {
  try {
    await closeSerialPort()
    return true
  } catch (error) {
    console.error('Error closing serial port:', error)
    return false
  }
})

// IPC for flashing chips using esptool
ipcMain.handle('flash-firmware', async (event, data): Promise<boolean> => {
  let command: string

  const resourcePath = isDevelopment
    ? path.join(process.cwd(), 'public')
    : path.join(process.resourcesPath, 'app.asar.unpacked')

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
    execFile('chmod 744 ' + command, (error, stdout, stderr) => {
      if (error) {
        console.log(stderr)
      }
      console.log(stdout)
    })
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
    'write-flash',
    '0x0',
    data.projPath + 'firmware-merged.bin',
  ]

  console.log(commandArgs)
  return new Promise((resolve) => {
    try {
      const process = execFile(command, commandArgs)

      process.stdout?.on('data', (data) => {
        mainWindow?.webContents.send('build-output', data.toString())
      })

      process.stderr?.on('data', (data) => {
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

ipcMain.handle('fetch-github-zip', async (event, repoPath: string): Promise<ArrayBuffer> => {
  try {
    const response = await fetch(`https://api.github.com/repos/${repoPath}/zipball/main`)
    if (!response.ok) {
      throw new Error('Failed to download repository')
    }
    const arrayBuffer = await response.arrayBuffer()
    return arrayBuffer
  } catch (error) {
    console.error('Error fetching GitHub zip: ', error)
    throw error
  }
})

ipcMain.handle('check-for-updates', async (): Promise<electronUpdater.UpdateCheckResult | null> => {
  return await checkForUpdates()
})

ipcMain.handle('get-app-version', async (): Promise<string> => {
  return app.getVersion()
})
