'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface CompanyData {
  id: string
  name: string
  slug: string
  website: string | null
  status: string
  createdAt: string
  members: Array<{
    id: string
    role: string
    joinedAt: string
    user: {
      id: string
      email: string
      name: string | null
      status: string
    }
  }>
  widgets: Array<{
    id: string
    name: string
    type: string
    status: string
    createdAt: string
    publicKey: string
  }>
  stats: {
    totalMembers: number
    totalWidgets: number
    activeWidgets: number
  }
}

export default function CompanyProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isLoading && isAuthenticated) {
      loadCompany()
    }
  }, [isAuthenticated, isLoading, router, id])

  async function loadCompany() {
    try {
      const res = await fetch(`/api/companies/${id}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load company')
      }
      const data = await res.json()
      setCompany(data.company)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading company...</div>

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!company) return <div>Company not found</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-sm text-gray-500">{company.slug}</p>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {company.website}
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={company.status === 'ACTIVE' ? 'default' : 'outline'}>
            {company.status}
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link href={`/companies/${company.id}/edit`}>Edit Company</Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.stats.totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Widgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.stats.totalWidgets}</div>
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
              {company.stats.activeWidgets}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({company.members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {company.members.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No members found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.user.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {member.user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.user.status === 'ACTIVE' ? 'default' : 'outline'}
                      >
                        {member.user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(member.joinedAt).toLocaleDateString()}
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
          <div className="flex items-center justify-between">
            <CardTitle>Widgets ({company.widgets.length})</CardTitle>
            <Button asChild size="sm">
              <Link href="/widgets/new">Create Widget</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {company.widgets.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No widgets found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.widgets.map((widget) => (
                  <TableRow key={widget.id}>
                    <TableCell className="font-medium">{widget.name}</TableCell>
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
