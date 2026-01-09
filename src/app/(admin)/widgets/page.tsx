'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

interface WidgetListItem {
  id: string
  publicKey: string
  name: string
  status: string
  type: string
  createdAt: string
  company?: {
    id: string
    name: string
  }
}

interface CompanyOption {
  id: string
  name: string
}

export default function WidgetsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [widgets, setWidgets] = useState<WidgetListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isLoading && isAuthenticated) {
      Promise.all([
        fetch('/api/widgets').then((res) => res.json()),
        fetch('/api/companies').then((res) => res.json()),
      ])
        .then(([widgetsData, companiesData]) => {
          setWidgets(widgetsData.widgets || [])
          setCompanies(companiesData.companies || [])
        })
        .catch((err) => {
          setError(err.message || 'Failed to load widgets')
        })
        .finally(() => setLoading(false))
    }
  }, [isAuthenticated, isLoading, router])

  function getEmbedCode(publicKey: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const url = `${baseUrl}/widget.js`
    
    return `<script
  src="${url}"
  data-key="${publicKey}"
  async
></script>`
  }

  async function copyEmbed(publicKey: string) {
    await navigator.clipboard.writeText(getEmbedCode(publicKey))
    setCopiedKey(publicKey)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  async function toggleStatus(w: WidgetListItem) {
    if (updatingId) return

    let nextStatus = 'ACTIVE'
    if (w.status === 'DRAFT') nextStatus = 'ACTIVE'
    else if (w.status === 'ACTIVE') nextStatus = 'PAUSED'
    else if (w.status === 'PAUSED') nextStatus = 'ACTIVE'

    setUpdatingId(w.id)

    try {
      const res = await fetch(`/api/widgets/${w.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === w.id ? { ...widget, status: nextStatus } : widget
        )
      )
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  async function deleteWidget(w: WidgetListItem) {
    if (updatingId) return

    setUpdatingId(w.id)

    try {
      const res = await fetch(`/api/widgets/${w.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete widget')

      setWidgets((prev) => prev.filter((widget) => widget.id !== w.id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete widget')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredWidgets = useMemo(() => {
    return widgets.filter((w) => {
      const matchesSearch =
        !search || w.name.toLowerCase().includes(search.toLowerCase())
      const matchesCompany =
        !companyFilter || w.company?.id === companyFilter
      return matchesSearch && matchesCompany
    })
  }, [widgets, search, companyFilter])

  if (loading) return <div>Loading widgets...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Widgets</h1>

        <div className="flex gap-2">
          <Input
            placeholder="Search widgets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-64"
          />

          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Link href="/widgets/new">
            <Button>Create Widget</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All widgets</CardTitle>
        </CardHeader>

        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredWidgets.map((w) => (
                <tr key={w.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium">{w.name}</div>
                    {w.company && (
                      <div className="text-xs text-gray-500">
                        {w.company.name}
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-2 text-center">{w.type}</td>

                  <td className="px-3 py-2 text-center">
                    <button onClick={() => toggleStatus(w)}>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                        {w.status}
                      </span>
                    </button>
                  </td>

                  <td className="px-3 py-2 text-center">
                    {new Date(w.createdAt).toLocaleString()}
                  </td>

                  <td className="px-3 py-2 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyEmbed(w.publicKey)}
                    >
                      {copiedKey === w.publicKey ? 'Copied' : 'Copy Embed'}
                    </Button>

                    <Button asChild size="sm" variant="outline">
                      <Link href={`/widgets/${w.id}`}>Edit</Link>
                    </Button>

                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/widgets/${w.id}?tab=analytics`}>Analytics</Link>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteWidget(w)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
