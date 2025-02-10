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
        <FabricaIODevice v-for="device in devicesList" :key="device.name" v-bind="device" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FabricaIODevice, {
  deviceTypes,
  type FabricaIODeviceProps,
} from 'components/FabricaIODevice.vue'

const devicesList: FabricaIODeviceProps[] = [
  {
    name: 'Environmental Sensor',
    description: 'A sensor that measures temperature, humidity, and ambient light',
    repo: 'https://github.com/FabricaIO/sensor-DFMultiEnvironmental',
    type: deviceTypes.Sensor,
  },
  {
    name: 'Peristaltic Pump',
    description: 'Peristaltic pump controller using servo style controls',
    repo: 'https://github.com/FabricaIO/actor-DFPeristalticPump',
    type: deviceTypes.Actor,
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
