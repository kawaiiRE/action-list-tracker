<template>
  <div class="requests-grid">
    <request-card
      v-for="r in requests"
      :key="r.id"
      :request="r"
      @comment="emitComment"
      @view-request="viewRequest"
      @delete-request="deleteRequest"
    />
  </div>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
