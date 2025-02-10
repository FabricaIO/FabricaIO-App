import type { FabricaIODeviceProps } from 'src/components/FabricaIODevice.vue'
import { ref } from 'vue'

// Describes a project
interface Project {
  devices: FabricaIODeviceProps[]
  board: string
  lib_deps: string[]
}

// Contains the current project description
const current_project = ref<Project>({
  devices: [],
  board: 'dfrobot_firebeetle2_esp32e',
  lib_deps: [],
})

// Adds a device to the current project
const addDevice = (device: FabricaIODeviceProps) => {
  const deviceExists = current_project.value.devices.some(
    (existingDevice) => existingDevice.name === device.name,
  )
  if (!deviceExists) {
    current_project.value.devices.push({ ...device })
  } else {
    alert(`Device with name "${device.name}" already exists.`)
  }
}

// Removes a device from the current project
const removeDevice = (name: string) => {
  current_project.value.devices = current_project.value.devices.filter(
    (device) => device.name !== name,
  )
}

export { current_project, addDevice, removeDevice }
