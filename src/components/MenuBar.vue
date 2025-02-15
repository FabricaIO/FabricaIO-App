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
        @click="$emit('toggle-left-drawer')"
      />
      <div class="cursor-pointer non-selectable">
        Project
        <q-menu>
          <q-list dense style="min-width: 100px">
            <q-item clickable v-close-popup @click="loadProjectDir">
              <q-item-section>Open Project Directory</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="exportProject">
              <q-item-section>Save Project</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section>Load Project</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="closeApp">
              <q-item-section>Quit</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
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
</template>

<script setup lang="ts">
import { setProjectDir, getProjectDir, current_project } from 'src/composables/projectState'
import 'components/FabricaIODevice.vue'
import type { FabricaIODeviceProps } from 'components/FabricaIODevice.vue'
import { deviceTypes } from 'components/FabricaIODevice.vue'

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

// Lets user select the project directory
const loadProjectDir = async () => {
  const result = await window.fileops.getProjectDir()
  if (!result.canceled) {
    setProjectDir(result.filePaths[0] || '')
  } else {
    console.log('No file selected')
  }
}

// Exports a project as a JSON
const exportProject = async () => {
  console.log(current_project.value)
  window.fileops.writeFile(
    getProjectDir() + '/fabricaio.json',
    JSON.stringify(current_project.value),
  )
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
  switch (current_project.value.board) {
    case 'dfrobot_firebeetle2_esp32e':
      board = boards.dfrobot_firebeetle2_esp32e
      break
    default:
      board = boards.dfrobot_firebeetle2_esp32e
      break
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

// Contains the officially supported board definitions (will be dynamically loaded eventually)
const boards = {
  dfrobot_firebeetle2_esp32e:
    '[env:dfrobot_firebeetle2_esp32e]\nboard = dfrobot_firebeetle2_esp32e',
  esp32doit_devkit_v1: '[env:esp32doit-devkit-v1]\nboard = esp32doit-devkit-v1',
}
</script>
