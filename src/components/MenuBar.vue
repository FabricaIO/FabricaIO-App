<template>
  <q-header elevated>
    <q-bar class="q-electron-drag">
      <q-icon name="sensors" />
      <div>Fabrica-IO Builder</div>
      <q-space />
      <q-btn dense flat icon="minimize" @click="minimize" />
      <q-btn dense flat icon="crop_square" @click="toggleMaximize" />
      <q-btn dense flat icon="close" @click="closeApp" />
    </q-bar>

    <div class="q-pa-sm q-pl-md row items-center">
      <q-btn
        flat
        dense
        round
        icon="menu"
        style="margin-right: 0.5em"
        aria-label="Menu"
        @click="emit('toggle-left-drawer')"
      />
      <q-separator vertical spaced color="white" />
      <div class="cursor-pointer non-selectable my-highlight">
        <q-icon name="device_hub" />
        Project
        <q-menu>
          <q-list dense style="min-width: 100px">
            <q-item clickable v-close-popup @click="loadProjectDir">
              <q-item-section side class="menu-icon">
                <q-icon name="folder_open" />
              </q-item-section>
              <q-item-section>Open Project Directory</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="exportProject">
              <q-item-section side class="menu-icon">
                <q-icon name="save" />
              </q-item-section>
              <q-item-section>Save Project</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="importProject">
              <q-item-section side class="menu-icon">
                <q-icon name="upload_file" />
              </q-item-section>
              <q-item-section>Load Project</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="boardDialogOpen = true">
              <q-item-section side class="menu-icon">
                <q-icon name="developer_board" />
              </q-item-section>
              <q-item-section> Board: {{ getBoardLabel(current_project.board) }} </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="partitionDialogOpen = true">
              <q-item-section side class="menu-icon">
                <q-icon name="repartition" />
              </q-item-section>
              <q-item-section> Partition Map: {{ current_project.partition }} </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="storageDialogOpen = true">
              <q-item-section side class="menu-icon">
                <q-icon name="sd_card" />
              </q-item-section>
              <q-item-section> Storage System: {{ current_project.storage }} </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="closeApp">
              <q-item-section side class="menu-icon">
                <q-icon name="close" />
              </q-item-section>
              <q-item-section>Quit</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
      <div class="cursor-pointer non-selectable my-highlight">
        <q-icon name="bolt" />
        Flash Firmware
        <q-menu>
          <q-list dense style="min-width: 100px">
            <q-item clickable v-close-popup @click="selectPort">
              <q-item-section side class="menu-icon">
                <q-icon name="power" />
              </q-item-section>
              <q-item-section> Serial Port: {{ getPortLabel(portPath) }} </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="uploadFirmware">
              <q-item-section side class="menu-icon">
                <q-icon name="upload" />
              </q-item-section>
              <q-item-section> Upload Firmware </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="setOTADevice">
              <q-item-section side class="menu-icon">
                <q-icon name="router" />
              </q-item-section>
              <q-item-section> OTA Target: {{ deviceAddress }} </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="handleOTAUpload">
              <q-item-section side class="menu-icon">
                <q-icon name="upload" />
              </q-item-section>
              <q-item-section>Perform OTA Update</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
      <q-separator vertical spaced color="white" />
      <q-item-section>Current project folder: {{ folderText }}</q-item-section>
      <q-space />
      <q-btn
        on-left
        flat
        dense
        icon="build"
        aria-label="Build"
        label="Build Project"
        @click="buildProject"
        :disable="buildInProgress"
      />
    </div>
  </q-header>
  <q-dialog v-model="boardDialogOpen">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Select Board</div>
      </q-card-section>
      <q-card-section>
        <q-radio v-model="boardSelectMode" val="preset" label="Use tested board" />
        <q-select
          v-if="boardSelectMode === 'preset'"
          v-model="selectedBoard"
          :options="boardOptions"
          label="Choose Board"
          dense
          options-dense
          class="q-mt-sm"
        />
        <q-radio v-model="boardSelectMode" val="custom" label="Enter custom board" />
        <q-input
          v-if="boardSelectMode === 'custom'"
          v-model="customBoard"
          label="Enter board definition"
          dense
          class="q-mt-sm"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="OK" color="primary" @click="saveBoard" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="partitionDialogOpen">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Select Partition Map</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="current_project.partition"
          label="Partition map file"
          dense
          class="q-mt-sm"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="OK" color="primary" @click="saveBoard" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="storageDialogOpen">
    <q-card style="min-width: 350px">
      <q-radio v-model="storageSelectMode" val="FLASH" label="Use Internal Flash" />
      <q-radio v-model="storageSelectMode" val="SPI" label="Use SD Card (SPI)" />
      <q-radio v-model="storageSelectMode" val="SDIO" label="Use SD/MMC Card (SDIO)" />
      <div v-if="storageSelectMode === 'SPI'" class="row q-col-gutter-sm">
        <q-input
          type="number"
          v-model="storage_pins[0]"
          label="SDI"
          dense
          class="my-small-input q-mt-sm"
        />
        <q-input
          type="number"
          v-model="storage_pins[1]"
          label="SDO"
          dense
          class="my-small-input q-mt-sm"
        />
        <q-input
          type="number"
          v-model="storage_pins[2]"
          label="SCK"
          dense
          class="my-small-input q-mt-sm"
        />
        <q-input
          type="number"
          v-model="storage_pins[3]"
          label="CS"
          dense
          class="my-small-input q-mt-sm"
        />
      </div>
      <div v-if="storageSelectMode === 'SDIO'" class="row q-col-gutter-sm">
        <q-input
          type="number"
          v-model="storage_pins[0]"
          label="CLK"
          dense
          class="my-small-input q-mt-sm"
        />
        <q-input
          type="number"
          v-model="storage_pins[1]"
          label="CMD"
          dense
          class="my-small-input q-mt-sm"
        />
        <q-input
          type="number"
          v-model="storage_pins[2]"
          label="D0"
          dense
          class="my-small-input q-mt-sm"
        />
        <q-input
          type="number"
          v-model="storage_pins[3]"
          label="D1"
          dense
          class="my-small-input q-mt-sm"
        />
        <q-input
          type="number"
          v-model="storage_pins[4]"
          label="D2"
          dense
          class="my-small-input q-mt-sm"
        />
        <q-input
          type="number"
          v-model="storage_pins[5]"
          label="D3"
          dense
          class="my-small-input q-mt-sm"
        />
      </div>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="OK" color="primary" @click="saveStorage" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="serialDialogOpen">
    <q-card style="min-width: 350px">
      <q-radio v-model="portSelectMode" val="standard" label="Found Ports" />
      <q-card-section>
        <div class="text-h6">Select Serial Port</div>
      </q-card-section>
      <q-card-section>
        <q-select
          v-model="selectedPort"
          v-if="portSelectMode === 'standard'"
          :options="portOptions"
          label="Choose Port"
          dense
          options-dense
          class="q-mt-sm"
        />
        <q-radio v-model="portSelectMode" val="advanced" label="Enter Port (advanced)" />
        <q-input
          v-if="portSelectMode === 'advanced'"
          v-model="customPort"
          label="Enter port name or path"
          dense
          class="q-mt-sm"
        />
        <q-input
          v-if="portSelectMode === 'advanced'"
          v-model="serialBaud"
          label="Enter baud rate"
          dense
          class="q-mt-sm"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="OK" color="primary" @click="savePort" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="buildDialogOpen" persistent :no-escape-on-esc="buildInProgress">
    <q-card style="width: 950px; max-width: 1000px; overflow: hidden">
      <q-card-section>
        <div class="text-h6">Output</div>
      </q-card-section>
      <q-card-section>
        <pre id="build-output"></pre>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="OK" :disable="buildInProgress" color="primary" v-close-popup />
        <q-btn flat label="Cancel" @click="cancelBuild" color="primary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="OTADialogOpen">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">OTA Settings</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="deviceAddress" label="Enter device address" dense class="q-mt-sm" />
        <q-input
          v-model="deviceUsername"
          label="Enter web interface username"
          dense
          class="q-mt-sm"
        />
        <q-input
          v-model="devicePassword"
          filled
          dense
          class="q-mt-sm"
          :type="isPwd ? 'password' : 'text'"
          hint="Web interface password"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointe"
              dense
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="OK" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="OTAUpdateDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">OTA Update</div>
      </q-card-section>
      <q-card-section>
        <div class="text-subtitle1">{{ OTAMessage }}</div>
        <q-linear-progress
          :value="progressValue"
          class="q-mt-md"
          rounded
          size="md"
          color="primary"
          :indeterminate="progressValue === 0"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {
  setProjectDir,
  getProjectDir,
  current_project,
  loadProject,
} from 'src/composables/projectState'
import 'components/FabricaIODevice.vue'
import type { FabricaIODeviceProps } from 'components/FabricaIODevice.vue'
import { deviceTypes } from 'components/FabricaIODevice.vue'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Dialog } from 'quasar'

