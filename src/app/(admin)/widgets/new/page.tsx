'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus, Trash2, ArrowRight, ArrowLeft, Bell, Layout, Square, SidebarClose, Circle, Image } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UpgradeModal } from '@/components/upgrade-modal'

interface CompanyOption {
  id: string
  name: string
}

type WidgetType = 
  | 'ANNOUNCEMENT_BAR'
  | 'NOTIFICATION'
  | 'POPUP_MODAL'
  | 'SLIDE_IN'
  | 'FLOATING_BUTTON'
  | 'BANNER'

type PositionOption =
  | 'TOP'
  | 'BOTTOM'
  | 'BOTTOM_RIGHT'
  | 'TOP_LEFT'
  | 'TOP_RIGHT'
  | 'BOTTOM_LEFT'
  | 'LEFT_CENTER'
  | 'RIGHT_CENTER'
  | 'CENTER'
  | 'CENTER_LEFT'
  | 'CENTER_RIGHT'
  | 'FLOATING_TOP'
  | 'FLOATING_BOTTOM'
  | 'FLOATING_CENTER'

interface MessageItem {
  id: string
  headline: string
  body: string
  ctaText: string
  ctaUrl: string
}

interface WidgetDraft {
  companyId: string
  name: string
  type: WidgetType
  items: MessageItem[]
  durationSeconds: number
  position: PositionOption
  backgroundColor: string
  textColor: string
}

/* ------------------------------------------------------ */
/*               WIDGET TYPE CARDS                        */
/* ------------------------------------------------------ */

const WIDGET_TYPES = [
  {
    type: 'NOTIFICATION' as WidgetType,
    icon: Bell,
    name: 'Toast Notification',
    description: 'Pop-up notifications that appear in corners',
    positions: ['TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT'],
    defaultPosition: 'BOTTOM_RIGHT' as PositionOption,
    multipleMessages: true,
    behavior: 'Sequential toasts - one after another'
  },
  {
    type: 'ANNOUNCEMENT_BAR' as WidgetType,
    icon: Layout,
    name: 'Announcement Bar',
    description: 'Fixed bar at top or bottom of page',
    positions: ['TOP', 'BOTTOM'],
    defaultPosition: 'TOP' as PositionOption,
    multipleMessages: true,
    behavior: 'Rotating carousel through messages'
  },
  {
    type: 'POPUP_MODAL' as WidgetType,
    icon: Square,
    name: 'Popup Modal',
    description: 'Center overlay with backdrop',
    positions: ['CENTER'],
    defaultPosition: 'CENTER' as PositionOption,
    multipleMessages: false,
    behavior: 'Single message modal'
  },
  {
    type: 'SLIDE_IN' as WidgetType,
    icon: SidebarClose,
    name: 'Slide-In Panel',
    description: 'Panel that slides from side',
    positions: ['LEFT_CENTER', 'RIGHT_CENTER'],
    defaultPosition: 'RIGHT_CENTER' as PositionOption,
    multipleMessages: true,
    behavior: 'Carousel or tabs inside panel'
  },
  {
    type: 'FLOATING_BUTTON' as WidgetType,
    icon: Circle,
    name: 'Floating Button',
    description: 'Persistent button that expands on click',
    positions: ['BOTTOM_RIGHT', 'BOTTOM_LEFT', 'TOP_RIGHT', 'TOP_LEFT'],
    defaultPosition: 'BOTTOM_RIGHT' as PositionOption,
    multipleMessages: false,
    behavior: 'Always visible, expands on click'
  },
  {
    type: 'BANNER' as WidgetType,
    icon: Image,
    name: 'Hero Banner',
    description: 'Full-width banner with image support',
    positions: ['TOP', 'BOTTOM', 'CENTER'],
    defaultPosition: 'TOP' as PositionOption,
    multipleMessages: true,
    behavior: 'Rotating carousel with images'
  }
]

/* ------------------------------------------------------ */
/*               WIDGET PREVIEW COMPONENT                 */
/* ------------------------------------------------------ */

