import type { FabricaIODeviceProps } from 'src/components/FabricaIODevice.vue'
import { ref } from 'vue'

interface Project {
  devices: FabricaIODeviceProps[]
}

const current_project = ref<Project>({
  devices: [],
})

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

const removeDevice = (name: string) => {
  current_project.value.devices = current_project.value.devices.filter(
    (device) => device.name !== name,
  )
}

export { current_project, addDevice, removeDevice }
