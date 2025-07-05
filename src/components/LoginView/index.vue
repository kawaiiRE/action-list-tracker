<template>
  <div class="login-container">
    <va-card class="login-card">
      <va-card-title class="text-center">
        <h2>AZAD Properties : BAS - Project Integration</h2>
        <p class="subtitle">Sign in to your account</p>
      </va-card-title>

      <va-card-content>
        <!-- Session expired alert -->
        <va-alert
          v-if="sessionExpired"
          color="warning"
          class="mb-4"
          border="left"
          border-color="warning"
        >
          <template #title>Session Expired</template>
          Your session has expired. Please log in again to continue.
        </va-alert>

        <form @submit.prevent="handleLogin">
          <va-input
            v-model="form.email"
            label="Email"
            type="email"
            :rules="[required, email]"
            class="mb-3"
            :error="!!loginError"
          />

          <va-input
            v-model="form.password"
            label="Password"
            type="password"
            :rules="[required]"
            class="mb-4"
            :error="!!loginError"
            :error-messages="loginError ? [loginError] : []"
          />

          <va-button
            type="submit"
            color="primary"
            block
            :loading="isLoggingIn"
            :disabled="!isFormValid"
          >
            Sign In
          </va-button>
        </form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
