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
            <q-item clickable v-close-popup @click="setupProjectDir">
              <q-item-section side class="menu-icon">
                <q-icon name="install_desktop" />
              </q-item-section>
              <q-item-section>Setup Project Directory</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="exportProject(false)">
              <q-item-section side class="menu-icon">
                <q-icon name="save" />
              </q-item-section>
              <q-item-section>Save Project</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportProject(true)">
              <q-item-section side class="menu-icon">
                <q-icon name="save_as" />
              </q-item-section>
              <q-item-section>Save Project As</q-item-section>
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
            <q-item clickable v-close-popup @click="wifiDialogOpen = true">
              <q-item-section side class="menu-icon">
                <q-icon name="wifi" />
              </q-item-section>
              <q-item-section> WiFi: {{ WiFiMode }} </q-item-section>
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
            <q-item clickable v-close-popup @click="monitorSerialPort">
              <q-item-section side class="menu-icon">
                <q-icon name="terminal" />
              </q-item-section>
              <q-item-section>Monitor Serial Output</q-item-section>
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
      <div class="cursor-pointer non-selectable my-highlight">
        <q-icon name="help" />
        Help
        <q-menu>
          <q-list dense style="min-width: 100px">
            <q-item>
              <q-item-section side class="menu-icon">
                <q-icon name="code" />
              </q-item-section>
              <q-item-section>Version {{ appVersion }} </q-item-section>
            </q-item>
            <q-item clickable @click="openDocs">
              <q-item-section side class="menu-icon">
                <q-icon name="article" />
              </q-item-section>
              <q-item-section>Documentation</q-item-section>
            </q-item>
            <q-item clickable @click="autoUpdateToggle">
              <q-item-section side class="menu-icon">
                <q-icon :name="autoUpdateEnabled ? 'update' : 'update_disabled'" />
              </q-item-section>
              <q-item-section
                >Auto Update {{ autoUpdateEnabled ? 'Enabled' : 'Disabled' }}</q-item-section
              >
            </q-item>
            <q-item clickable @click="checkUpdates">
              <q-item-section side class="menu-icon">
                <q-icon name="system_update_alt" />
              </q-item-section>
              <q-item-section>Check for Updates</q-item-section>
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
          :menu-offset="[0, -45]"
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
      <q-card-section>
        <div class="text-h6">Storage Settings</div>
      </q-card-section>
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
          :menu-offset="[0, -45]"
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
        <q-btn
          flat
          label="OK"
          :disable="buildInProgress || monitoring"
          color="primary"
          v-close-popup
        />
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
          :instant-feedback="true"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="setupDialogOpen" persistent>
    <q-card style="min-width: 30px">
      <q-card-section>
        <div class="text-h6">Project Directory Setup</div>
      </q-card-section>
      <q-card-section class="text-center">
        <q-spinner-orbit v-if="setupInProgress" color="primary" size="3em" />
        <div class="text-subtitle1 q-mt-md">
          {{ setupMessage }}
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" :disable="setupInProgress" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="wifiDialogOpen" persistent>
    <q-card style="min-width: 625px">
      <q-card-section>
        <div class="text-h6">WiFi Settings</div>
      </q-card-section>
      <q-radio v-model="WiFiMode" val="Auto" label="Automatic (dynamic config)" />
      <q-radio v-model="WiFiMode" val="Manual" label="Client (static config)" />
      <q-radio v-model="WiFiMode" val="AP" label="Access Point (static config)" />
      <q-card-section>
        <div v-if="WiFiMode === 'Manual' || WiFiMode === 'AP'" class="row q-col-gutter-sm">
          <q-input v-model="networkName" label="WiFi network name" dense class="q-mt-sm" />
          <q-input
            v-model="wifiPassword"
            filled
            dense
            class="q-mt-sm"
            :type="isPwd ? 'password' : 'text'"
            hint="WFi network password"
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
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
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
  projectSaveFile,
} from 'src/composables/projectState'
import 'components/FabricaIODevice.vue'
import type { FabricaIODeviceProps } from 'components/FabricaIODevice.vue'
import { deviceTypes } from 'components/FabricaIODevice.vue'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Dialog } from 'quasar'
import type electronUpdater from 'electron-updater'
import { useQuasar } from 'quasar'
import { nextTick } from 'vue'

