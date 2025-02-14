<template>
  <q-header elevated>
    <q-bar class="q-electron-drag">
      <q-icon name="sensors" />
      <div>Fabrica-IO Builder</div>

      <q-space />

      <q-btn dense flat icon="minimize" @click="minimize" />
      <q-btn dense flat icon="crop_square" @click="toggleMaximize" />
      <q-btn dense flat icon="close" @click="closeApp" />
    </q-bar>

    <div class="q-pa-sm q-pl-md row items-center">
      <q-btn
        flat
        dense
        round
        icon="menu"
        style="margin-right: 0.5em"
        aria-label="Menu"
        @click="$emit('toggle-left-drawer')"
      />
      <div class="cursor-pointer non-selectable">
        File
        <q-menu>
          <q-list dense style="min-width: 100px">
            <q-item clickable v-close-popup @click="getProjectDir">
              <q-item-section>Open Project Directory</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup @click="closeApp">
              <q-item-section>Quit</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </div>
  </q-header>
</template>

<script setup lang="ts">
import { setProjectDir } from 'src/composables/projectState'

defineProps<{
  leftDrawerOpen: boolean
}>()

// We guard the Electron API calls with the optional chaining JS operator,
// but this is only needed if we build same app with other Quasar Modes
// as well (SPA/PWA/Cordova/SSR...)

const minimize = () => {
  window.myWindowAPI?.minimize()
}

const toggleMaximize = () => {
  window.myWindowAPI?.toggleMaximize()
}

const closeApp = () => {
  window.myWindowAPI?.close()
}

const getProjectDir = async () => {
  const result = await window.fileops.getProjectDir()
  if (!result.canceled) {
    setProjectDir(result.filePaths[0] || '')
  } else {
    console.log('No file selected')
  }
}
</script>
