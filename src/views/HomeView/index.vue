<template>
  <va-page>
    <div class="home-container">
      <div class="page-header">
        <h1 class="page-title">Action Tracker</h1>
        <va-button @click="logout" outline icon="logout" class="logout-button">
          Logout
        </va-button>
      </div>
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

        <!-- Quick Filter Cards -->
        <va-card
          class="action-card filter-card"
          @click="navigateToOpenRequests"
        >
          <va-card-content>
            <va-icon name="schedule" size="large" class="card-icon" />
            <h3>Open Requests</h3>
            <p>View all pending requests</p>
            <va-button outline>View Open</va-button>
          </va-card-content>
        </va-card>

        <va-card
          class="action-card filter-card"
          @click="navigateToInProgressRequests"
        >
          <va-card-content>
            <va-icon name="trending_up" size="large" class="card-icon" />
            <h3>In Progress</h3>
            <p>Track requests being worked on</p>
            <va-button outline>View In Progress</va-button>
          </va-card-content>
        </va-card>

        <va-card
          class="action-card filter-card"
          @click="navigateToSalesRequests"
        >
          <va-card-content>
            <va-icon name="business" size="large" class="card-icon" />
            <h3>Sales Department</h3>
            <p>View sales-related requests</p>
            <va-button outline>View Sales</va-button>
          </va-card-content>
        </va-card>
      </div>
    </div>
  </va-page>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
