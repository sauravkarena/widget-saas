'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SimpleUser {
  id: string
  email: string
  name: string | null
}

export default function NewCompanyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<SimpleUser[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState('')
  const [canAssignOwner, setCanAssignOwner] = useState(false)
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | undefined>(
    undefined,
  )
  const [ownerMode, setOwnerMode] = useState<'associate' | 'create'>('associate')
  const [newOwnerName, setNewOwnerName] = useState('')
  const [newOwnerEmail, setNewOwnerEmail] = useState('')
  const [newOwnerPassword, setNewOwnerPassword] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadUsers() {
      try {
        const res = await fetch('/api/users')

        if (res.status === 403) {
          // Not SUPERADMIN, no need to show owner select
          if (!cancelled) {
            setCanAssignOwner(false)
          }
          return
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load users')
        }

        const data = await res.json()
        if (!cancelled) {
          const simpleUsers: SimpleUser[] = (data.users || []).map((u: any) => ({
            id: u.id,
            email: u.email,
            name: u.name ?? null,
          }))
          setUsers(simpleUsers)
          setCanAssignOwner(true)
        }
      } catch (err: any) {
        if (!cancelled) {
          setUsersError(err.message || 'Failed to load users')
        }
      } finally {
        if (!cancelled) {
          setUsersLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string

    try {
      const payload: any = { name }

      if (ownerMode === 'associate' && canAssignOwner && selectedOwnerId) {
        payload.userId = selectedOwnerId
      }

      if (ownerMode === 'create') {
        payload.newUser = {
          name: newOwnerName,
          email: newOwnerEmail,
          password: newOwnerPassword,
        }
      }

      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create company')
      }

      router.push('/companies')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Company</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Acme Inc."
              disabled={loading}
            />
          </div>

          {canAssignOwner && (
            <div className="space-y-3">
              <Label>Owner user (SUPERADMIN)</Label>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ownerMode"
                    value="associate"
                    checked={ownerMode === 'associate'}
                    onChange={() => setOwnerMode('associate')}
                  />
                  <span>Associate existing user</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ownerMode"
                    value="create"
                    checked={ownerMode === 'create'}
                    onChange={() => {
                      setOwnerMode('create')
                      setSelectedOwnerId(undefined)
                    }}
                  />
                  <span>Create new user</span>
                </label>
              </div>

              {usersError && (
                <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-700">
                  {usersError}
                </div>
              )}

              {ownerMode === 'associate' && (
                <div className="space-y-2">
                  <Select
                    value={selectedOwnerId}
                    onValueChange={(value) => setSelectedOwnerId(value)}
                    disabled={loading || usersLoading || users.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          usersLoading
                            ? 'Loading users...'
                            : users.length === 0
                            ? 'No users available'
                            : 'Select owner user'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          <span className="flex flex-col text-left">
                            <span className="text-sm font-medium">{u.email}</span>
                            {u.name && (
                              <span className="text-xs text-muted-foreground">{u.name}</span>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    If no user is selected, the currently logged-in user will be set as OWNER.
                  </p>
                </div>
              )}

              {ownerMode === 'create' && (
                <div className="mt-2 space-y-3 rounded-md border p-3">
                  <div className="space-y-1">
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ownerEmail">Owner Email</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={newOwnerEmail}
                      onChange={(e) => setNewOwnerEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ownerPassword">Owner Password</Label>
                    <Input
                      id="ownerPassword"
                      type="password"
                      minLength={8}
                      value={newOwnerPassword}
                      onChange={(e) => setNewOwnerPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/companies')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Company'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
