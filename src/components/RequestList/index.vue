<template>
  <div class="requests-grid">
    <request-card
      v-for="r in requests"
      :key="r.id"
      :request="r"
      :can-comment="canComment"
      :can-delete="canDelete"
      :can-delete-all="canDeleteAll"
      :is-view-only="isViewOnly"
      :current-user-id="currentUserId"
      @comment="emitComment"
      @view-request="viewRequest"
      @delete-request="deleteRequest"
    />
  </div>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
