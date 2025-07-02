<template>
  <va-page>
    <div class="home-container">
      <h1 class="page-title">Action Tracker</h1>
      <p class="page-subtitle">Manage and track your requests efficiently</p>
      
      <div class="action-cards">
        <va-card class="action-card" @click="navigateToRequests">
          <va-card-content>
            <va-icon name="list" size="large" class="card-icon" />
            <h3>View All Requests</h3>
            <p>Browse, filter, and manage existing requests</p>
            <va-button>Go to Requests</va-button>
          </va-card-content>
        </va-card>

        <va-card class="action-card" @click="navigateToAddRequest">
          <va-card-content>
            <va-icon name="add" size="large" class="card-icon" />
            <h3>Add New Request</h3>
            <p>Create a new request for your team</p>
            <va-button color="primary">Create Request</va-button>
          </va-card-content>
        </va-card>
      </div>
    </div>
  </va-page>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
