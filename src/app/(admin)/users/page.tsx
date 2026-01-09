'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

interface UserRow {
  id: string
  email: string
  name: string | null
  globalRole: string
  companyCount: number
  status: string
  createdAt: string
  lastLoginAt: string | null
}

export default function UsersPage() {
  const { isSuperAdmin } = useAuth()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/users')
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load users')
        }
        const data = await res.json()
        if (!cancelled) {
          setUsers(data.users || [])
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Something went wrong')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  async function toggleStatus(user: UserRow) {
    if (updatingId) return

    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setUpdatingId(user.id)

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update status')
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                status: nextStatus,
              }
            : u,
        ),
      )
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Users</CardTitle>
          <p className="text-sm text-muted-foreground">All users with company assignments.</p>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-64"
          />
          {isSuperAdmin && (
            <Button asChild size="sm" className="md:ml-2">
              <Link href="/users/new">Add User</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading users...</div>
        ) : users.filter((u) => {
            if (!search) return true
            const term = search.toLowerCase()
            return (
              u.email.toLowerCase().includes(term) ||
              (u.name ? u.name.toLowerCase().includes(term) : false)
            )
          }).length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No users found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Companies</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users
                .filter((u) => {
                  if (!search) return true
                  const term = search.toLowerCase()
                  return (
                    u.email.toLowerCase().includes(term) ||
                    (u.name ? u.name.toLowerCase().includes(term) : false)
                  )
                })
                .map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.globalRole === 'SUPERADMIN' ? 'default' : 'outline'}>
                      {user.globalRole}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.companyCount}</TableCell>
                  <TableCell>
                    {isSuperAdmin ? (
                      <button
                        type="button"
                        onClick={() => toggleStatus(user)}
                        disabled={updatingId === user.id}
                        className="cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Badge
                          variant={user.status === 'ACTIVE' ? 'default' : 'outline'}
                          className={
                            (user.status !== 'ACTIVE' ? 'text-muted-foreground ' : '') +
                            'transition-opacity disabled:opacity-60'
                          }
                        >
                          {user.status}
                        </Badge>
                      </button>
                    ) : (
                      <Badge
                        variant={user.status === 'ACTIVE' ? 'default' : 'outline'}
                        className={user.status !== 'ACTIVE' ? 'text-muted-foreground' : ''}
                      >
                        {user.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/users/${user.id}`}>View</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/users/${user.id}/edit`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
