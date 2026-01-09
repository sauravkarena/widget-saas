export const WIDGET_TYPES = {
  ANNOUNCEMENT_BAR: { label: 'Announcement Bar', icon: '📣' },
  POPUP_MODAL: { label: 'Popup Modal', icon: '🔔' },
  SLIDE_IN: { label: 'Slide In', icon: '➡️' },
  FLOATING_BUTTON: { label: 'Floating Button', icon: '🔘' },
  BANNER: { label: 'Banner', icon: '🎯' },
  NOTIFICATION: { label: 'Notification', icon: '💬' },
} as const

export const WIDGET_POSITIONS = {
  TOP: 'Top',
  BOTTOM: 'Bottom',
  TOP_LEFT: 'Top Left',
  TOP_RIGHT: 'Top Right',
  BOTTOM_LEFT: 'Bottom Left',
  BOTTOM_RIGHT: 'Bottom Right',
  CENTER: 'Center',
} as const

export const COMPANY_ROLES = {
  OWNER: { label: 'Owner', description: 'Full access to everything' },
  ADMIN: { label: 'Admin', description: 'Manage widgets and team members' },
  EDITOR: { label: 'Editor', description: 'Create and edit widgets' },
  VIEWER: { label: 'Viewer', description: 'View only access' },
} as const

export const DISPLAY_FREQUENCIES = [
  { value: 'always', label: 'Every time' },
  { value: 'once', label: 'Once per visitor' },
  { value: 'daily', label: 'Once per day' },
  { value: 'weekly', label: 'Once per week' },
] as const