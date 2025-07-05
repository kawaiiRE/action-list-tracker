import { defineComponent, type PropType } from 'vue'
import type { ActionRequest } from '@/services/firebase'

export interface ExportField {
  key: string
  label: string
  selected: boolean
}

export default defineComponent({
  name: 'ExportModal',
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
      exportFields: [
        { key: 'title', label: 'Title', selected: true },
        { key: 'senderName', label: 'Sender Name', selected: true },
        { key: 'senderDepartment', label: 'Sender Department', selected: true },
        {
          key: 'receiverDepartment',
          label: 'Receiver Department',
          selected: true,
        },
        { key: 'status', label: 'Status', selected: true },
        { key: 'details', label: 'Details', selected: true },
        { key: 'createdAt', label: 'Created Date', selected: true },
        { key: 'updatedAt', label: 'Updated Date', selected: false },
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
  },
  methods: {
    closeModal() {
      this.isVisible = false
    },
    async exportToExcel() {
      this.exportLoading = true
      try {
        // Get the data to export
        let dataToExport = this.requests

        // Apply filters if requested
        if (this.applyCurrentFilters) {
          // Apply filtering logic here based on currentFilters
          // This would match the filtering logic from the parent component
        }

        // Select only the chosen fields
        const selectedFields = this.exportFields.filter(
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
