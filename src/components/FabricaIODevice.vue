<template>
  <div class="q-pa-md column items-start q-gutter-md">
    <q-card :class="getCardClass(type)" class="my-card text-white">
      <q-card-section>
        <div class="text-h6">{{ name }}</div>
      </q-card-section>
      <q-card-section> {{ description }} </q-card-section>
      <q-separator dark />
      <q-card-actions>
        <q-btn class="add-device" @click="addDevice(props)">Add to Project</q-btn>
        <q-btn @click="openRepo(repo)" flat> Repository </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { addDevice } from '../composables/projectState'

// Description of a device
export interface FabricaIODeviceProps {
  name: string
  type: deviceTypes
  category: string
  libname: string
  includes: string[]
  description: string
  constructor: parameter[]
  repo: string
}

// Description of a parameter for a device
export interface parameter {
  name: string
  type: string
  description: string
  default: string
}

const props = withDefaults(defineProps<FabricaIODeviceProps>(), {})

// Used for styling based on device type
const getCardClass = (type: deviceTypes) => {
  switch (type) {
    case deviceTypes.Actor:
      return 'bg-primary'
    case deviceTypes.Sensor:
      return 'bg-secondary'
    default:
      return 'bg-default'
  }
}

// Opens URL in external browser
const openRepo = (url: string) => {
  window.myWindowAPI.openExternal(url)
}
</script>

<script lang="ts">
// Available device types
export enum deviceTypes {
  Sensor,
  Actor,
  LogReceiver,
  EventReceiver,
}
</script>
