<template>
  <q-layout view="lHh Lpr lFf">
    <MenuBar :leftDrawerOpen="leftDrawerOpen" @toggle-left-drawer="toggleLeftDrawer" />
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="310">
      <q-list>
        <q-item-label header> Devices </q-item-label>
        <q-btn
          icon="add"
          class="bg-primary text-white my-button"
          @click="openDialog"
          label="Import"
        />
        <q-btn
          icon="refresh"
          class="bg-primary text-white my-button"
          @click="refreshDevices"
          label="Refresh"
        />
        <q-input
          v-model="search"
          debounce="150"
          class="search-class"
          filled
          placeholder="Search Devices"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <FabricaIODevice v-for="device in filteredDevices" :key="device.name" v-bind="device" />
      </q-list>
    </q-drawer>
    <q-page-container class="graph-paper">
      <router-view />
    </q-page-container>
    <q-dialog v-model="dialogVisible">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Import From Repo</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="repoUrl" label="GitHub Repository URL" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Import" color="primary" @click="importRepo" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { deviceTypes } from 'components/FabricaIODevice.vue'
import FabricaIODevice, { type FabricaIODeviceProps } from 'components/FabricaIODevice.vue'
import MenuBar from 'components/MenuBar.vue'
import { useQuasar } from 'quasar'

// Quasar object
const $q = useQuasar()

// List of available devices
const devicesList = ref<FabricaIODeviceProps[]>([])

onMounted(() => {
  if ($q.localStorage.hasItem('devices')) {
    console.log('Device json found')
    const devicesStr = $q.localStorage.getItem('devices')
    if (devicesStr !== null) {
      const deviceList = JSON.parse(String(devicesStr))
      if (Date.now() - deviceList.timestamp < 86400000) {
        console.log('Using local device database')
        deviceList.devices.forEach((device: unknown) => {
          if (typeof device === 'object' && device !== null && 'deviceJson' in device) {
            addDevice((device as { deviceJson: string }).deviceJson)
          }
        })
        return
      }
    }
  }
  console.log('Importing devices from web database')
  importDevices()
})

const leftDrawerOpen = ref(false)
const dialogVisible = ref(false)
const repoUrl = ref('')

function openDialog() {
  dialogVisible.value = true
}

function refreshDevices() {
  importDevices()
}

// Contents of search bar
const search = ref('')

// Filter device list by search term
const filteredDevices = computed(() => {
  const searchTerm = search.value.toLowerCase()
  if (!searchTerm) return devicesList.value
  return devicesList.value.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm) ||
      device.description.toLowerCase().includes(searchTerm),
  )
})

// Imports GitHub repo as device
function importRepo() {
  console.log('Importing from repo:', repoUrl.value)

  // Extract owner and repo name from GitHub URL
  const urlParts = repoUrl.value.replace('https://github.com/', '').split('/')
  const owner = urlParts[0]
  const repo = urlParts[1]

  // Use GitHub API to fetch the content
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/library.json`

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText)
      }
      return response.json()
    })
    .then((data) => {
      // GitHub API returns content as base64 encoded
      const content = window.atob(data.content)
      addDevice(content)
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error)
    })
  dialogVisible.value = false
  repoUrl.value = ''
  // Eventually will save added devices to local database
}

// Import devices from online database
function importDevices() {
  console.log('Importing devices from web database')
  fetch('https://fabrica-io.net/api/device')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText)
      }
      return response.json()
    })
    .then((data) => {
      console.log('Device JSON data:', data)
      data.forEach((device: unknown) => {
        if (typeof device === 'object' && device !== null && 'deviceJson' in device) {
          addDevice((device as { deviceJson: string }).deviceJson)
        }
      })
      const devices = {
        timestamp: Date.now(),
        devices: data,
      }
      try {
        $q.localStorage.set('devices', JSON.stringify(devices))
      } catch (e) {
        // data wasn't successfully saved due to
        // a Web Storage API error
        console.log(e)
      }
    })
}

// Add device to sidebar from JSON string
function addDevice(deviceJson: string) {
  const content = JSON.parse(deviceJson)
  console.log('Device JSON data:', content)
  // Check if device exists
  if (devicesList.value.some((d) => d.name == content['fabricaio'].name)) {
    const device_index = devicesList.value.findIndex((d) => d.name == content['fabricaio'].name)
    // Update current device
    if (device_index !== -1 && devicesList.value[device_index]) {
      devicesList.value[device_index].name = content['fabricaio'].name
      devicesList.value[device_index].type = content['fabricaio'].type as deviceTypes
      devicesList.value[device_index].category = content['fabricaio'].category
      devicesList.value[device_index].libname = content['fabricaio'].libname
      devicesList.value[device_index].includes = content['fabricaio'].includes
      devicesList.value[device_index].description = content['fabricaio'].description
      devicesList.value[device_index].constructor = content['fabricaio'].constructor
      devicesList.value[device_index].constructor_used = 0
      devicesList.value[device_index].repo = content.repository.url
    }
  } else {
    // Add new device
    devicesList.value.unshift({
      name: content['fabricaio'].name,
      type: content['fabricaio'].type as deviceTypes,
      category: content['fabricaio'].category,
      libname: content['fabricaio'].libname,
      includes: content['fabricaio'].includes,
      description: content['fabricaio'].description,
      constructor: content['fabricaio'].constructor,
      constructor_used: 0,
      repo: content.repository.url,
    })
  }
  devicesList.value.sort(function (a, b) {
    return a.name.localeCompare(b.name, undefined, { numeric: true })
  })
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style lang="sass" scoped>
.my-button
  margin-left: 1em

.graph-paper
  background-size: 1.5em 1.5em
  background-image: radial-gradient(circle, gray 1px, rgba(0, 0, 0, 0) 1px)

.search-class
  margin-top: 0.5em
  border-top: 1px solid gray
  border-bottom: 1px solid gray
</style>