function DemoWidgetPreview({ widget }: { widget: WidgetDraft }) {
  const firstItem = widget.items[0] || {
    headline: "Your headline here",
    body: "Your message body",
    ctaText: "Learn more",
  }

  const ctaLabel = firstItem.ctaText || "Learn more"

  // ANNOUNCEMENT_BAR or BANNER - Full width bar
  const fullWidthBar = (
    <div
      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm shadow-md"
      style={{
        backgroundColor: widget.backgroundColor,
        color: widget.textColor,
      }}
    >
      <div className="flex-1">
        <div className="font-semibold">{firstItem.headline || "Announcement"}</div>
        <div className="text-xs opacity-90">{firstItem.body}</div>
      </div>
      {ctaLabel && (
        <button
          className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur hover:bg-white/20"
          type="button"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )

  // NOTIFICATION - Toast style
  const toast = (
    <div
      className="max-w-xs rounded-lg px-4 py-3 text-sm shadow-lg ring-1 ring-black/5"
      style={{
        backgroundColor: widget.backgroundColor,
        color: widget.textColor,
      }}
    >
      <div className="font-semibold mb-1">{firstItem.headline}</div>
      <div className="text-xs opacity-90 mb-2">{firstItem.body}</div>
      {ctaLabel && (
        <div className="text-xs">
          <span className="underline opacity-80">{ctaLabel} →</span>
        </div>
      )}
    </div>
  )

  // POPUP_MODAL - Center modal with backdrop
  const modal = (
    <>
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-80 rounded-lg p-6 shadow-2xl"
        style={{
          backgroundColor: widget.backgroundColor,
          color: widget.textColor,
        }}
      >
        <div className="font-bold text-lg mb-2">{firstItem.headline}</div>
        <div className="text-sm opacity-90 mb-4">{firstItem.body}</div>
        {ctaLabel && (
          <button
            className="w-full rounded-md bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30"
            type="button"
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </>
  )

  // SLIDE_IN - Side panel
  const slideIn = (
    <div
      className="absolute top-0 bottom-0 w-80 shadow-2xl p-6 overflow-y-auto"
      style={{
        backgroundColor: widget.backgroundColor,
        color: widget.textColor,
        [widget.position === 'LEFT_CENTER' ? 'left' : 'right']: 0,
      }}
    >
      <div className="font-bold text-lg mb-2">{firstItem.headline}</div>
      <div className="text-sm opacity-90 mb-4">{firstItem.body}</div>
      {ctaLabel && (
        <button
          className="w-full rounded-md bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30"
          type="button"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )

  // FLOATING_BUTTON
  const floatingButton = (
    <div
      className="absolute rounded-full w-14 h-14 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"
      style={{
        backgroundColor: widget.backgroundColor,
        color: widget.textColor,
        ...(widget.position === 'BOTTOM_RIGHT' && { bottom: '20px', right: '20px' }),
        ...(widget.position === 'BOTTOM_LEFT' && { bottom: '20px', left: '20px' }),
        ...(widget.position === 'TOP_RIGHT' && { top: '20px', right: '20px' }),
        ...(widget.position === 'TOP_LEFT' && { top: '20px', left: '20px' }),
      }}
    >
      <Circle className="w-6 h-6" />
    </div>
  )

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-lg border bg-white">
      <div className="flex items-center gap-2 border-b bg-gray-100 px-3 py-2 text-xs text-gray-600">
        <span className="inline-flex h-2 w-2 rounded-full bg-red-400" />
        <span className="inline-flex h-2 w-2 rounded-full bg-yellow-400" />
        <span className="inline-flex h-2 w-2 rounded-full bg-green-400" />
        <span className="ml-3 truncate">https://your-website.com</span>
      </div>

      <div className="relative h-full bg-gray-50 p-6 text-sm text-gray-700">
        <div className="mb-6">
          <div className="mb-2 h-6 w-40 rounded bg-gray-200" />
          <div className="mb-1 h-4 w-64 rounded bg-gray-200" />
          <div className="mb-1 h-4 w-52 rounded bg-gray-200" />
        </div>
        <div className="space-y-2 text-xs text-gray-500">
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-11/12 rounded bg-gray-100" />
          <div className="h-3 w-10/12 rounded bg-gray-100" />
        </div>

        {/* Render based on widget type */}
        {widget.type === 'ANNOUNCEMENT_BAR' && widget.position === 'TOP' && (
          <div className="absolute left-0 right-0 top-0 z-20">{fullWidthBar}</div>
        )}
        {widget.type === 'ANNOUNCEMENT_BAR' && widget.position === 'BOTTOM' && (
          <div className="absolute bottom-0 left-0 right-0 z-20">{fullWidthBar}</div>
        )}

        {widget.type === 'BANNER' && widget.position === 'TOP' && (
          <div className="absolute left-0 right-0 top-0 z-20">{fullWidthBar}</div>
        )}
        {widget.type === 'BANNER' && widget.position === 'BOTTOM' && (
          <div className="absolute bottom-0 left-0 right-0 z-20">{fullWidthBar}</div>
        )}
        {widget.type === 'BANNER' && widget.position === 'CENTER' && (
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20">{fullWidthBar}</div>
        )}

        {widget.type === 'NOTIFICATION' && (
          <div
            className="absolute z-20"
            style={{
              ...(widget.position === 'BOTTOM_RIGHT' && { bottom: '20px', right: '20px' }),
              ...(widget.position === 'BOTTOM_LEFT' && { bottom: '20px', left: '20px' }),
              ...(widget.position === 'TOP_RIGHT' && { top: '20px', right: '20px' }),
              ...(widget.position === 'TOP_LEFT' && { top: '20px', left: '20px' }),
            }}
          >
            {toast}
          </div>
        )}

        {widget.type === 'POPUP_MODAL' && modal}
        {widget.type === 'SLIDE_IN' && slideIn}
        {widget.type === 'FLOATING_BUTTON' && floatingButton}
      </div>
    </div>
  )
}

/* ------------------------------------------------------ */
/*               MAIN PAGE COMPONENT                      */
/* ------------------------------------------------------ */

export default function NewWidgetPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [usage, setUsage] = useState<{widgets: number, limit: number} | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const [draft, setDraft] = useState<WidgetDraft>({
    companyId: '',
    name: '',
    type: 'NOTIFICATION',
    items: [
      {
        id: '1',
        headline: '',
        body: '',
        ctaText: '',
        ctaUrl: ''
      }
    ],
    durationSeconds: 10,
    position: 'BOTTOM_RIGHT',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF'
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/companies').then(res => res.json()),
      fetch('/api/user/usage').then(res => res.json())
    ])
      .then(([companiesData, usageData]) => {
        const list = companiesData.companies || []
        setCompanies(list)

        if (list.length === 1) {
          setDraft(prev => ({ ...prev, companyId: list[0].id }))
        }

        if (usageData.widgets !== undefined && usageData.limit !== undefined) {
          setUsage({ widgets: usageData.widgets, limit: usageData.limit })
        }
      })
      .catch(err => console.error('Failed to load data:', err))
  }, [])

  function handleFieldChange<K extends keyof WidgetDraft>(key: K, value: WidgetDraft[K]) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  function handleTypeSelect(type: WidgetType) {
    const typeConfig = WIDGET_TYPES.find(t => t.type === type)
    if (typeConfig) {
      setDraft(prev => ({
        ...prev,
        type,
        position: typeConfig.defaultPosition,
        items: typeConfig.multipleMessages ? prev.items : [prev.items[0]]
      }))
      setStep(2)
    }
  }

  function handleAddItem() {
    setDraft((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: crypto.randomUUID(),
          headline: "",
          body: "",
          ctaText: "",
          ctaUrl: "",
        },
      ],
    }))
  }

  function handleRemoveItem(index: number) {
    setDraft((prev) => {
      const newItems = [...prev.items]
      newItems.splice(index, 1)
      return { ...prev, items: newItems }
    })
  }

  function handleItemChange(index: number, field: keyof MessageItem, value: string) {
    setDraft((prev) => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }
      return { ...prev, items: newItems }
    })
  }

  async function handleCreate() {
    setError('')

    if (!draft.companyId) return setError('Please select a company')
    if (!draft.name) return setError('Name required')
    if (draft.items.length === 0) return setError('At least one message is required')
    if (!draft.items[0].headline) return setError('First message headline is required')

    setLoading(true)

    try {
      const res = await fetch('/api/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403 && data.upgrade) {
          setError(data.error || 'Widget limit reached')
          setShowUpgradeModal(true)
          setLoading(false)
          return
        }
        throw new Error(data.error || 'Failed to create widget')
      }

      router.push('/widgets')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedTypeConfig = WIDGET_TYPES.find(t => t.type === draft.type)
  const availablePositions = selectedTypeConfig?.positions || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Create Widget</CardTitle>
            <div className="text-sm text-gray-500 mt-1">
              Step {step} of 3
            </div>
          </div>
          {usage && (
            <div className="text-sm text-gray-500">
              {usage.widgets}/{usage.limit} widgets used
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {error && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {/* STEP 1: Select Widget Type */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose Widget Type</h3>
              <p className="text-sm text-gray-600 mb-6">
                Select the type of widget you want to create
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {WIDGET_TYPES.map((widgetType) => {
                const Icon = widgetType.icon
                return (
                  <button
                    key={widgetType.type}
                    onClick={() => handleTypeSelect(widgetType.type)}
                    className="flex flex-col items-start gap-3 p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 rounded-md bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="font-semibold text-sm">{widgetType.name}</div>
                    </div>
                    <p className="text-xs text-gray-600">{widgetType.description}</p>
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      {widgetType.behavior}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Configure Content */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Configure Content</h3>
                <p className="text-sm text-gray-600">
                  Type: <span className="font-medium">{selectedTypeConfig?.name}</span>
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Change Type
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <select
                    className="w-full rounded border px-3 py-2"
                    value={draft.companyId}
                    onChange={e => handleFieldChange('companyId', e.target.value)}
                  >
                    <option value="">Select company</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Widget Name</Label>
                  <Input 
                    value={draft.name} 
                    onChange={e => handleFieldChange('name', e.target.value)}
                    placeholder="e.g., Summer Sale 2024"
                  />
                </div>

                {/* Messages */}
                {selectedTypeConfig?.multipleMessages ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Messages</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddItem}
                        disabled={loading}
                      >
                        <Plus className="mr-2 h-3 w-3" /> Add Message
                      </Button>
                    </div>

                    {draft.items.map((item, idx) => (
                      <div key={item.id || idx} className="rounded-md border p-3 shadow-sm bg-gray-50/50">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">
                            Message {idx + 1}
                          </span>
                          {draft.items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-400 hover:text-red-500"
                              onClick={() => handleRemoveItem(idx)}
                              disabled={loading}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-gray-500">Headline</Label>
                            <Input
                              value={item.headline}
                              onChange={(e) => handleItemChange(idx, "headline", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Big announcement!"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Body</Label>
                            <Textarea
                              value={item.body}
                              onChange={(e) => handleItemChange(idx, "body", e.target.value)}
                              className="min-h-[60px] text-sm"
                              placeholder="More details..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-gray-500">CTA Text</Label>
                              <Input
                                value={item.ctaText}
                                onChange={(e) => handleItemChange(idx, "ctaText", e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Learn More"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">CTA URL</Label>
                              <Input
                                value={item.ctaUrl}
                                onChange={(e) => handleItemChange(idx, "ctaUrl", e.target.value)}
                                className="h-8 text-sm"
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Single message for POPUP_MODAL, FLOATING_BUTTON
                  <div className="space-y-3 border rounded-md p-3">
                    <div>
                      <Label className="text-xs text-gray-500">Headline</Label>
                      <Input
                        value={draft.items[0]?.headline || ''}
                        onChange={(e) => handleItemChange(0, "headline", e.target.value)}
                        placeholder="Welcome!"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Body</Label>
                      <Textarea
                        value={draft.items[0]?.body || ''}
                        onChange={(e) => handleItemChange(0, "body", e.target.value)}
                        placeholder="Your message here..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-500">CTA Text</Label>
                        <Input
                          value={draft.items[0]?.ctaText || ''}
                          onChange={(e) => handleItemChange(0, "ctaText", e.target.value)}
                          placeholder="Get Started"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">CTA URL</Label>
                        <Input
                          value={draft.items[0]?.ctaUrl || ''}
                          onChange={(e) => handleItemChange(0, "ctaUrl", e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Preview</h4>
                <DemoWidgetPreview widget={draft} />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Style & Position */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Style & Position</h3>
              <p className="text-sm text-gray-600">Customize appearance and placement</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <select
                    className="w-full rounded border px-3 py-2"
                    value={draft.position}
                    onChange={e => handleFieldChange('position', e.target.value as PositionOption)}
                  >
                    {availablePositions.map(pos => (
                      <option key={pos} value={pos}>
                        {pos.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    {selectedTypeConfig?.behavior}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Duration (seconds)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={draft.durationSeconds}
                    onChange={e => handleFieldChange('durationSeconds', Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    {draft.type === 'NOTIFICATION' && 'Delay after all toasts before loop restarts'}
                    {draft.type === 'ANNOUNCEMENT_BAR' && 'Time between message rotations'}
                    {draft.type === 'BANNER' && 'Time between message rotations'}
                    {draft.type === 'POPUP_MODAL' && 'Auto-close after X seconds'}
                    {draft.type === 'SLIDE_IN' && 'Auto-close after X seconds'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Colors</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Background</span>
                      <Input
                        type="color"
                        className="h-10 w-14 p-1"
                        value={draft.backgroundColor}
                        onChange={e => handleFieldChange('backgroundColor', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs">Text</span>
                      <Input
                        type="color"
                        className="h-10 w-14 p-1"
                        value={draft.textColor}
                        onChange={e => handleFieldChange('textColor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Live Preview</h4>
                <DemoWidgetPreview widget={draft} />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating…' : 'Create Widget'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Upgrade Modal */}
      {usage && (
        <UpgradeModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentUsage={usage.widgets}
          limit={usage.limit}
        />
      )}
    </Card>
  )
}