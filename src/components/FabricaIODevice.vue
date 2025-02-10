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
        <q-btn v-bind:href="repo" target="_blank" flat> Repository </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { addDevice } from '../composables/projectState'

export interface FabricaIODeviceProps {
  name: string
  description: string
  repo: string
  type: deviceTypes
}

const props = withDefaults(defineProps<FabricaIODeviceProps>(), {})

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
</script>

<script lang="ts">
export enum deviceTypes {
  Actor,
  Sensor,
}
</script>