// Removes existing container
const deleteContainer = async (): Promise<boolean> => {
  return await window.shell.execCommand('docker', ['rm', '-v', 'fabricaio-dev'])
}

// Text for current project directory
const folderText = ref('None selected')

// Board selection options
const boardDialogOpen = ref(false)
const boardSelectMode = ref('preset')
const customBoard = ref('')

// Contains the officially supported board definitions (will be dynamically loaded eventually)
const boards = ref([
  {
    name: 'dfrobot_firebeetle2_esp32e',
    label: 'DFRobot FireBeetle 2 ESP32-E',
  },
  {
    name: 'esp32doit-devkit-v1',
    label: 'ESP32 DOIT DevKit V1',
  },
  {
    name: 'lolin_s3',
    label: 'WEMOS LOLIN S3 PRO',
  },
  {
    name: 'adafruit_qtpy_esp32s3_n4r2',
    label: 'Adafruit QT Py ESP32-S3 (4M Flash 2M PSRAM)',
  },
])

// Options for board dropdown selector
const boardOptions = ref(
  boards.value.map((board) => ({
    label: board.label,
    value: board.name,
  })),
)

// Build dialog
const buildDialogOpen = ref(false)
const buildInProgress = ref(false)

// Partition file selection options
const partitionDialogOpen = ref(false)

