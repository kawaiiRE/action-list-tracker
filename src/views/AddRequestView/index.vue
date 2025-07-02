<template>
  <va-page>
    <div class="add-request-container">
      <div class="page-header">
        <va-button 
          @click="goBack" 
          outline 
          icon="arrow_back"
          class="back-button"
        >
          Back
        </va-button>
        <h1>Create New Request</h1>
        <div></div> <!-- Spacer for flexbox -->
      </div>

      <div class="form-container">
        <request-form @submit="onSubmit" />
      </div>
    </div>
  </va-page>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
