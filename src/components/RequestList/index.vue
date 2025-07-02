<template>
  <div class="requests-grid">
    <request-card
      v-for="r in requests"
      :key="r.id"
      :request="r"
      @comment="emitComment"
    />
  </div>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
