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
        <q-btn icon="refresh" class="bg-primary text-white my-button" label="Refresh" />
        <FabricaIODevice v-for="device in devicesList" :key="device.name" v-bind="device" />
      </q-list>
    </q-drawer>
    <q-page-container>
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
import { ref } from 'vue'
import type { deviceTypes } from 'components/FabricaIODevice.vue'
import FabricaIODevice, { type FabricaIODeviceProps } from 'components/FabricaIODevice.vue'
import MenuBar from 'components/MenuBar.vue'

// List of available devices
const devicesList = ref<FabricaIODeviceProps[]>([])

const leftDrawerOpen = ref(false)
const dialogVisible = ref(false)
const repoUrl = ref('')

function openDialog() {
  dialogVisible.value = true
}

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
      const content = JSON.parse(atob(data.content))
      console.log('Fetched JSON data:', content)
      devicesList.value.unshift({
        name: content['fabrica-io'].name,
        type: content['fabrica-io'].type as deviceTypes,
        category: content['fabrica-io'].category,
        libname: content['fabrica-io'].libname,
        includes: content['fabrica-io'].includes,
        description: content['fabrica-io'].description,
        constructor: content['fabrica-io'].constructor,
        constructor_used: 0,
        repo: content.repository.url,
      })
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error)
    })
  dialogVisible.value = false
  repoUrl.value = ''
  // Eventually will save added devices to local database
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
<style lang="sass" scoped>
.my-button
  margin-left: 1em
</style>
