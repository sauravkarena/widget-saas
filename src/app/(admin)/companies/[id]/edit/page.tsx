'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

interface CompanyDetails {
  id: string
  name: string
  slug: string
}

export default function EditCompanyPage() {
  const params = useParams<{ id: string }>()
  const companyId = params?.id as string | undefined
  // Require authentication, but allow both SUPERADMIN and company owners to access.
  useAuth()
  const router = useRouter()
  const [company, setCompany] = useState<CompanyDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!companyId) {
        setError('Invalid company id')
        setLoading(false)
        return
      }
      try {
        const res = await fetch('/api/companies')
        const data = await res.json().catch(() => ({}))
        if (!cancelled && data.companies) {
          const found = (data.companies as any[]).find((c) => c.id === companyId)
          if (found) {
            setCompany({ id: found.id, name: found.name, slug: found.slug })
          } else {
            setError('Company not found')
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load company')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [companyId])

  function onChange(field: 'name' | 'slug', value: string) {
    setCompany((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: company.name, slug: company.slug }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save company')
      }

      router.push('/companies')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to save company')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading company...</div>
  }

  if (!company) {
    return <div className="text-sm text-muted-foreground">Company not found.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Company</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={company.name}
              onChange={(e) => onChange('name', e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={company.slug}
              onChange={(e) => onChange('slug', e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => router.push('/companies')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
