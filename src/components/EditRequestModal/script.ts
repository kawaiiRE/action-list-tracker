import { defineComponent, type PropType } from 'vue'
import type { ActionRequest } from '@/services/firebase'
import { updateRequest } from '@/services/firebase'
import { DEPARTMENTS } from '@/constants/departments'

export default defineComponent({
  name: 'EditRequestModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    request: {
      type: Object as PropType<ActionRequest | null>,
      default: null,
    },
  },
  emits: ['update:modelValue', 'request-updated', 'reload-data'],
  data() {
    return {
      saving: false,
      editForm: {
        title: '',
        receiverDepartment: '',
        details: '',
        status: '',
      },
      departments: DEPARTMENTS,
      statusOptions: ['Open', 'In-Progress', 'Closed'],
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
    isFormValid() {
      return (
        this.editForm.title?.trim() &&
        this.editForm.receiverDepartment &&
        this.editForm.details?.trim() &&
        this.editForm.status
      )
    },
  },
  watch: {
    request: {
      handler(newRequest) {
        if (newRequest) {
          this.editForm = {
            title: newRequest.title,
            receiverDepartment: newRequest.receiverDepartment,
            details: newRequest.details,
            status: newRequest.status,
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    closeModal() {
      this.isVisible = false
    },
    required(value: string) {
      return !!value || 'This field is required'
    },
    async saveChanges() {
      if (!this.request || !this.isFormValid) return

      this.saving = true
      try {
        await updateRequest(this.request.id!, {
          title: this.editForm.title,
          receiverDepartment: this.editForm.receiverDepartment,
          details: this.editForm.details,
          status: this.editForm.status,
        })

        this.$vaToast.init({
          message: 'Request updated successfully',
          color: 'success',
        })

        this.closeModal()
        this.$emit('request-updated')
        this.$emit('reload-data')
      } catch (error) {
        console.error('Error updating request:', error)
        this.$vaToast.init({
          message: 'Error updating request',
          color: 'danger',
        })
      } finally {
        this.saving = false
      }
    },
  },
})
