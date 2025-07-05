<template>
  <va-modal
    v-model="isVisible"
    size="large"
    hide-default-actions
    fixed-layout
    noOutsideDismiss
  >
    <template #header>
      <div class="modal-header">
        <h4 class="modal-title">System Users</h4>
        <va-button
          @click="showAddUserForm = true"
          color="primary"
          icon="add"
          class="add-user-button"
        >
          Add User
        </va-button>
        <va-button
          @click="isVisible = false"
          icon="close"
          preset="plain"
          class="close-button"
        />
      </div>
    </template>
    <div class="user-management">
      <!-- Add User Form -->
      <va-card v-if="showAddUserForm" class="add-user-form">
        <va-card-title>Add New User</va-card-title>
        <va-card-content>
          <form @submit.prevent="handleAddUser">
            <div class="form-row">
              <div class="form-field">
                <va-input
                  v-model="newUser.email"
                  label="Email"
                  type="email"
                  :rules="[required, email]"
                  class="field-input"
                />
              </div>
              <div class="form-field">
                <va-input
                  v-model="newUser.firstName"
                  label="First Name"
                  :rules="[required]"
                  class="field-input"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <va-input
                  v-model="newUser.lastName"
                  label="Last Name"
                  :rules="[required]"
                  class="field-input"
                />
              </div>
              <div class="form-field">
                <va-select
                  v-model="newUser.department"
                  label="Department"
                  :options="departments"
                  :rules="[required]"
                  class="field-input"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <va-input
                  v-model="newUser.title"
                  label="Job Title"
                  :rules="[required]"
                  class="field-input"
                />
              </div>
              <div class="form-field">
                <va-select
                  v-model="newUser.role"
                  :options="roleOptions"
                  label="Role"
                  :rules="[requiredSelect]"
                  class="field-input"
                />
              </div>
            </div>
            <div class="form-actions">
              <va-button
                @click="showAddUserForm = false"
                color="secondary"
                class="cancel-button"
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

        <!-- <template #cell(role)="{ rowData }">
          <va-badge
            :color="getRoleColor(rowData.role)"
            :text="getRoleLabel(rowData.role)"
          />
        </template> -->

        <template #cell(actions)="{ rowData }">
          <div class="table-actions">
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
        hide-default-actions
        fixed-layout
        noOutsideDismiss
      >
        <div class="confirmation-dialog">
          <p>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
          <div class="dialog-actions">
            <va-button
              @click="showDeleteDialog = false"
              color="secondary"
              class="cancel-button"
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
