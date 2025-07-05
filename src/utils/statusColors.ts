/**
 * Utility function to get consistent status colors across the application
 * @param status The status string
 * @returns The corresponding color for the status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Open':
      return 'primary' // Blue
    case 'In-Progress':
      return 'warning' // Yellow
    case 'Closed':
      return 'success' // Green
    default:
      return 'secondary' // Gray
  }
}
