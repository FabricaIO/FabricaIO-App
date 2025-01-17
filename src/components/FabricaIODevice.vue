<template>
  <div class="q-pa-md">
    <q-list>
      <q-item style="border: 1px solid black" clickable v-ripple>
        <q-item-section>
          <q-item-label>{{ name }}</q-item-label>
          {{ description }}
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
export interface FabricaIODeviceProps {
  name: string
  description: string
}

withDefaults(defineProps<FabricaIODeviceProps>(), {})
</script>
