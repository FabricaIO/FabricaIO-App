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
      <div class="cursor-pointer non-selectable">
        <q-icon name="computer" />
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
            <q-item clickable v-close-popup @click="openBoardDialog">
              <q-item-section side class="menu-icon">
                <q-icon name="developer_board" />
              </q-item-section>
              <q-item-section>
                Choose Board: {{ getBoardLabel(current_project.board) }}
              </q-item-section>
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
      <q-separator vertical spaced color="white" />
      <q-item-section>Current project folder: {{ folderText }}</q-item-section>
      <q-space />
      <q-btn
        on-left
        flat
        dense
        round
        icon="build"
        aria-label="Build"
        label="Build Project"
        @click="buildProject"
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
import { computed, ref } from 'vue'

// Text for current project directory
const folderText = ref('None selected')

// Board selection options
const boardDialogOpen = ref(false)
const boardSelectMode = ref('preset')
const customBoard = ref('')

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

// Contains the officially supported board definitions (will be dynamically loaded eventually)
const boards = ref({
  dfrobot_firebeetle2_esp32e: {
    env: '[env:dfrobot_firebeetle2_esp32e]\nboard = dfrobot_firebeetle2_esp32e',
    label: 'DFRobot FireBeetle 2 ESP32-E',
  },
  esp32doit_devkit_v1: {
    env: '[env:esp32doit-devkit-v1]\nboard = esp32doit-devkit-v1',
    label: 'ESP32 DOIT DevKit V1',
  },
})

// Opens the board selection dialog
const openBoardDialog = () => {
  boardDialogOpen.value = true
}

// Save selected board
const saveBoard = () => {
  if (boardSelectMode.value === 'preset') {
    current_project.value.board = selectedBoard.value
  } else {
    // For custom boards, store the custom definition
    current_project.value.board = customBoard.value
  }
}

// Extracts the board value from the selected board
const selectedBoard = computed({
  get: () => current_project.value.board || '',
  set: (choice: { label: string; value: string }) => {
    current_project.value.board = choice.value
  },
})

// Options for board dropdown selector
const boardOptions = Object.entries(boards.value).map(([value, board]) => ({
  label: board.label,
  value: value,
}))

// Fixes the label to a friendly name in dropdown
const getBoardLabel = (boardId: string): string => {
  if (!boardId) return 'Select a board'
  return boards.value[boardId as keyof typeof boards.value]?.label || boardId
}

// Lets user select the project directory
const loadProjectDir = async () => {
  const result = await window.fileops.getProjectDir()
  if (!result.canceled) {
    setProjectDir(result.filePaths[0] || '')
    folderText.value = result.filePaths[0] || 'None selected'
  } else {
    console.log('No file selected')
  }
}

// Exports a project as a JSON
const exportProject = async () => {
  if (getProjectDir() === '') {
    alert('No project directory selected')
    return
  }
  window.fileops.writeFile(
    getProjectDir() + '/fabricaio.json',
    JSON.stringify(current_project.value),
  )
}

// Loads a project from JSON file
const importProject = async () => {
  if (getProjectDir() === '') {
    alert('No project directory selected')
    return
  }
  loadProject(await window.fileops.readFile(getProjectDir() + '/fabricaio.json'))
}

// Builds a project by creating the necessary source files from the current project
const buildProject = async () => {
  if (getProjectDir() === '') {
    alert('No project directory selected')
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

  current_project.value.devices.forEach((device) => {
    if (!first) {
      constructors += '\t\t'
      receivers += '\t'
      devices += '\t'
      libs += '\t'
    } else {
      first = false
    }
    const lib_buff = buildLibs(device)
    const include_buff = buildIncludes(device)
    if (!libs_array.includes(lib_buff)) {
      libs += lib_buff + '\n'
      libs_array.push(lib_buff)
    }
    if (!includes_array.includes(include_buff)) {
      includes += include_buff + '\n'
      includes_array.push(include_buff)
    }
    constructors += buildConstructors(device) + '\n'
    receivers += buildReceiverLoaders(device) + '\n'
    devices += buildDeviceLoaders(device) + '\n'
  })
  if (await window.fileops.makeDir(getProjectDir() + '/lib/DeviceLoader/src/')) {
    writeDeviceLoaderh(includes, constructors)
  }
  writeDeviceLoadercpp(receivers, devices)
  let board = ''
  if (boardSelectMode.value === 'preset') {
    board =
      boards.value[current_project.value.board as keyof typeof boards.value]?.env ||
      boards.value.dfrobot_firebeetle2_esp32e.env
  } else if (boardSelectMode.value === 'custom') {
    board = '[env:' + current_project.value.board + ']\nboard = ' + current_project.value.board
  }
  writePlatformIOini(libs, board)
}

// Builds the constructor string for a device
const buildConstructors = (device: FabricaIODeviceProps): string => {
  let constructor = device.libname + ' ' + device.name.replaceAll(' ', '') + '{'
  let first = true
  device.constructor[device.constructor_used]?.forEach((param) => {
    if (first) {
      first = false
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
    includes += '#include <' + include + '.h>' + '\n'
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
const writePlatformIOini = async (libs: string, board: string): Promise<boolean> => {
  let platformIOini = await window.fileops.readFile(getProjectDir() + '/platformio-example.ini')

  let fileParts = platformIOini.split('; Place additional libraries here')
  platformIOini = fileParts[0] + libs + fileParts[1]

  fileParts = platformIOini.split('; Add necessary board definitions here')
  platformIOini = fileParts[0] + board + fileParts[1]

  return window.fileops.writeFile(getProjectDir() + '/platformio.ini', platformIOini)
}
</script>

<style lang="sass" scoped>
.menu-icon
  padding-right: 3px
</style>