// Storage selection options
const storageDialogOpen = ref(false)
const storageSelectMode = ref('FLASH')
const storage_pins = ref<number[]>([])

// Serial port
const portPath = ref('')
const serialDialogOpen = ref(false)
const portSelectMode = ref('standard')
const customPort = ref('')
const serialBaud = ref('460800')
const portOptions = ref<{ label: string; value: string }[]>([])

const savePort = () => {
  if (portSelectMode.value === 'advanced') {
    portPath.value = customPort.value
  }
}

const selectPort = async () => {
  try {
    const ports = await window.serial.listSerialPorts()
    console.log(ports)
    portOptions.value = ports.map((port) => ({
      label: `${port.path} (${port.manufacturer || 'Unknown'})`,
      value: port.path,
    }))
  } catch (error) {
    console.error('Error fetching serial ports:', error)
  }
  serialDialogOpen.value = true
}

// Extracts the port value from the selected port
const selectedPort = computed({
  get: () => {
    // If there's a port selected, return an object with label and value
    if (portPath.value !== '') {
      const currentPort = portPath.value
      return {
        label: portOptions.value.find((port) => port.value === currentPort)?.label || currentPort,
        value: currentPort,
      }
    }
    // Return none for no selection
    return null
  },
  set: (choice: { label: string; value: string }) => {
    portPath.value = choice.value
  },
})

const uploadFirmware = async () => {
  if (getProjectDir() === '') {
    createDialog('Error', 'No project directory selected')
    return
  }
  if (portPath.value === '') {
    createDialog('Error', 'No serial port selected')
    return
  }
  if (await flashFirmware()) {
    createDialog('Success', 'Firmware uploaded!')
  } else {
    createDialog('Error', 'Firmware upload failed')
  }
}

// Fixes the label to a friendly name in dropdown
const getPortLabel = (portPath: string): string => {
  if (!portPath) return 'Select a port'
  return portOptions.value.find((port) => port.value === portPath)?.label || portPath
}

