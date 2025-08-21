<template>
  <q-page class="flex flex-center">
    <div id="project" class="q-pa-md row items-start q-gutter-md">
      <q-card
        v-for="(device, index) in current_project.devices"
        :key="`${device.libname}-${index}`"
        :class="getCardClass(device.type)"
        class="my-card text-white"
      >
        <q-card-section>
          <div class="text-h6">{{ device.name }}</div>
        </q-card-section>
        <q-tabs v-model="tabs[`${device.libname}-${index}`]">
          <q-tab label="Details" name="details" />
          <q-tab
            v-for="(overload, index) in device.constructor"
            :key="'tab' + index"
            :label="'Constructor ' + (index + 1)"
            :name="'constructor' + index"
          />
        </q-tabs>
        <q-separator dark />
        <q-tab-panels
          :class="getCardClass(device.type)"
          v-model="tabs[`${device.libname}-${index}`]"
          animated
        >
          <q-tab-panel name="details">
            <q-card-section :class="getCardClass(device.type)">
              {{ device.description }}
            </q-card-section>
            <q-separator dark />
            <q-card-actions>
              <q-btn @click="removeDevice(device.name)" color="red"> Remove Device </q-btn>
              <q-btn @click="openRepo(device.repo)" flat> Details </q-btn>
            </q-card-actions>
          </q-tab-panel>
          <q-tab-panel
            v-for="(overload, index) in device.constructor"
            v-bind:key="'param' + String(index)"
            :name="'constructor' + String(index)"
          >
            <q-radio
              :key="'constructor_sel_' + index"
              v-model="device.constructor_used"
              :val="index"
              label="Use this constructor"
              outlined
              keep-color
              color="white"
            />
            <q-input
              class="my-input"
              :model-value="device.name"
              @update:model-value="
                (val: string | number | null) => updateName(device.name, val?.toString() || '')
              "
              label="Device Name"
              :debounce="500"
              outlined
              dense
            />
            <q-input
              v-for="constructor in overload"
              class="my-input"
              :key="device.name + constructor.name + index"
              type="text"
              v-model="constructor.default"
              :label="constructor.name"
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
import { Dialog } from 'quasar'

const tabs = reactive<{ [key: string]: string }>({})

// Watch for changes in current_project.devices and set default tab state
watchEffect(() => {
  current_project.value.devices.forEach((device, index) => {
    if (!tabs[`${device.libname}-${index}`]) {
      tabs[`${device.libname}-${index}`] = 'constructors'
    }
  })
})

// Assign class to cards based on device type
const getCardClass = (type: deviceTypes): string => {
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

// Opens a URL in the external browser
const openRepo = (url: string) => {
  window.myWindowAPI.openExternal(url)
}

// Checks if a device name already exists in the project
const updateName = (oldName: string, newName: string) => {
  if (newName === '') {
    Dialog.create({
      title: 'Error',
      message: `Device name cannot be blank`,
      ok: {
        flat: true,
      },
    })
    return
  }
  if (current_project.value.devices.some((device) => device.name === newName)) {
    Dialog.create({
      title: 'Error',
      message: `Device with name "${newName}" already exists in this project. Please use a different name.`,
      ok: {
        flat: true,
      },
    })
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
