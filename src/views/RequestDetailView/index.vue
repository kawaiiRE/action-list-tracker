<template>
  <va-page>
    <div class="request-detail-container">
      <div class="page-header">
        <div class="header-left">
          <va-button
            @click="goBack"
            icon="arrow_back"
            preset="secondary"
            class="back-button"
            round
          />
          <h1>Request Details</h1>
        </div>
        <div class="header-actions">
          <va-button @click="editRequest" color="primary" icon="edit" outline>
            Edit Request
          </va-button>
          <va-button
            @click="deleteRequest"
            color="danger"
            icon="delete"
            outline
          >
            Delete
          </va-button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <va-progress-circle indeterminate />
        <p>Loading request details...</p>
      </div>

      <!-- Request Details -->
      <div v-else-if="request" class="request-details">
        <va-card class="request-card">
          <va-card-content>
            <div class="request-header">
              <h2>{{ request.title }}</h2>
              <va-badge
                :text="request.status"
                :color="getStatusColor(request.status)"
                class="status-badge"
              />
            </div>

            <div class="request-meta">
              <div class="meta-item">
                <va-icon name="person" />
                <span>Created by: {{ request.creator }}</span>
              </div>
              <div class="meta-item">
                <va-icon name="business" />
                <span>Department: {{ request.department }}</span>
              </div>
              <div class="meta-item">
                <va-icon name="calendar_today" />
                <span>Created: {{ formatDate(request.createdAt) }}</span>
              </div>
              <div v-if="request.updatedAt" class="meta-item">
                <va-icon name="update" />
                <span>Updated: {{ formatDate(request.updatedAt) }}</span>
              </div>
            </div>

            <div class="request-details-section">
              <h3>Details</h3>
              <p>{{ request.details }}</p>
            </div>
          </va-card-content>
        </va-card>

        <!-- Comments Section -->
        <va-card class="comments-card">
          <va-card-title
            >Comments ({{ request.comments?.length || 0 }})</va-card-title
          >
          <va-card-content>
            <div
              v-if="request.comments && request.comments.length > 0"
              class="comments-list"
            >
              <div
                v-for="comment in request.comments"
                :key="comment.id"
                class="comment-item"
              >
                <div class="comment-header">
                  <strong>{{ comment.author }}</strong>
                  <span class="comment-date">{{
                    formatDate(comment.createdAt)
                  }}</span>
                </div>
                <p class="comment-text">{{ comment.text }}</p>
              </div>
            </div>
            <p v-else class="no-comments">No comments yet.</p>

            <!-- Add Comment -->
            <div class="add-comment-section">
              <h4>Add a Comment</h4>
              <va-textarea
                v-model="newComment"
                placeholder="Write your comment here..."
                rows="3"
                class="comment-input"
              />
              <va-button
                @click="addComment"
                color="primary"
                :disabled="!newComment.trim()"
                class="add-comment-button"
              >
                Add Comment
              </va-button>
            </div>
          </va-card-content>
        </va-card>
      </div>

      <!-- Error State -->
      <va-card v-else class="error-state">
        <va-card-content>
          <va-icon name="error" size="large" class="error-icon" />
          <h3>Request Not Found</h3>
          <p>The requested item could not be found.</p>
          <va-button @click="goBack" color="primary"> Go Back </va-button>
        </va-card-content>
      </va-card>
    </div>
  </va-page>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss" scoped></style>
