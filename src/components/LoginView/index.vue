<template>
  <div class="login-container">
    <va-card class="login-card">
      <va-card-title class="text-center">
        <h2>Action Tracker</h2>
        <p class="subtitle">Sign in to your account</p>
      </va-card-title>

      <va-card-content>
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
