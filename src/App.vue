<template>
  <va-app>
    <HomePage />
  </va-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HomePage from './components/HomePage/index.vue'

export default defineComponent({
  name: 'App',
  components: {
    HomePage,
  },
})
</script>

<style>
/* Global styles can go here if needed */
</style>
