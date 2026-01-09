'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

interface UserDetails {
  id: string
  email: string
  name: string | null
  packageId?: string | null
}

interface Package {
  id: string
  name: string
  slug: string
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { isSuperAdmin } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<UserDetails | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        // Load packages first
        const packagesRes = await fetch('/api/packages')
        const packagesData = await packagesRes.json().catch(() => ({}))
        if (!cancelled && packagesData.packages) {
          setPackages(packagesData.packages)
        }

        // Load user
        const res = await fetch(`/api/users/${id}`)
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          console.error('Failed to load user:', res.status, errorData)
          setError(errorData.error || `Failed to load user (${res.status})`)
          if (!cancelled) setLoading(false)
          return
        }
        
        const data = await res.json()
        
        if (data && data.user) {
          if (!cancelled) {
            setUser({
              id: data.user.id,
              email: data.user.email,
              name: data.user.name ?? null,
              packageId: data.user.package?.packageId || null
            })
          }
        } else {
          if (!cancelled) {
            setError('User not found in response')
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load user')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  if (!isSuperAdmin) {
    return <div className="text-sm text-muted-foreground">You do not have permission to edit users.</div>
  }

  function onChange(field: 'name' | 'email', value: string) {
    setUser((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          packageId: user.packageId
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save user')
      }

      router.push('/users')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading user...</div>
  }

  if (!user) {
    return <div className="text-sm text-muted-foreground">User not found.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit User</CardTitle>
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
              value={user.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              onChange={(e) => onChange('email', e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="package">Subscription Package</Label>
            <select
              id="package"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={user.packageId || ''}
              onChange={(e) => setUser(prev => prev ? {...prev, packageId: e.target.value || null} : prev)}
              disabled={saving}
            >
              <option value="">No Package Assigned</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Assign a subscription package to this user
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => router.push('/users')}
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
