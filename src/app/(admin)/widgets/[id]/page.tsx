"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { Plus, Trash2 } from "lucide-react"
import { UpgradeModal } from "@/components/upgrade-modal"

type PositionOption =
  | "TOP"
  | "BOTTOM"
  | "BOTTOM_RIGHT"
  | "TOP_LEFT"
  | "TOP_RIGHT"
  | "BOTTOM_LEFT"
  | "LEFT_CENTER"
  | "RIGHT_CENTER"
  | "CENTER"
  | "CENTER_LEFT"
  | "CENTER_RIGHT"
  | "FLOATING_TOP"
  | "FLOATING_BOTTOM"
  | "FLOATING_CENTER"

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
  items: MessageItem[]
  durationSeconds: number
  position: PositionOption
  backgroundColor: string
  textColor: string
}

function DemoWidgetPreview({ widget }: { widget: WidgetDraft }) {
  // Preview uses the first item or a fallback
  const firstItem = widget.items[0] || {
    headline: "Highlight your latest offer here.",
    body: "Short punchy line about your promo.",
    ctaText: "Learn more",
  }

  const ctaLabel = firstItem.ctaText || "Learn more"

  const banner = (
    <div
      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm shadow-md"
      style={{
        backgroundColor: widget.backgroundColor,
        color: widget.textColor,
      }}
    >
      <div>
        <div className="font-semibold">{widget.name || "Website announcement"}</div>
        <div className="text-xs opacity-90">{firstItem.headline}</div>
      </div>
      <button
        className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur hover:bg-white/20"
        type="button"
      >
        {ctaLabel}
      </button>
    </div>
  )

  const floating = (
    <div
      className="max-w-xs rounded-lg px-4 py-3 text-sm shadow-lg ring-1 ring-black/5"
      style={{
        backgroundColor: widget.backgroundColor,
        color: widget.textColor,
      }}
    >
      <div className="font-semibold mb-1">{firstItem.headline}</div>
      <div className="text-xs opacity-90 mb-1">{firstItem.body}</div>
      <div className="text-[11px] opacity-75 mb-3">
        {ctaLabel && (
          <span className="underline opacity-80 decoration-white/50">{ctaLabel}</span>
        )}
      </div>
    </div>
  )

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-lg border bg-white">
      <div className="flex items-center gap-2 border-b bg-gray-100 px-3 py-2 text-xs text-gray-600">
        <span className="inline-flex h-2 w-2 rounded-full bg-red-400" />
        <span className="inline-flex h-2 w-2 rounded-full bg-yellow-400" />
        <span className="inline-flex h-2 w-2 rounded-full bg-green-400" />
        <span className="ml-3 truncate">https://demo-site.example.com/landing</span>
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
          <div className="h-3 w-9/12 rounded bg-gray-100" />
        </div>

        {/* Banner positions */}
        {widget.position === "TOP" && (
          <div className="absolute left-0 right-0 top-0 z-20">{banner}</div>
        )}
        {widget.position === "BOTTOM" && (
          <div className="absolute bottom-0 left-0 right-0 z-20">{banner}</div>
        )}

        {/* Floating (card) positions */}
        {widget.position === "BOTTOM_RIGHT" && (
          <div className="absolute bottom-4 right-4 z-20">{floating}</div>
        )}

        {widget.position === "TOP_LEFT" && (
          <div className="absolute top-4 left-4 z-20">{floating}</div>
        )}
        {widget.position === "TOP_RIGHT" && (
          <div className="absolute top-4 right-4 z-20">{floating}</div>
        )}
        {widget.position === "BOTTOM_LEFT" && (
          <div className="absolute bottom-4 left-4 z-20">{floating}</div>
        )}

        {widget.position === "LEFT_CENTER" && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">{floating}</div>
        )}
        {widget.position === "RIGHT_CENTER" && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">{floating}</div>
        )}

        {widget.position === "CENTER" && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            {floating}
          </div>
        )}

        {widget.position === "FLOATING_TOP" && (
          <div className="absolute left-1/2 top-6 -translate-x-1/2 z-20">{floating}</div>
        )}
        {widget.position === "FLOATING_BOTTOM" && (
          <div className="absolute left-1/2 bottom-6 -translate-x-1/2 z-20">{floating}</div>
        )}
        {widget.position === "FLOATING_CENTER" && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            {floating}
          </div>
        )}
      </div>
    </div>
  )
}

interface AnalyticsData {
  impressions: number
  clicks: number
  ctr: string
}

