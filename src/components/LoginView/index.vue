<template>
  <div class="login-container">
    <div class="logos-container">
      <img
        src="@/assets/azad-logo.svg"
        alt="Right Logo"
        class="logo logo-right"
      />
      <img
        src="@/assets/1730296212_1713508690_Bawabat Alsenaya 5.webp"
        alt="Left Logo"
        class="logo logo-left"
      />
    </div>
    <div class="login-content">
      <div class="login-header">
        <h1>AZAD Properties : BAS - Project Integration</h1>
      </div>
      <va-card class="login-card">
        <va-card-title class="login-card-title">
          <p class="subtitle">Sign in to your account</p>
        </va-card-title>

        <va-card-content>
          <!-- Session expired alert -->
          <va-alert
            v-if="sessionExpired"
            color="warning"
            class="session-expired-alert"
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
              class="login-input"
              :error="!!loginError"
            />

            <va-input
              v-model="form.password"
              label="Password"
              type="password"
              :rules="[required]"
              class="login-input"
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
  </div>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
