import { defineComponent, type PropType } from 'vue'
import type { ActionRequest } from '@/services/firebase'
import draggable from 'vuedraggable'

export interface ExportField {
  key: string
  label: string
  selected: boolean
  order: number
}

export default defineComponent({
  name: 'ExportModal',
  components: {
    draggable,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    requests: {
      type: Array as PropType<ActionRequest[]>,
      default: () => [],
    },
    currentFilters: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      exportLoading: false,
      includeComments: false,
      applyCurrentFilters: true,
      useDateRange: false,
      dateFrom: null as Date | null,
      dateTo: null as Date | null,
      exportFields: [
        { key: 'title', label: 'Request Title', selected: true, order: 1 },
        {
          key: 'senderName',
          label: 'Requestor Name',
          selected: true,
          order: 2,
        },
        {
          key: 'senderDepartment',
          label: 'Requestor Department',
          selected: true,
          order: 3,
        },
        {
          key: 'receiverDepartment',
          label: 'Assigned Department',
          selected: true,
          order: 4,
        },
        { key: 'status', label: 'Status', selected: true, order: 5 },
        { key: 'details', label: 'Description', selected: true, order: 6 },
        { key: 'createdAt', label: 'Date Created', selected: true, order: 7 },
        { key: 'updatedAt', label: 'Date Modified', selected: false, order: 8 },
      ] as ExportField[],
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.modelValue
      },
      set(value: boolean) {
        this.$emit('update:modelValue', value)
      },
    },
    hasSelectedFields() {
      return this.exportFields.some((field) => field.selected)
    },
    sortedExportFields: {
      get() {
        return [...this.exportFields].sort((a, b) => a.order - b.order)
      },
      set(value: ExportField[]) {
        // Update the order property based on the new array position
        value.forEach((field, index) => {
          field.order = index + 1
        })
        this.exportFields = value
      },
    },
    requestsToExport() {
      let filteredRequests = [...this.requests]

      // Apply current filters if requested
      if (this.applyCurrentFilters && this.currentFilters) {
        // Apply the filters passed from parent component
        filteredRequests = filteredRequests.filter((request) => {
          // Status filter
          const statusMatch =
            !this.currentFilters.status ||
            this.currentFilters.status === 'All' ||
            request.status === this.currentFilters.status

          // Department filters
          const senderDepartmentMatch =
            !this.currentFilters.senderDepartment ||
            this.currentFilters.senderDepartment === 'All Sender Departments' ||
            request.senderDepartment === this.currentFilters.senderDepartment

          const receiverDepartmentMatch =
            !this.currentFilters.receiverDepartment ||
            this.currentFilters.receiverDepartment ===
              'All Receiver Departments' ||
            request.receiverDepartment ===
              this.currentFilters.receiverDepartment

          // Search filter
          const searchMatch =
            !this.currentFilters.search ||
            request.title
              ?.toLowerCase()
              ?.includes(this.currentFilters.search?.toLowerCase()) ||
            request.details
              ?.toLowerCase()
              ?.includes(this.currentFilters.search?.toLowerCase()) ||
            request.senderName
              ?.toLowerCase()
              ?.includes(this.currentFilters.search?.toLowerCase())

          return (
            statusMatch &&
            senderDepartmentMatch &&
            receiverDepartmentMatch &&
            searchMatch
          )
        })
      }

      // Apply date range filter if enabled
      if (this.useDateRange) {
        filteredRequests = filteredRequests.filter((request) => {
          const requestDate = request.createdAt

          // From date filter
          const fromDateMatch =
            !this.dateFrom || requestDate >= this.dateFrom.getTime()

          // To date filter
          const toDateMatch =
            !this.dateTo || requestDate <= this.dateTo.getTime()

          return fromDateMatch && toDateMatch
        })
      }

      return filteredRequests
    },
  },
  methods: {
    closeModal() {
      this.isVisible = false
    },
    async exportToExcel() {
      this.exportLoading = true
      try {
        // Get the filtered data to export
        const dataToExport = this.requestsToExport

        if (dataToExport.length === 0) {
          this.$vaToast.init({
            message: 'No data to export based on selected filters',
            color: 'warning',
          })
          return
        }

        // Select only the chosen fields in their ordered sequence
        const selectedFields = this.sortedExportFields.filter(
          (field) => field.selected,
        )

        // Create Excel data
        const excelData = dataToExport.map((request) => {
          const row: any = {}
          selectedFields.forEach((field) => {
            if (field.key === 'createdAt' || field.key === 'updatedAt') {
              row[field.label] = request[field.key as keyof ActionRequest]
                ? new Date(
                    request[field.key as keyof ActionRequest] as number,
                  ).toLocaleString()
                : ''
            } else {
              row[field.label] = request[field.key as keyof ActionRequest] || ''
            }
          })
          return row
        })

        // Create and download Excel file
        const XLSX = await import('xlsx')
        const worksheet = XLSX.utils.json_to_sheet(excelData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Requests')

        const fileName = `requests-export-${
          new Date().toISOString().split('T')[0]
        }.xlsx`
        XLSX.writeFile(workbook, fileName)

        this.$vaToast.init({
          message: 'Excel file exported successfully',
          color: 'success',
        })

        this.closeModal()
      } catch (error) {
        console.error('Error exporting to Excel:', error)
        this.$vaToast.init({
          message: 'Error exporting to Excel',
          color: 'danger',
        })
      } finally {
        this.exportLoading = false
      }
    },
  },
})
