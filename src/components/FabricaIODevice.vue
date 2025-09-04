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
        <q-btn @click="openRepo(repo)" flat> Details </q-btn>
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
  keywords: string
  libname: string
  includes: string[]
  description: string
  constructor: parameter[][]
  constructor_used: number
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
      return 'sensorCard'
    case deviceTypes.Sensor:
      return 'actorCard'
    case deviceTypes.EventReceiver:
      return 'eventCard'
    case deviceTypes.LogReceiver:
      return 'loggerCard'
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
