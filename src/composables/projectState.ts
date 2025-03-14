import type { FabricaIODeviceProps } from 'src/components/FabricaIODevice.vue'
import { ref } from 'vue'
import { Dialog, extend } from 'quasar'

// Project directory
let project_dir = ''

// Describes a project
interface Project {
  devices: FabricaIODeviceProps[]
  board: string
  partition: string
  storage: string
  storage_options: number[]
  lib_deps: string[]
}

// Contains the current project description
const current_project = ref<Project>({
  devices: [],
  board: 'dfrobot_firebeetle2_esp32e',
  partition: '',
  storage: 'FLASH',
  storage_options: [],
  lib_deps: [],
})

// Sets project directory
const setProjectDir = (dir: string) => {
  project_dir = dir
}

// Gets current project dir
const getProjectDir = (): string => {
  return project_dir
}

// Adds a device to the current project
const addDevice = (device: FabricaIODeviceProps) => {
  const deviceExists = current_project.value.devices.some(
    (existingDevice) => existingDevice.name === device.name,
  )
  if (!deviceExists) {
    // Create a deep copy to ensure devices are independent
    current_project.value.devices.push(extend(true, {}, device))
  } else {
    Dialog.create({
      title: 'Error',
      message: `Device with name "${device.name}" already exists.`,
      ok: {
        flat: true,
      },
    })
  }
}

// Removes a device from the current project
const removeDevice = (name: string) => {
  current_project.value.devices = current_project.value.devices.filter(
    (device) => device.name !== name,
  )
}

// Loads a project
const loadProject = (project: string): boolean => {
  let loadedProject
  try {
    loadedProject = JSON.parse(project) as Project
  } catch {
    console.log('Could not parse project file. Content received:\n')
    console.log(project)
    return false
  }
  current_project.value = extend(true, {}, loadedProject)
  return true
}

export { getProjectDir, setProjectDir, current_project, addDevice, removeDevice, loadProject }
