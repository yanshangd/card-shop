<template>
  <router-view />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const updateDocumentTitle = () => {
  document.title = settingsStore.settings.site_name || '自动发卡商城'
}

onMounted(() => {
  settingsStore.fetchSettings()
})

watch(() => settingsStore.settings.site_name, () => {
  updateDocumentTitle()
}, { immediate: true })
</script>
