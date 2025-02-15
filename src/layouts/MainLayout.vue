<template>
  <q-layout view="lHh Lpr lFf">
    <MenuBar :leftDrawerOpen="leftDrawerOpen" @toggle-left-drawer="toggleLeftDrawer" />
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
import type { deviceTypes } from 'components/FabricaIODevice.vue'
import FabricaIODevice, { type FabricaIODeviceProps } from 'components/FabricaIODevice.vue'
import MenuBar from 'components/MenuBar.vue'
// List of available devices (temporarily hand coded, will be dynamically loaded)
const devicesList: FabricaIODeviceProps[] = [
  {
    name: 'Environmental Sensor',
    type: 0 as deviceTypes,
    category: 'Environment Sensor',
    libname: 'DFMultiEnvironmental',
    includes: ['DFMultiEnvironmental'],
    description: 'A sensor that measures temperature, humidity, and ambient light',
    constructor: [
      {
        name: 'I2C_bus',
        type: 'TwoWire*',
        description: 'The I2C bus the sensor is connected to',
        default: '&Wire',
      },
      {
        name: 'address',
        type: 'uint8_t',
        description: 'The I2C address of the sensor',
        default: '0x22',
      },
    ],
    repo: 'https://github.com/FabricaIO/sensor-DFMultiEnvironmental',
  },
  {
    name: 'Peristaltic Pump',
    type: 1 as deviceTypes,
    category: 'pump',
    libname: 'DFPeristalticPump',
    includes: ['DFPeristalticPump'],
    description: 'A pump for precise dosages controlled by servo library',
    constructor: [
      {
        name: 'Pin',
        type: 'int',
        description: 'The pin to use',
        default: '',
      },
      {
        name: 'Configfile',
        type: 'String',
        description: 'The file name to store settings in',
        default: 'DFPump.json',
      },
    ],
    repo: 'https://github.com/FabricaIO/actor-DFPeristalticPump',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
