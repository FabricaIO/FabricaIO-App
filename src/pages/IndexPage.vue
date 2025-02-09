<template>
  <q-page class="flex flex-center">
    <div id="project" class="q-pa-md row items-start q-gutter-md">
      <q-card
        v-for="device in current_project.devices"
        :key="device.name"
        :class="getCardClass(device.type)"
        class="my-card text-white"
      >
        <q-card-section>
          <div class="text-h6">{{ device.name }}</div>
        </q-card-section>
        <q-tabs v-model="tabs[device.name]">
          <q-tab label="Details" name="details" />
          <q-tab label="Parameters" name="parameters" />
        </q-tabs>
        <q-separator dark />
        <q-tab-panels :class="getCardClass(device.type)" v-model="tabs[device.name]" animated>
          <q-tab-panel name="details">
            <q-card-section :class="getCardClass(device.type)">
              {{ device.description }}
            </q-card-section>
            <q-separator dark />
            <q-card-actions>
              <q-btn @click="removeDevice(device.name)"> Remove Device </q-btn>
              <q-btn v-bind:href="device.repo" target="_blank" flat> Repository </q-btn>
            </q-card-actions>
          </q-tab-panel>
          <q-tab-panel name="parameters">
            <q-input
              class="my-input"
              :model-value="device.name"
              @update:model-value="(val) => updateName(device.name, val?.toString() || '')"
              debounce="500"
              label="Device Name"
              outlined
              dense
            />
            <q-input
              v-for="parameter in device.constructor"
              class="my-input"
              :key="parameter.name"
              type="text"
              v-model="parameter.default"
              :label="parameter.name"
              outlined
              dense
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, watchEffect } from 'vue'
import { current_project, removeDevice } from '../composables/projectState'
import { deviceTypes } from '../components/FabricaIODevice.vue'

const tabs = reactive<{ [key: string]: string }>({})

// Watch for changes in current_project.devices and set default tab state
watchEffect(() => {
  current_project.value.devices.forEach((device) => {
    if (!tabs[device.name]) {
      tabs[device.name] = 'parameters'
    }
  })
})

// Assign class to cards based on device type
const getCardClass = (type: deviceTypes): string => {
  switch (type) {
    case deviceTypes.Actor:
      return 'bg-primary'
    case deviceTypes.Sensor:
      return 'bg-secondary'
    default:
      return 'bg-default'
  }
}

// Checks if a device name already exists in the project
const updateName = (oldName: string, newName: string) => {
  if (current_project.value.devices.some((device) => device.name === newName)) {
    alert(`Device with name "${newName}" already exists.`)
    return
  }
  const device = current_project.value.devices.find((device) => device.name === oldName)
  if (device) {
    device.name = newName
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  width: 350px
.my-input
  background: #fff
</style>