// OTA variables
const OTADialogOpen = ref(false)
const OTAUpdateDialog = ref(false)
const progressValue = ref(0)
const deviceAddress = ref('')
const deviceUsername = ref('')
const devicePassword = ref('')
const OTAMessage = ref('')
const isPwd = ref(true)

const setOTADevice = () => {
  OTADialogOpen.value = true
}

const handleOTAUpload = async () => {
  if (getProjectDir() === '') {
    createDialog('Error', 'No project directory selected')
    return
  }
  if (!deviceAddress.value || !devicePassword.value || !deviceUsername.value) {
    createDialog('Error', 'Missing OTA Target parameters')
    return
  }
  const dirChar = window.shell.platform === 'win32' ? '\\' : '/'
  const firmwarePath = `${getProjectDir()}${dirChar}.pio${dirChar}build${dirChar}${selectedBoard.value?.value}${dirChar}firmware.bin`
  if (!(await window.fileops.fileExists(firmwarePath))) {
    createDialog('Error', 'Firmware not found, run build first')
    return
  }
  try {
    OTAUpdateDialog.value = true
    OTAMessage.value = 'Initiating OTA update...'
    progressValue.value = 0

    const firmware = await window.fileops.readBinaryFile(firmwarePath)
    const firmwareArray = Array.from(new Uint8Array(firmware))

    const response = await window.ota.uploadFirmware({
      firmware: firmwareArray,
      deviceAddress: deviceAddress.value,
      username: deviceUsername.value,
      password: devicePassword.value,
      onProgress: (loaded: number, total: number) => {
        console.log('Upload progress: ' + String(loaded / total))
        progressValue.value = loaded / total
        OTAMessage.value = `Uploading: ${Math.round(progressValue.value * 100)}%`
      },
    })

    if (response.success) {
      progressValue.value = 1
      OTAMessage.value = 'Update successful! Device is rebooting...'
    } else {
      // Handle the error object directly
      OTAMessage.value = `Error: ${response.error || 'Upload failed'}`
      progressValue.value = 0
    }
  } catch (error) {
    // Handle both Error objects and error response objects
    if (error && typeof error === 'object' && 'error' in error) {
      console.log(error.error)
      OTAMessage.value = `Error: ${error.error}`
    } else {
      OTAMessage.value = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    progressValue.value = 0
  }
}

// Declare emit
const emit = defineEmits(['toggle-left-drawer'])

// Access left drawer prop
defineProps<{
  leftDrawerOpen: boolean
}>()

// We guard the Electron API calls with the optional chaining JS operator,
// but this is only needed if we build same app with other Quasar Modes
// as well (SPA/PWA/Cordova/SSR...)

const minimize = () => {
  window.myWindowAPI?.minimize()
}

const toggleMaximize = () => {
  window.myWindowAPI?.toggleMaximize()
}

const closeApp = () => {
  window.myWindowAPI?.close()
}

// Save selected board if it's a custom selection
const saveBoard = () => {
  if (boardSelectMode.value === 'custom') {
    current_project.value.board = customBoard.value
  }
}

// Extracts the board value from the selected board
const selectedBoard = computed({
  get: () => {
    // If there's a board selected, return an object with label and value
    if (current_project.value.board) {
      const boardId = current_project.value.board
      return {
        label: boards.value.find((board) => board.name === boardId)?.label || boardId,
        value: boardId,
      }
    }
    // Return null for no selection
    return null
  },
  set: (choice: { label: string; value: string }) => {
    current_project.value.board = choice.value
  },
})

// Save storage options
const saveStorage = () => {
  switch (storageSelectMode.value) {
    case 'FLASH':
      current_project.value.storage = 'FLASH'
      break
    case 'SPI':
      current_project.value.storage = 'SPI'
      current_project.value.storage_options = [...storage_pins.value.slice(0, 4)]
      break
    case 'SDIO':
      current_project.value.storage = 'SDIO'
      current_project.value.storage_options = [...storage_pins.value.slice(0, 6)]
      break
  }
  console.log(current_project.value.storage_options)
}

// Fixes the label to a friendly name in dropdown
const getBoardLabel = (boardId: string): string => {
  if (!boardId) return 'Select a board'
  return boards.value.find((board) => board.name === boardId)?.label || boardId
}

// Lets user select the project directory
const loadProjectDir = async () => {
  const result = await window.fileops.getProjectDir()
  if (!result.canceled) {
    setProjectDir(result.filePaths[0] || '')
    folderText.value = result.filePaths[0] || 'None selected'
    // Need to remove previous containers if folder has changed
    await deleteContainer()
  } else {
    console.log('No file selected')
  }
}

// Exports a project as a JSON
const exportProject = async () => {
  if (getProjectDir() === '') {
    createDialog('Error', 'No project directory selected')
    return
  }
  window.fileops.writeFile(
    getProjectDir() + '/fabricaio.json',
    JSON.stringify(current_project.value),
  )
  createDialog('Success', 'Project saved!')
}

// Loads a project from JSON file
const importProject = async () => {
  if (getProjectDir() === '') {
    createDialog('Error', 'No project directory selected')
    return
  }
  loadProject(await window.fileops.readFile(getProjectDir() + '/fabricaio.json'))
  if (!(current_project.value.board in boards.value)) {
    boardSelectMode.value = 'custom'
    customBoard.value = current_project.value.board
  }
  storageSelectMode.value = current_project.value.storage || 'FLASH'
  storage_pins.value = current_project.value.storage_options || []
}

// Builds a project by creating the necessary source files from the current project
const buildProject = async () => {
  if (getProjectDir() === '') {
    createDialog('Error', 'No project directory selected')
    return
  }
  const libs_array = [] as string[]
  const includes_array = [] as string[]
  let constructors = ''
  let devices = ''
  let receivers = ''
  let libs = ''
  let includes = ''
  let first = true
  let first_include = true
  let first_receiver = true
  let first_device = true
  let success = false

  current_project.value.devices.forEach((device) => {
    if (!first) {
      constructors += '\n\t\t'
      libs += '\n\t'
    } else {
      first = false
    }
    const lib_buff = buildLibs(device)
    const include_buff = buildIncludes(device)
    const receivers_buff = buildReceiverLoaders(device)
    const devices_buff = buildDeviceLoaders(device)
    if (!libs_array.includes(lib_buff)) {
      libs += lib_buff + ''
      libs_array.push(lib_buff)
    }
    if (!includes_array.includes(include_buff)) {
      if (!first_include) {
        includes += '\n'
      } else {
        first_include = false
      }
      includes += include_buff
      includes_array.push(include_buff)
    }
    constructors += buildConstructors(device) + ''
    if (receivers_buff !== '') {
      if (!first_receiver) {
        receivers += '\n\t'
      } else {
        first_receiver = false
      }
      receivers += receivers_buff + ''
    }
    if (devices_buff !== '') {
      if (!first_device) {
        devices += '\n\t'
      } else {
        first_device = false
      }
      devices += devices_buff + ''
    }
  })
  if (await window.fileops.makeDir(getProjectDir() + '/lib/DeviceLoader/src/')) {
    success = await writeDeviceLoaderh(includes, constructors)
  }
  if (success) {
    success = await writeDeviceLoadercpp(receivers, devices)
    if (success) {
      const board =
        '[env:' + current_project.value.board + ']\nboard = ' + current_project.value.board
      success = await writePlatformIOini(current_project.value.partition, libs, board)
      if (success) {
        success = await writeStorage(
          current_project.value.storage,
          current_project.value.storage_options,
        )
      }
    }
  }
  if (success) {
    success = await compileWithDocker()
  }
  if (success) {
    createDialog('Success', 'Project build successfully!')
  } else {
    createDialog('Error', 'There was an error building the project')
  }
}

// Builds the constructor string for a device
const buildConstructors = (device: FabricaIODeviceProps): string => {
  let constructor = device.libname + ' ' + device.name.replaceAll(' ', '') + '{'
  if (device.type === 0 || device.type === 1) {
    constructor += '"' + device.name + '"'
  }
  let first = true
  device.constructor[device.constructor_used]?.forEach((param) => {
    if (device.type !== 0 && device.type !== 1) {
      if (first) {
        first = false
      } else {
        constructor += ', '
      }
    } else {
      constructor += ', '
    }
    if (param.type === 'String' || param.type == 'string') {
      constructor += '"' + param.default + '"'
    } else {
      constructor += param.default
    }
  })
  constructor += '};'
  return constructor
}

// Builds the loader string for a sensor or actor device
const buildDeviceLoaders = (device: FabricaIODeviceProps): string => {
  const device_name = device.name.replace(' ', '')
  switch (device.type) {
    case deviceTypes.Actor:
      return 'ActorManager::addActor(&' + device_name + ');'
    case deviceTypes.Sensor:
      return 'SensorManager::addSensor(&' + device_name + ');'
  }
  return ''
}

// Builds the loader string for a LogReceiver or EventReceiver device
const buildReceiverLoaders = (device: FabricaIODeviceProps): string => {
  const device_name = device.name.replace(' ', '')
  switch (device.type) {
    case deviceTypes.LogReceiver:
      return 'Logger.addReceiver(&' + device_name + ');'
    case deviceTypes.EventReceiver:
      return 'EventBroadcaster::addReceiver(&' + device_name + ');'
  }
  return ''
}

// Builds the includes string for a device
const buildIncludes = (device: FabricaIODeviceProps): string => {
  let includes = ''
  device.includes.forEach((include) => {
    includes += '#include <' + include + '.h>' + ''
  })
  return includes
}

// Builds the PlatformIO libraries string for a device
const buildLibs = (device: FabricaIODeviceProps): string => {
  return device.repo
}

// Writes the DeviceLoader.h file
const writeDeviceLoaderh = async (includes: string, constructors: string): Promise<boolean> => {
  let deviceLoaderh = await window.fileops.readFile(
    getProjectDir() + '/lib/DeviceLoader-example/src/DeviceLoader.h',
  )

  let fileParts = deviceLoaderh.split('/******** Put additional includes here ********/')
  deviceLoaderh = fileParts[0] + includes + fileParts[1]

  fileParts = deviceLoaderh.split(
    '/******** Declare sensor, actor, and receiver objects here ********/',
  )
  deviceLoaderh = fileParts[0] + constructors + fileParts[1]

  return window.fileops.writeFile(
    getProjectDir() + '/lib/DeviceLoader/src/DeviceLoader.h',
    deviceLoaderh,
  )
}

// Writes the DeviceLoader.cpp file
const writeDeviceLoadercpp = async (receivers: string, devices: string): Promise<boolean> => {
  let deviceLoadercpp = await window.fileops.readFile(
    getProjectDir() + '/lib/DeviceLoader-example/src/DeviceLoader.cpp',
  )

  let fileParts = deviceLoadercpp.split('/******** Add event receivers and loggers here ********/')
  deviceLoadercpp = fileParts[0] + receivers + fileParts[1]

  fileParts = deviceLoadercpp.split('/******** Add senors and actors here ********/')
  deviceLoadercpp = fileParts[0] + devices + fileParts[1]

  return window.fileops.writeFile(
    getProjectDir() + '/lib/DeviceLoader/src/DeviceLoader.cpp',
    deviceLoadercpp,
  )
}

// Writes the platformio.ini file
const writePlatformIOini = async (
  partition: string,
  libs: string,
  board: string,
): Promise<boolean> => {
  let platformIOini = await window.fileops.readFile(getProjectDir() + '/platformio-example.ini')

  let fileParts = platformIOini.split('; Place additional libraries here')
  platformIOini = fileParts[0] + libs + fileParts[1]
  if (partition !== '') {
    fileParts = platformIOini.split('; Add partition map here: e.g min_spiffs.csv')
    platformIOini = fileParts[0] + 'board_build.partitions = ' + partition + fileParts[1]
  }

  fileParts = platformIOini.split('; Add necessary board definitions here')
  platformIOini = fileParts[0] + board + fileParts[1]

  return window.fileops.writeFile(getProjectDir() + '/platformio.ini', platformIOini)
}

// Writes the storage configuration to the main.cpp file
const writeStorage = async (storage: string, pins: number[]): Promise<boolean> => {
  let main_text = await window.fileops.readFile(getProjectDir() + '/src/main-example.bak')
  if (storage !== 'FLASH') {
    const fileParts = main_text.split('Storage::begin()')
    main_text = fileParts[0] + 'Storage::begin(' + pins.join(', ') + ')' + fileParts[1]
  }
  return window.fileops.writeFile(getProjectDir() + '/src/main.cpp', main_text)
}

// Builds (compiles) project with PlatformIO docker container
const compileWithDocker = async (): Promise<boolean> => {
  if (!buildInProgress.value) {
    buildInProgress.value = true
    buildDialogOpen.value = true
    const command = 'docker'

    // Check if container exists
    let args = ['ps', '-a']

    let success = await window.shell.execCommand(command, args)
    if (!success) {
      buildInProgress.value = false
      return false
    }
    const outputElement = document.getElementById('build-output')
    if (outputElement?.textContent?.includes('fabricaio-dev')) {
      args = ['start', '-i', 'fabricaio-dev']
    } else {
      args = [
        'run',
        '--name',
        'fabricaio-dev',
        '-v',
        getProjectDir() + ':/workspace',
        '-v',
        'vc_platformio:/.platformio',
        'ghcr.io/fabricaio/docker-platformio-container:master',
        'run',
        '-t',
        'mergebin',
      ]
      // Add POSIX specific args
      if (window.shell.platform !== 'win32') {
        // Get user info
        const user = await window.shell.getUserInfo()
        const otherArgs = ['-u', user.uid.toString() + ':' + user.gid.toString()]
        args.splice(1, 0, ...otherArgs)
      }
    }

    // Log build args
    console.log(args)
    success = await window.shell.execCommand(command, args)
    buildInProgress.value = false
    return success
  }
  return false
}

// Cancels a build in progress
const cancelBuild = async () => {
  if (buildInProgress.value) {
    const command = 'docker'

    // Kill the docker container
    const args = ['kill', 'fabricaio-dev']

    const success = await window.shell.execCommand(command, args)
    if (success) {
      buildInProgress.value = false
    }
  } else {
    buildDialogOpen.value = false
  }
}

// Flashes firmware through serial
const flashFirmware = async (): Promise<boolean> => {
  if (!buildInProgress.value) {
    buildInProgress.value = true
    buildDialogOpen.value = true
    const dirChar = window.shell.platform === 'win32' ? '\\' : '/'
    const projPath =
      getProjectDir() +
      dirChar +
      '.pio' +
      dirChar +
      'build' +
      dirChar +
      selectedBoard.value?.value +
      dirChar
    const success = await window.serial.flashFirmware({
      port: selectedPort.value?.value || '',
      baud: serialBaud.value,
      projPath: projPath,
    })
    buildInProgress.value = false
    return success
  }
  return false
}

// Utility function to create dialogs
const createDialog = (title: string, message: string) => {
  Dialog.create({
    title: title,
    message: message,
    ok: {
      flat: true,
    },
  })
}

// Receives output from build process
onMounted(() => {
  // Register the event handler
  window.shell.onBuildOutput((data: string) => {
    const outputElement = document.getElementById('build-output')
    if (outputElement) {
      outputElement.textContent += data
      outputElement.scrollTop = outputElement.scrollHeight
    }
  })
})

onUnmounted(() => {
  // Clean up the event handler
  window.shell.removeAllListeners('build-output')
})
</script>

<style lang="sass" scoped>
.menu-icon
  padding-right: 3px

.my-highlight
  padding: 0.3em

.my-highlight:hover
  background-color: rgba(255, 255, 255, 0.13)
  border-radius: 0.3em

.my-small-input
  width: 4em
  margin: 0 0.5em 0 0.5em

#build-output
  max-height: 550px
  font-family: monospace
  width: 900px
  white-space: pre-wrap
  overflow: auto
  background: #1e1e1e
  color: #d4d4d4
  scroll-behavior: smooth
</style>
