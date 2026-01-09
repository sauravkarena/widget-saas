import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  previewDevice: 'mobile' | 'tablet' | 'desktop'
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setPreviewDevice: (device: 'mobile' | 'tablet' | 'desktop') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  previewDevice: 'desktop',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setPreviewDevice: (device) => set({ previewDevice: device }),
}))