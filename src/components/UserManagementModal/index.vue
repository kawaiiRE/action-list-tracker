<template>
  <va-modal
    v-model="isVisible"
    title="User Management"
    size="large"
    :hide-default-actions="true"
    @ok="close"
    @cancel="close"
  >
    <div class="user-management">
      <!-- Header with Add User button -->
      <div class="d-flex justify-between align-center mb-4">
        <h4>System Users</h4>
        <va-button @click="showAddUserForm = true" color="primary" icon="add">
          Add User
        </va-button>
      </div>

      <!-- Add User Form -->
      <va-card v-if="showAddUserForm" class="mb-4">
        <va-card-title>Add New User</va-card-title>
        <va-card-content>
          <form @submit.prevent="handleAddUser">
            <div class="row">
              <div class="flex md6">
                <va-input
                  v-model="newUser.email"
                  label="Email"
                  type="email"
                  :rules="[required, email]"
                  class="mb-3"
                />
              </div>
              <div class="flex md6">
                <va-input
                  v-model="newUser.firstName"
                  label="First Name"
                  :rules="[required]"
                  class="mb-3"
                />
              </div>
            </div>
            <div class="row">
              <div class="flex md6">
                <va-input
                  v-model="newUser.lastName"
                  label="Last Name"
                  :rules="[required]"
                  class="mb-3"
                />
              </div>
              <div class="flex md6">
                <va-select
                  v-model="newUser.department"
                  label="Department"
                  :options="departments"
                  :rules="[required]"
                  class="mb-3"
                />
              </div>
            </div>
            <div class="row">
              <div class="flex md6">
                <va-input
                  v-model="newUser.title"
                  label="Job Title"
                  :rules="[required]"
                  class="mb-3"
                />
              </div>
              <div class="flex md6">
                <va-select
                  v-model="newUser.role"
                  :options="roleOptions"
                  label="Role"
                  :rules="[requiredSelect]"
                  class="mb-3"
                />
              </div>
            </div>
            <div class="d-flex justify-end">
              <va-button
                @click="showAddUserForm = false"
                color="secondary"
                class="mr-2"
              >
                Cancel
              </va-button>
              <va-button
                type="submit"
                color="primary"
                :loading="addingUser"
                :disabled="!isNewUserFormValid"
              >
                Add User
              </va-button>
            </div>
          </form>
        </va-card-content>
      </va-card>

      <!-- Users Table -->
      <va-data-table
        :items="users"
        :columns="columns"
        :loading="loading"
        striped
      >
        <template #cell(name)="{ rowData }">
          {{ rowData.firstName }} {{ rowData.lastName }}
        </template>

        <template #cell(role)="{ rowData }">
          <va-badge
            :color="getRoleColor(rowData.role)"
            :text="getRoleLabel(rowData.role)"
          />
        </template>

        <template #cell(actions)="{ rowData }">
          <div class="d-flex gap-2">
            <va-select
              v-model="rowData.role"
              :options="roleOptions"
              size="small"
              class="role-select"
              @update:model-value="updateUserRole(rowData.uid, $event)"
            />
            <va-button
              @click="confirmDeleteUser(rowData.uid)"
              color="danger"
              icon="delete"
              size="small"
              preset="plain"
              :disabled="rowData.uid === currentUserId"
            />
          </div>
        </template>
      </va-data-table>

      <!-- Delete User Confirmation Dialog -->
      <va-modal
        v-model="showDeleteDialog"
        title="Confirm Delete"
        size="small"
        :hide-default-actions="true"
      >
        <div class="pa-4">
          <p>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
          <div class="d-flex justify-end mt-4">
            <va-button
              @click="showDeleteDialog = false"
              color="secondary"
              class="mr-2"
            >
              Cancel
            </va-button>
            <va-button
              @click="deleteUser"
              color="danger"
              :loading="deletingUser"
            >
              Delete
            </va-button>
          </div>
        </div>
      </va-modal>
    </div>
  </va-modal>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
