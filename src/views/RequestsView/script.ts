import { defineComponent } from 'vue'
import {
  getAllRequests,
  addCommentToRequest,
  type ActionRequest,
} from '@/services/firebase'
import RequestList from '@/components/RequestList/index.vue'

export default defineComponent({
  name: 'RequestsView',
  components: { RequestList },
  data() {
    return {
      allRequests: [] as ActionRequest[],
      filterStatus: '' as string,
      filterDept: '' as string,
      filterCreator: '' as string,
      search: '' as string,
      isLoading: false as boolean,
      statuses: ['Open', 'In-Progress', 'Closed'],
      departments: ['Sales', 'Legal', 'Finance', 'Other'],
      sortBy: 'createdAt' as string,
      sortOrder: 'desc' as string,
    }
  },
  computed: {
    filtered(): ActionRequest[] {
      let filtered = [...this.allRequests]

      // Apply filters
      if (this.filterStatus) {
        filtered = filtered.filter((r) => r.status === this.filterStatus)
      }
      if (this.filterDept) {
        filtered = filtered.filter((r) => r.department === this.filterDept)
      }
      if (this.filterCreator) {
        filtered = filtered.filter((r) =>
          r.creator.toLowerCase().includes(this.filterCreator.toLowerCase()),
        )
      }

      // Apply search
      if (this.search) {
        const searchTerm = this.search.toLowerCase()
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(searchTerm) ||
            r.details.toLowerCase().includes(searchTerm) ||
            r.creator.toLowerCase().includes(searchTerm),
        )
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aVal = a[this.sortBy as keyof ActionRequest]
        let bVal = b[this.sortBy as keyof ActionRequest]

        if (this.sortBy === 'createdAt') {
          aVal = a.createdAt
          bVal = b.createdAt
        }

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }

        if (aVal != null && bVal != null) {
          if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1
          if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1
        }
        return 0
      })

      return filtered
    },
    uniqueCreators(): string[] {
      const creators = this.allRequests.map((r) => r.creator)
      return [...new Set(creators)].sort()
    },
  },
  async created() {
    await this.loadRequests()
  },
  methods: {
    async loadRequests() {
      this.isLoading = true
      try {
        this.allRequests = await getAllRequests()
      } catch (error) {
        console.error('Error loading requests:', error)
        this.$vaToast.init({
          message: 'Error loading requests',
          color: 'danger',
        })
      } finally {
        this.isLoading = false
      }
    },
    async onAddComment({ id, text }: { id: string; text: string }) {
      try {
        await addCommentToRequest(id, text)
        this.$vaToast.init({
          message: 'Comment added successfully',
          color: 'success',
        })
        // Refresh the requests to show new comment
        await this.loadRequests()
      } catch (error) {
        console.error('Error adding comment:', error)
        this.$vaToast.init({
          message: 'Error adding comment',
          color: 'danger',
        })
      }
    },
    clearFilters() {
      this.filterStatus = ''
      this.filterDept = ''
      this.filterCreator = ''
      this.search = ''
    },
    goToAddRequest() {
      this.$router.push('/requests/add')
    },
  },
})
