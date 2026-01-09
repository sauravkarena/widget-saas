'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface UserData {
  id: string
  email: string
  name: string | null
  status: string
  globalRole: string
  createdAt: string
  lastLoginAt: string | null
  package: {
    packageId: string
    packageName: string
    packageSlug: string
  } | null
  companies: Array<{
    id: string
    role: string
    joinedAt: string
    company: {
      id: string
      name: string
      slug: string
      status: string
    }
  }>
  widgets: Array<{
    id: string
    name: string
    type: string
    status: string
    createdAt: string
    company: {
      id: string
      name: string
    }
  }>
  stats: {
    totalCompanies: number
    totalWidgets: number
    activeWidgets: number
  }
}

export default function UserProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const { isAuthenticated, isLoading, isSuperAdmin } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isLoading && isAuthenticated) {
      loadUser()
    }
  }, [isAuthenticated, isLoading, router, id])

  async function loadUser() {
    try {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load user')
      }
      const data = await res.json()
      setUser(data.user)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading user...</div>

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!user) return <div>User not found</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{user.name || user.email}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.package && (
            <p className="text-sm text-blue-600 mt-1">
              Package: {user.package.packageName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={user.globalRole === 'SUPERADMIN' ? 'default' : 'outline'}>
            {user.globalRole}
          </Badge>
          <Badge variant={user.status === 'ACTIVE' ? 'default' : 'outline'}>
            {user.status}
          </Badge>
          {isSuperAdmin && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/users/${user.id}/edit`}>Edit User</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.totalCompanies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Widgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.totalWidgets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Widgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {user.stats.activeWidgets}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies Section */}
      <Card>
        <CardHeader>
          <CardTitle>Companies ({user.companies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {user.companies.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              Not a member of any companies
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.companies.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell className="font-medium">
                      {membership.company.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{membership.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={membership.company.status === 'ACTIVE' ? 'default' : 'outline'}
                      >
                        {membership.company.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(membership.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/companies/${membership.company.id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Widgets Section */}
      <Card>
        <CardHeader>
          <CardTitle>Widgets Created ({user.widgets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {user.widgets.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No widgets created
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Widget Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.widgets.map((widget) => (
                  <TableRow key={widget.id}>
                    <TableCell className="font-medium">{widget.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {widget.company.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {widget.type}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          widget.status === 'ACTIVE'
                            ? 'default'
                            : widget.status === 'DRAFT'
                            ? 'outline'
                            : 'secondary'
                        }
                      >
                        {widget.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(widget.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/widgets/${widget.id}`}>Edit</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/widgets/${widget.id}?tab=analytics`}>
                          Analytics
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
