<script setup lang="ts">
import Versions from './components/Versions.vue'
import Updater from './components/Updater.vue'
import FrameworkTest from './components/FrameworkTest.vue'
</script>

<template>
  <FrameworkTest />
  <div class="actions">
    <div class="action">
      <Updater />
    </div>
  </div>
  <Versions />
</template>
