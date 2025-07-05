<template>
  <div class="user-avatar-container">
    <va-avatar
      :color="avatarColor"
      size="medium"
      class="user-avatar"
      @click="toggleDropdown"
    >
      {{ initials }}
    </va-avatar>

    <va-dropdown
      v-model="showDropdown"
      :placement="'bottom-end'"
      :close-on-anchor-click="false"
    >
      <template #anchor>
        <div></div>
      </template>

      <va-card class="user-dropdown">
        <va-card-content>
          <div class="user-info">
            <div class="user-name">{{ fullName }}</div>
            <div class="user-email">{{ userProfile?.email }}</div>
            <div class="user-details">
              <div class="detail-item">
                <strong>Department:</strong> {{ userProfile?.department }}
              </div>
              <div class="detail-item">
                <strong>Title:</strong> {{ userProfile?.title }}
              </div>
            </div>
          </div>

          <div class="dropdown-actions">
            <va-button
              @click="editProfile"
              color="primary"
              size="small"
              icon="edit"
              class="edit-profile-button"
              block
            >
              Edit Profile
            </va-button>
            <va-button
              @click="logout"
              color="danger"
              size="small"
              icon="logout"
              outline
              block
            >
              Logout
            </va-button>
          </div>
        </va-card-content>
      </va-card>
    </va-dropdown>
  </div>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
