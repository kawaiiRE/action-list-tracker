<template>
  <va-page>
    <div class="login-container">
      <div class="login-card">
        <va-card>
          <va-card-content>
            <div class="login-header">
              <va-icon name="account_circle" size="large" class="login-icon" />
              <h1>Action Tracker</h1>
              <p>Welcome back! Please sign in to continue.</p>
            </div>
            
            <div class="login-form">
              <va-button 
                @click="enter" 
                size="large" 
                color="primary" 
                class="login-button"
              >
                Enter Application
              </va-button>
            </div>
            
            <div class="login-footer">
              <p>For demo purposes, click "Enter Application" to proceed</p>
            </div>
          </va-card-content>
        </va-card>
      </div>
    </div>
  </va-page>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