// Quasar object
const $q = useQuasar()

// App version ref
const appVersion = ref('')

// Startup code
onMounted(async () => {
  if ($q.localStorage.hasItem('updates')) {
    console.log('Update json found')
    const updateSettings = $q.localStorage.getItem('updates')
    if (updateSettings !== null) {
      const updateSettingsParsed = JSON.parse(String(updateSettings))
      autoUpdateEnabled.value =
        typeof updateSettingsParsed.auto === 'boolean' ? updateSettingsParsed.auto : true
    }
  }
  if (autoUpdateEnabled.value) {
    console.log('Checking for updates')
    await window.networkops.checkForUpdates()
  } else {
    console.log('Auto updates disabled')
  }
})

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
    label: 'WEMOS LOLIN S3',
  },
  {
    name: 'adafruit_qtpy_esp32s3_n4r2',
    label: 'Adafruit QT Py ESP32-S3 (4M Flash 2M PSRAM)',
  },
  {
    name: 'adafruit_qtpy_esp32c3',
    label: 'Adafruit QT Py ESP32-C3',
  },
  {
    name: 'esp32dev',
    label: 'ESP32 Dev (generic)',
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

// WiFi dialog and options
const wifiDialogOpen = ref(false)
const wifiPassword = ref('')
const networkName = ref('')
const WiFiMode = ref('Auto')

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

const openDocs = () => {
  window.myWindowAPI.openExternal('https://github.com/FabricaIO/FabricaIO-App/wiki/App-Usage')
}

// Tracks if auto updates are enabled
const autoUpdateEnabled = ref(true)

// Saves auto update settings
const autoUpdateToggle = () => {
  autoUpdateEnabled.value = !autoUpdateEnabled.value
  console.log('Saving update settings...')
  try {
    $q.localStorage.set('updates', JSON.stringify({ auto: autoUpdateEnabled.value }))
  } catch (e) {
    console.log(e)
  }
  console.log('Update settings saved.')
}

const checkUpdates = async () => {
  const result: electronUpdater.UpdateCheckResult = await window.networkops.checkForUpdates()
  if (result) {
    if (!result.isUpdateAvailable) {
      createDialog('Success', 'No updates available')
    }
  } else {
    createDialog('Error', 'Could not check for updates')
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

// Serial monitoring variables
const monitoring = ref(false)

// Monitors serial port
const monitorSerialPort = async () => {
  if (monitoring.value || buildInProgress.value) {
    return
  }

  if (portPath.value === '') {
    createDialog('Error', 'No serial port selected')
    return
  }

  monitoring.value = true
  buildDialogOpen.value = true
  await nextTick()
  const outputElement = document.getElementById('build-output')

  if (outputElement) {
    outputElement.textContent = `Opening serial port: ${selectedPort.value?.label || 'Unknown'}\n`
  }

  try {
    // Register event handlers before opening
    window.serialAPI.onOpened(() => {
      if (outputElement) {
        outputElement.textContent += 'Serial port opened successfully. Monitoring...\n'
      }
    })

    window.serialAPI.onData((line: string) => {
      const outputElement = document.getElementById('build-output')
      if (outputElement) {
        outputElement.textContent += line + '\n'
        outputElement.scrollTop = outputElement.scrollHeight
      }
    })

    window.serialAPI.onError((error: string) => {
      if (outputElement) {
        outputElement.textContent += `Error: ${error}\n`
      }
      monitoring.value = false
    })

    window.serialAPI.onClosed(() => {
      if (outputElement) {
        outputElement.textContent += 'Serial port closed.\n'
      }
      monitoring.value = false
    })

    // Open the port
    const baud = portSelectMode.value === 'advanced' ? parseInt(serialBaud.value) || 115200 : 115200
    const success = await window.serialAPI.openPort(selectedPort.value?.value || '', baud)

    if (!success) {
      if (outputElement) {
        outputElement.textContent += 'Failed to open serial port\n'
      }
      monitoring.value = false
    }
  } catch (error) {
    if (outputElement) {
      outputElement.textContent += `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`
    }
    monitoring.value = false
  }
}

// Stops monitoring the serial port
const stopMonitoringSerialPort = async () => {
  // Remove any old listeners from previous sessions
  window.serialAPI.removeListeners?.()
  try {
    await window.serialAPI.closePort()
    monitoring.value = false
  } catch (error) {
    console.error('Error closing serial port:', error)
    monitoring.value = false
  }
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
    createDialog('Error', 'Firmware file not found, run build first')
    return
  }
  try {
    OTAUpdateDialog.value = true
    OTAMessage.value = 'Initiating OTA update...'
    progressValue.value = 0

    const firmware = await window.fileops.readBinaryFile(firmwarePath)
    const blob = new Blob([firmware])
    const formData = new FormData()
    formData.append('firmware', blob, 'firmware.bin')

    // Create XMLHttpRequest to track upload progress
    const xhr = new XMLHttpRequest()

    // Create promise to handle the upload
    const uploadPromise = new Promise((resolve, reject) => {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          progressValue.value = event.loaded / event.total
          OTAMessage.value = `Uploading: ${Math.ceil(progressValue.value * 100)}%`
        }
      }

      xhr.onload = () => {
        if (xhr.response != 'OK' || xhr.status != 202) {
          reject(new Error(`HTTP error! status: ${xhr.status}`))
        } else {
          resolve(xhr.response)
        }
      }

      xhr.onerror = () => {
        reject(new Error('Upload failed'))
      }
    })

    // Configure and send request
    xhr.open('POST', `http://${deviceAddress.value}/update`)
    xhr.setRequestHeader(
      'Authorization',
      'Basic ' + btoa(`${deviceUsername.value}:${devicePassword.value}`),
    )
    xhr.send(formData)

    // Wait for upload to complete
    await uploadPromise

    progressValue.value = 1
    OTAMessage.value = 'Update successful! Device is rebooting...'
  } catch (error) {
    console.error('OTA Update error:', error)
    OTAMessage.value = `Error: ${error instanceof Error ? error.message : 'Upload failed'}`
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
const loadProjectDir = async (): Promise<boolean> => {
  const result = await window.fileops.getProjectDir()
  if (!result.canceled) {
    setProjectDir(result.filePaths[0] || '')
    folderText.value = result.filePaths[0] || 'None selected'
    if (!result.filePaths[0]) {
      return false
    }
    // Need to remove previous containers if folder has changed
    await deleteContainer()
    return true
  } else {
    console.log('No folder selected')
    return false
  }
}

// Lets user select a file to load project from
const loadProjectfile = async (): Promise<boolean> => {
  const result = await window.fileops.getFile('json', 'Fabrica-IO Project', getProjectDir())
  if (!result.canceled) {
    if (!result.filePaths[0]) {
      return false
    }
    projectSaveFile.value = result.filePaths[0]
    return true
  }
  return false
}

// Lets user select a file to save project as
const saveProjectfile = async (): Promise<boolean> => {
  const result = await window.fileops.saveFile('json', 'Fabrica-IO Project', getProjectDir())
  if (!result.canceled) {
    if (!result.filePath) {
      return false
    }
    projectSaveFile.value = result.filePath
    if (!projectSaveFile.value.endsWith('.json')) {
      projectSaveFile.value += '.json'
    }
    return true
  }
  return false
}

const setupDialogOpen = ref(false)
const setupMessage = ref('')
const setupInProgress = ref(false)

// Sets up a project directory by downloading repository contents
const setupProjectDir = async () => {
  if (getProjectDir() === '') {
    if (!(await loadProjectDir())) {
      return
    }
  }
  setupMessage.value = 'Downloading project files...'
  setupInProgress.value = true
  setupDialogOpen.value = true
  try {
    buildInProgress.value = true
    const zipData = await window.networkops.fetchGithubZip('FabricaIO/FabricaIO-esp32hub')
    const tempPath = await window.fileops.getTempFile('fabricaio-template.zip')

    // Save zip file
    await window.fileops.writeBinaryFile(tempPath, zipData)

    setupMessage.value = 'Extracting project files...'
    // Extract zip to project directory
    await window.fileops.extractZip(tempPath, getProjectDir())

    setupMessage.value = 'Cleaning up temporary files...'
    // Delete temp file
    await window.fileops.delete(tempPath)

    setupMessage.value = 'Project setup completed successfully!'
    setupInProgress.value = false
    buildInProgress.value = false
  } catch (error) {
    const error_message = `Error: ${error instanceof Error ? error.message : 'Setup failed'}`
    console.error('Error setting up project:', error_message)
    setupMessage.value = error_message
    setupInProgress.value = false
    buildInProgress.value = false
  }
}

// Exports a project as a JSON
const exportProject = async (force: boolean) => {
  if (projectSaveFile.value === '' || force) {
    if (!(await saveProjectfile())) {
      return
    }
  }
  window.fileops.writeFile(projectSaveFile.value, JSON.stringify(current_project.value))
  createDialog('Success', 'Project saved!')
}

// Loads a project from JSON file
const importProject = async () => {
  if (!(await loadProjectfile())) {
    return
  }
  loadProject(await window.fileops.readFile(projectSaveFile.value))
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
        success = await writeMain(
          current_project.value.storage,
          current_project.value.storage_options,
          WiFiMode.value,
        )
      }
    }
  }
  if (success) {
    success = await compileWithDocker()
  }
  if (success) {
    createDialog('Success', 'Project built successfully!')
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
const writeMain = async (storage: string, pins: number[], wifi: string): Promise<boolean> => {
  let main_text = await window.fileops.readFile(getProjectDir() + '/src/main-example.bak')
  let fileParts
  if (storage !== 'FLASH') {
    fileParts = main_text.split('Storage::begin()')
    main_text = fileParts[0] + 'Storage::begin(' + pins.join(', ') + ')' + fileParts[1]
  }
  if (wifi === 'Manual') {
    fileParts = main_text.split('// Configure WiFi client')
    main_text =
      fileParts[0] +
      '// Configure WiFi client\n\t\tWiFi.begin("' +
      networkName.value +
      '", "' +
      wifiPassword.value +
      '");' +
      fileParts[1]
  } else if (wifi === 'AP') {
    fileParts = main_text.split('// Pre-configure WiFi')
    main_text =
      fileParts[0] +
      '// Pre-configure WiFi\n\tConfiguration::currentConfig.WiFiClient = false;\n\t' +
      'Configuration::currentConfig.configSSID = "' +
      networkName.value +
      '";\n\t' +
      'Configuration::currentConfig.configPW = "' +
      wifiPassword.value +
      '";' +
      fileParts[1]
  }
  return window.fileops.writeFile(getProjectDir() + '/src/main.cpp', main_text)
}

// Builds (compiles) project with PlatformIO docker container
const compileWithDocker = async (): Promise<boolean> => {
  if (!buildInProgress.value && !monitoring.value) {
    buildInProgress.value = true
    buildDialogOpen.value = true
    const command = 'docker'

    let success = await window.shell.execCommand(command, ['-v'])
    if (!success) {
      buildDialogOpen.value = false
      createDialog(
        'Docker Missing',
        'Docker not installed. Please ensure Docker is properly installed accessible before building. For Linux, check if your user need to be in the Docker group.',
      )
      buildInProgress.value = false
      return false
    }

    // Check if container exists
    let args = ['ps', '-a']

    success = await window.shell.execCommand(command, args)
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
  } else if (monitoring.value) {
    stopMonitoringSerialPort()
    buildDialogOpen.value = false
  } else {
    buildDialogOpen.value = false
  }
}

// Flashes firmware through serial
const flashFirmware = async (): Promise<boolean> => {
  if (!buildInProgress.value && !monitoring.value) {
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
onMounted(async () => {
  appVersion.value = await window.reflection.getAppVersion()
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
