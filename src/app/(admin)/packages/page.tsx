'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Package {
  id: string
  name: string
  slug: string
  description: string | null
  maxWidgets: number
  maxCompanies: number
  price: number
  billingCycle: string
  isActive: boolean
  _count?: {
    users: number
  }
}

export default function PackagesPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isLoading && isAuthenticated) {
      loadPackages()
    }
  }, [isAuthenticated, isLoading, router])

  async function loadPackages() {
    try {
      const res = await fetch('/api/packages')
      if (!res.ok) {
        if (res.status === 403) {
          setError('Access denied - SUPERADMIN only')
          return
        }
        throw new Error('Failed to load packages')
      }
      const data = await res.json()
      setPackages(data.packages || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(pkg: Package) {
    try {
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkg)
      })

      if (!res.ok) throw new Error('Failed to update package')

      setEditingId(null)
      loadPackages()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleToggleActive(pkg: Package) {
    try {
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pkg, isActive: !pkg.isActive })
      })

      if (!res.ok) throw new Error('Failed to update package')

      loadPackages()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div>Loading packages...</div>

  if (error && error.includes('Access denied')) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Package Management</h1>
        <div className="text-sm text-gray-500">SUPERADMIN Only</div>
      </div>

      {error && !error.includes('Access denied') && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Subscription Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-lg border p-4"
              >
                {editingId === pkg.id ? (
                  <EditPackageForm
                    package={pkg}
                    onSave={handleUpdate}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{pkg.name}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {pkg.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span><strong>Widgets:</strong> {pkg.maxWidgets === 999999 ? 'Unlimited' : pkg.maxWidgets}</span>
                        <span><strong>Companies:</strong> {pkg.maxCompanies === 999999 ? 'Unlimited' : pkg.maxCompanies}</span>
                        <span><strong>Price:</strong> ${pkg.price}/{pkg.billingCycle}</span>
                        <span className="text-gray-500">
                          {pkg._count?.users || 0} users
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(pkg.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={pkg.isActive ? 'outline' : 'default'}
                        onClick={() => handleToggleActive(pkg)}
                      >
                        {pkg.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EditPackageForm({
  package: pkg,
  onSave,
  onCancel
}: {
  package: Package
  onSave: (pkg: Package) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(pkg)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input
            value={draft.slug}
            disabled
            className="bg-gray-50"
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={draft.description || ''}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <Label>Max Widgets</Label>
          <Input
            type="number"
            value={draft.maxWidgets}
            onChange={(e) => setDraft({ ...draft, maxWidgets: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Max Companies</Label>
          <Input
            type="number"
            value={draft.maxCompanies}
            onChange={(e) => setDraft({ ...draft, maxCompanies: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Price ($)</Label>
          <Input
            type="number"
            step="0.01"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Billing Cycle</Label>
          <select
            className="w-full rounded-md border px-3 py-2"
            value={draft.billingCycle}
            onChange={(e) => setDraft({ ...draft, billingCycle: e.target.value })}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(draft)}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}
