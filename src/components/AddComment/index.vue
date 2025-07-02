<template>
  <div class="add-comment">
    <div class="comment-form">
      <va-textarea
        v-model="text"
        placeholder="Add a comment... (Ctrl+Enter to submit)"
        :rows="3"
        :disabled="isSubmitting"
        @keydown="handleKeydown"
        class="comment-textarea"
      />
      <div class="form-actions">
        <div class="char-count">
          {{ text.length }}/500
        </div>
        <va-button 
          @click="submit" 
          :disabled="!isValid || isSubmitting"
          :loading="isSubmitting"
          color="primary"
          size="small"
        >
          Submit Comment
        </va-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
