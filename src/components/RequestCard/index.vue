<template>
  <va-card class="request-card clickable-card" @click="handleCardClick">
    <va-card-content>
      <!-- Header with title and status -->
      <div class="card-header">
        <h3 class="request-title">{{ request.title }}</h3>
        <va-badge
          :text="request.status"
          :color="statusColor"
          class="status-badge"
        />
      </div>

      <!-- Request metadata -->
      <div class="request-meta">
        <div class="meta-item">
          <va-icon name="person" size="small" />
          <span><strong>Sender:</strong> {{ request.senderName }}</span>
        </div>
        <div class="meta-item">
          <va-icon name="business" size="small" />
          <span><strong>From:</strong> {{ request.senderDepartment }}</span>
        </div>
        <div class="meta-item">
          <va-icon name="business" size="small" />
          <span><strong>To:</strong> {{ request.receiverDepartment }}</span>
        </div>
        <div class="meta-item">
          <va-icon name="schedule" size="small" />
          <span><strong>Created:</strong> {{ formattedDate }}</span>
        </div>
      </div>

      <!-- Request details -->
      <div class="request-details">
        <p>{{ request.details }}</p>
      </div>

      <!-- Actions -->
      <div class="card-actions" @click.stop>
        <va-button
          @click="viewDetails"
          color="primary"
          size="small"
          icon="visibility"
        >
          View Details
        </va-button>
        <va-button
          v-if="!isViewOnly"
          @click="toggleComments"
          outline
          size="small"
          :icon="showComments ? 'expand_less' : 'expand_more'"
        >
          {{ showComments ? 'Hide' : 'Show' }} Comments
          <span v-if="comments.length > 0">({{ comments.length }})</span>
        </va-button>
        <va-button
          v-if="canDeleteThis"
          @click="deleteRequest"
          color="danger"
          size="small"
          icon="delete"
          outline
        >
          Delete
        </va-button>
      </div>

      <!-- Comments section -->
      <va-collapse v-model="showComments">
        <div class="comments-section">
          <h4>Comments</h4>

          <!-- Loading comments -->
          <div v-if="loadingComments" class="loading-comments">
            <va-progress-circle indeterminate size="small" />
            <span>Loading comments...</span>
          </div>

          <!-- Existing comments -->
          <div v-else-if="comments.length > 0" class="comments-list">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-content">
                <p>{{ comment.text }}</p>
                <small class="comment-date">
                  {{ new Date(comment.createdAt).toLocaleString() }}
                </small>
              </div>
            </div>
          </div>

          <!-- No comments message -->
          <div v-else class="no-comments">
            <p>No comments yet. Be the first to add one!</p>
          </div>

          <!-- Add comment form -->
          <div v-if="canCommentThis" class="add-comment-section">
            <add-comment @submit="onComment" />
          </div>

          <!-- View only message -->
          <div v-else-if="isViewOnly" class="view-only-message">
            <p class="text-muted">
              <em>You have view-only access and cannot add comments.</em>
            </p>
          </div>
        </div>
      </va-collapse>
    </va-card-content>
  </va-card>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
