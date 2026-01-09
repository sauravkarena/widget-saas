import { create } from 'zustand'
import { WidgetContent, WidgetStyle, WidgetDisplayRules } from '@/types'
import { WidgetType, WidgetPosition } from '@prisma/client'

interface WidgetEditorState {
  step: number
  name: string
  type: WidgetType
  content: WidgetContent
  style: WidgetStyle
  position: WidgetPosition
  dismissible: boolean
  autoHideSeconds: number | null
  displayRules: WidgetDisplayRules
  startAt: Date | null
  endAt: Date | null
  
  setStep: (step: number) => void
  setName: (name: string) => void
  setType: (type: WidgetType) => void
  setContent: (content: Partial<WidgetContent>) => void
  setStyle: (style: Partial<WidgetStyle>) => void
  setPosition: (position: WidgetPosition) => void
  setDismissible: (dismissible: boolean) => void
  setAutoHideSeconds: (seconds: number | null) => void
  setDisplayRules: (rules: Partial<WidgetDisplayRules>) => void
  setSchedule: (startAt: Date | null, endAt: Date | null) => void
  reset: () => void
}

const initialState = {
  step: 0,
  name: '',
  type: 'ANNOUNCEMENT_BAR' as WidgetType,
  content: {},
  style: {
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    borderRadius: '8px',
  },
  position: 'TOP' as WidgetPosition,
  dismissible: true,
  autoHideSeconds: null,
  displayRules: {
    devices: { mobile: true, tablet: true, desktop: true },
    frequency: 'always' as const,
    delay: 0,
  },
  startAt: null,
  endAt: null,
}

export const useWidgetEditorStore = create<WidgetEditorState>((set) => ({
  ...initialState,
  
  setStep: (step) => set({ step }),
  setName: (name) => set({ name }),
  setType: (type) => set({ type }),
  setContent: (content) => set((state) => ({ content: { ...state.content, ...content } })),
  setStyle: (style) => set((state) => ({ style: { ...state.style, ...style } })),
  setPosition: (position) => set({ position }),
  setDismissible: (dismissible) => set({ dismissible }),
  setAutoHideSeconds: (autoHideSeconds) => set({ autoHideSeconds }),
  setDisplayRules: (rules) => set((state) => ({ 
    displayRules: { ...state.displayRules, ...rules } 
  })),
  setSchedule: (startAt, endAt) => set({ startAt, endAt }),
  reset: () => set(initialState),
}))