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
        <h4 class="modal-title">Request Details</h4>
        <div class="header-actions">
          <div class="status-container" v-if="request">
            <span class="status-label">Status:</span>
            <va-badge
              :color="getStatusColor(request.status)"
              :text="request.status"
              class="status-badge-header"
            />
          </div>
          <va-button
            @click="closeModal"
            icon="close"
            preset="plain"
            class="close-button"
          />
        </div>
      </div>
    </template>

    <div v-if="request">
      <va-card>
        <va-card-title>{{ request.title }}</va-card-title>
        <va-card-content>
          <div class="request-field">
            <strong>Status:</strong>
            <va-select
              v-model="editableStatus"
              :options="statusOptions"
              @update:model-value="updateStatus"
              class="status-select"
            />
          </div>
          <div class="request-field">
            <strong>Sender:</strong> {{ request.senderName }}
          </div>
          <div class="request-field">
            <strong>Sender Department:</strong>
            {{ request.senderDepartment }}
          </div>
          <div class="request-field">
            <strong>Receiver Department:</strong>
            {{ request.receiverDepartment }}
          </div>
          <div class="request-field">
            <strong>Created:</strong>
            {{ formatDate(request.createdAt) }}
          </div>
          <div class="request-field">
            <strong>Description:</strong>
            <p>{{ request.details }}</p>
          </div>

          <!-- Request Actions -->
          <div class="request-actions" v-if="!isViewOnly">
            <va-button
              @click="enableEdit"
              color="primary"
              icon="edit"
              size="small"
              class="edit-button"
            >
              Edit Request
            </va-button>
            <va-button
              v-if="
                canDelete || canDeleteAll || request.senderId === currentUserId
              "
              @click="confirmDelete"
              color="danger"
              icon="delete"
              size="small"
            >
              Delete Request
            </va-button>
          </div>

          <!-- Comments Section -->
          <div class="comments-section">
            <h4>Comments</h4>
            <div v-if="isLoadingComments">
              <va-icon name="autorenew" spin size="large" color="primary" />
            </div>
            <div v-else-if="comments.length > 0">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="comment-item"
                :class="{ 'system-comment': comment.isSystemComment }"
              >
                <va-card
                  :class="{ 'system-comment-card': comment.isSystemComment }"
                >
                  <va-card-content>
                    <div class="comment-meta">
                      <div>
                        <va-icon
                          v-if="comment.isSystemComment"
                          name="settings"
                          size="small"
                          class="system-comment-icon"
                        />
                        <strong>{{ comment.authorName }}</strong>
                        <span class="comment-date">{{
                          formatDate(comment.createdAt)
                        }}</span>
                      </div>
                      <va-button
                        v-if="
                          !isViewOnly &&
                          !comment.isSystemComment &&
                          (canDelete ||
                            canDeleteAll ||
                            comment.authorId === currentUserId)
                        "
                        @click="confirmDeleteComment(comment.id)"
                        color="danger"
                        icon="delete"
                        size="small"
                        preset="plain"
                      />
                    </div>
                    <p
                      :class="{
                        'system-comment-text': comment.isSystemComment,
                      }"
                    >
                      {{ comment.text }}
                    </p>
                  </va-card-content>
                </va-card>
              </div>
            </div>
            <div v-else>
              <p class="no-comments">No comments yet.</p>
            </div>

            <!-- Add Comment -->
            <AddComment
              v-if="canComment"
              :isSubmittingComment="isSubmittingComment"
              @submit="handleComment"
            />
            <div v-else-if="isViewOnly" class="view-only-message">
              <p>
                <em>You have view-only access and cannot add comments.</em>
              </p>
            </div>
          </div>
        </va-card-content>
      </va-card>
    </div>

    <!-- Delete Request Confirmation Dialog -->
    <va-modal
      v-model="showDeleteDialog"
      title="Confirm Delete"
      size="small"
      :hideDefaultActions="true"
    >
      <div class="confirmation-dialog">
        <p>
          Are you sure you want to delete this request? This action cannot be
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
            @click="deleteRequest"
            color="danger"
            :loading="deletingRequest"
          >
            Delete
          </va-button>
        </div>
      </div>
    </va-modal>

    <!-- Delete Comment Confirmation Dialog -->
    <va-modal
      v-model="showDeleteCommentDialog"
      title="Confirm Delete"
      size="small"
      :hideDefaultActions="true"
    >
      <div class="confirmation-dialog">
        <p>
          Are you sure you want to delete this comment? This action cannot be
          undone.
        </p>
        <div class="dialog-actions">
          <va-button
            @click="showDeleteCommentDialog = false"
            color="secondary"
            class="cancel-button"
          >
            Cancel
          </va-button>
          <va-button
            @click="deleteComment"
            color="danger"
            :loading="deletingComment"
          >
            Delete
          </va-button>
        </div>
      </div>
    </va-modal>
  </va-modal>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