// Full-page preview component
function FullPagePreview({ widget }: { widget: WidgetDraft | null }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!widget || widget.items.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % widget.items.length)
    }, (widget.durationSeconds || 3) * 1000)

    return () => clearInterval(interval)
  }, [widget])

  if (!widget) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading preview...</p>
      </div>
    )
  }

  const currentItem = widget.items[currentIndex] || {
    headline: "Your headline here",
    body: "Your message body",
    ctaText: "Click here",
    ctaUrl: "#"
  }

  // Render widget based on position
  const renderWidget = () => {
    const isBanner = widget.position === "TOP" || widget.position === "BOTTOM"
    
    if (isBanner) {
      return (
        <div
          className="w-full px-6 py-4 shadow-lg"
          style={{
            backgroundColor: widget.backgroundColor,
            color: widget.textColor,
          }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-bold text-lg mb-1">{currentItem.headline}</div>
              <div className="text-sm opacity-90">{currentItem.body}</div>
            </div>
            {currentItem.ctaText && (
              <button
                className="px-6 py-2 rounded-lg font-medium bg-white/20 hover:bg-white/30 transition-colors backdrop-blur"
                style={{ color: widget.textColor }}
              >
                {currentItem.ctaText}
              </button>
            )}
          </div>
        </div>
      )
    }

    // Floating widget
    return (
      <div
        className="max-w-sm rounded-xl shadow-2xl p-6 ring-1 ring-black/5"
        style={{
          backgroundColor: widget.backgroundColor,
          color: widget.textColor,
        }}
      >
        <div className="font-bold text-xl mb-2">{currentItem.headline}</div>
        <div className="text-sm opacity-90 mb-4">{currentItem.body}</div>
        {currentItem.ctaText && (
          <button
            className="w-full px-4 py-2 rounded-lg font-medium bg-white/20 hover:bg-white/30 transition-colors"
            style={{ color: widget.textColor }}
          >
            {currentItem.ctaText}
          </button>
        )}
      </div>
    )
  }

  const getPositionClasses = () => {
    switch (widget.position) {
      case "TOP": return "top-0 left-0 right-0"
      case "BOTTOM": return "bottom-0 left-0 right-0"
      case "TOP_LEFT": return "top-8 left-8"
      case "TOP_RIGHT": return "top-8 right-8"
      case "BOTTOM_LEFT": return "bottom-8 left-8"
      case "BOTTOM_RIGHT": return "bottom-8 right-8"
      case "CENTER": return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      case "LEFT_CENTER": return "top-1/2 left-8 -translate-y-1/2"
      case "RIGHT_CENTER": return "top-1/2 right-8 -translate-y-1/2"
      case "FLOATING_TOP": return "top-8 left-1/2 -translate-x-1/2"
      case "FLOATING_BOTTOM": return "bottom-8 left-1/2 -translate-x-1/2"
      case "FLOATING_CENTER": return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      default: return "top-0 left-0 right-0"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Full Page Preview</h3>
          <p className="text-sm text-gray-500">
            See how your widget will appear on your website
          </p>
        </div>
        {widget.items.length > 1 && (
          <div className="text-sm text-gray-600">
            Message {currentIndex + 1} of {widget.items.length}
          </div>
        )}
      </div>

      {/* Full-page preview */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden" style={{ height: '600px' }}>
        {/* Simulated website content */}
        <div className="absolute inset-0 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="h-12 w-48 bg-gray-300 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-32 bg-gray-300 rounded mt-8"></div>
            </div>
          </div>
        </div>

        {/* Widget overlay */}
        <div className={`absolute ${getPositionClasses()} z-10`}>
          {renderWidget()}
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        💡 This preview shows how your widget will appear on your website
      </div>
    </div>
  )
}

function AnalyticsView({ widgetId }: { widgetId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/widgets/${widgetId}/analytics`)
        if (res.ok) {
          const json = await res.json()
          if (!cancelled) setData(json)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [widgetId])

  if (loading) return <div className="text-sm text-gray-500">Loading stats...</div>
  if (!data) return <div className="text-sm text-gray-500">No data available</div>

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Total Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.impressions}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Total Clicks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.clicks}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Click Rate (CTR)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{data.ctr}</div>
        </CardContent>
      </Card>
    </div>
  )
}



export default function WidgetDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: widgetId } = React.use(params)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialTab = searchParams.get("tab") === "analytics" ? "analytics" : searchParams.get("tab") === "preview" ? "preview" : "settings"
  const [activeTab, setActiveTab] = useState<"settings" | "preview" | "analytics">(initialTab)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [draft, setDraft] = useState<WidgetDraft | null>(null)
  const [usage, setUsage] = useState<{ widgets: number; limit: number } | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    let cancelled = false

    async function loadWidget() {
      try {
        const res = await fetch(`/api/widgets/${widgetId}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Failed to load widget")
        }

        const data = await res.json()
        if (!cancelled && data.widget) {
          const w = data.widget
          const items = w.items || []

          setDraft({
            companyId: w.companyId,
            name: w.name || "",
            items,
            durationSeconds: w.durationSeconds || 0,
            position: ((w.position as PositionOption) || "TOP") as PositionOption,
            backgroundColor: w.backgroundColor || "#3B82F6",
            textColor: w.textColor || "#FFFFFF",
          })
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load widget")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadWidget()

    return () => {
      cancelled = true
    }
  }, [widgetId])

  // Fetch user usage for item limits
  useEffect(() => {
    async function loadUsage() {
      try {
        const res = await fetch('/api/user/usage')
        if (res.ok) {
          const data = await res.json()
          // API returns { usage: { widgets, companies }, limit: { widgets, companies } }
          if (data.limit && data.limit.widgets) {
            setUsage({ widgets: data.usage?.widgets || 0, limit: data.limit.widgets })
          }
        }
      } catch (err) {
        console.error('Failed to load usage:', err)
      }
    }
    loadUsage()
  }, [])

  function handleFieldChange<K extends keyof WidgetDraft>(key: K, value: WidgetDraft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function handleAddItem() {
    setDraft((prev) => {
      if (!prev) return prev
      
      // Check subscription limit for items (max 3 for Free tier)
      const maxItems = usage?.limit || 3
      if (prev.items.length >= maxItems) {
        setShowUpgradeModal(true)
        return prev
      }
      
      return {
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
      }
    })
  }

  function handleRemoveItem(index: number) {
    setDraft((prev) => {
      if (!prev) return prev
      const newItems = [...prev.items]
      newItems.splice(index, 1)
      return { ...prev, items: newItems }
    })
  }

  function handleItemChange(index: number, field: keyof MessageItem, value: string) {
    setDraft((prev) => {
      if (!prev) return prev
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }
      return { ...prev, items: newItems }
    })
  }

  async function handleSave() {
    if (!draft) return
    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/widgets/${widgetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update widget")
      }

      router.push("/widgets")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loading || !draft) {
    return <div>Loading widget...</div>
  }

  return (
    <Card>
      <div className="border-b px-4">
        <div className="flex gap-2 border-b">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "preview"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "analytics"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </div>
      </div>

      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {activeTab === "analytics" ? (
          <AnalyticsView widgetId={widgetId} />
        ) : activeTab === "preview" ? (
          <FullPagePreview widget={draft} />
        ) : (
          <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <Label htmlFor="name">Widget Name</Label>
                <Input
                  id="name"
                  value={draft.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* MESSAGES LIST */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Messages</Label>
                    {usage && (
                      <p className="text-xs text-gray-500 mt-1">
                        {draft.items.length}/{usage.limit} messages used
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    disabled={saving || (draft.items.length >= (usage?.limit || 3))}
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={saving}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500">Headline</Label>
                        <Input
                          value={item.headline}
                          onChange={(e) =>
                            handleItemChange(idx, "headline", e.target.value)
                          }
                          className="h-8 text-sm"
                          placeholder="Big Sale!"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Body</Label>
                        <Textarea
                          value={item.body}
                          onChange={(e) => handleItemChange(idx, "body", e.target.value)}
                          className="min-h-[60px] text-sm"
                          placeholder="Details about the offer..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-gray-500">CTA Text</Label>
                          <Input
                            value={item.ctaText}
                            onChange={(e) =>
                              handleItemChange(idx, "ctaText", e.target.value)
                            }
                            className="h-8 text-sm"
                            placeholder="Learn More"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">CTA URL</Label>
                          <Input
                            value={item.ctaUrl}
                            onChange={(e) =>
                              handleItemChange(idx, "ctaUrl", e.target.value)
                            }
                            className="h-8 text-sm"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {draft.items.length === 0 && (
                  <div className="py-4 text-center text-sm text-gray-500 border rounded-md border-dashed">
                    No messages added. Click "Add Message" to start.
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="durationSeconds">Duration per slide (sec)</Label>
                  <Input
                    id="durationSeconds"
                    type="number"
                    min={1}
                    value={draft.durationSeconds}
                    onChange={(e) =>
                      handleFieldChange("durationSeconds", Number(e.target.value) || 0)
                    }
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <select
                    id="position"
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                    value={draft.position}
                    onChange={(e) =>
                      handleFieldChange("position", e.target.value as PositionOption)
                    }
                    disabled={saving}
                  >
                    <option value="TOP">Top bar</option>
                    <option value="BOTTOM">Bottom bar</option>
                    <option value="BOTTOM_RIGHT">Bottom right card</option>

                    <option value="TOP_LEFT">Top Left</option>
                    <option value="TOP_RIGHT">Top Right</option>
                    <option value="BOTTOM_LEFT">Bottom Left</option>

                    <option value="LEFT_CENTER">Left Center</option>
                    <option value="RIGHT_CENTER">Right Center</option>

                    <option value="CENTER">Center</option>
                    <option value="CENTER_LEFT">Center Left</option>
                    <option value="CENTER_RIGHT">Center Right</option>

                    <option value="FLOATING_TOP">Floating Top</option>
                    <option value="FLOATING_BOTTOM">Floating Bottom</option>
                    <option value="FLOATING_CENTER">Floating Center</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Colors</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <span>BG</span>
                      <Input
                        type="color"
                        className="h-8 w-10 cursor-pointer p-0"
                        value={draft.backgroundColor}
                        onChange={(e) =>
                          handleFieldChange("backgroundColor", e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      <span>Text</span>
                      <Input
                        type="color"
                        className="h-8 w-10 cursor-pointer p-0"
                        value={draft.textColor}
                        onChange={(e) => handleFieldChange("textColor", e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-base font-semibold">Website preview</h2>
              <DemoWidgetPreview widget={draft} />
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/widgets")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
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
          currentUsage={draft?.items.length || 0}
          limit={usage.limit}
        />
      )}
    </Card>
  )
}
