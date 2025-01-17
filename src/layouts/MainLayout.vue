<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> FabricaIO Project Builder </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Devices </q-item-label>
        <FabricaIODevice v-for="link in devicesList" :key="link.name" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FabricaIODevice, { type FabricaIODeviceProps } from 'components/FabricaIODevice.vue'

const devicesList: FabricaIODeviceProps[] = [
  {
    name: 'Environmental Sensor',
    description: 'A sensor that measures temperature, humidity, and ambient light',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
