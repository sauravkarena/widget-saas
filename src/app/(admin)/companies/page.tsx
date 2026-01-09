'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'

interface CompanyItem {
  id: string
  name: string
  slug: string
  status?: 'ACTIVE' | 'SUSPENDED'
  createdAt: string
}

export default function CompaniesPage() {
  const { isAuthenticated, isLoading, isSuperAdmin } = useAuth()
  const router = useRouter()
  const [companies, setCompanies] = useState<CompanyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isLoading && isAuthenticated) {
      fetch('/api/companies')
        .then((res) => res.json())
        .then((data) => {
          setCompanies(data.companies || [])
        })
        .catch((err) => {
          setError(err.message || 'Failed to load companies')
        })
        .finally(() => setLoading(false))
    }
  }, [isAuthenticated, isLoading, router])

  async function toggleStatus(c: CompanyItem) {
    if (updatingId) return

    const nextStatus = c.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
    setUpdatingId(c.id)

    try {
      const res = await fetch(`/api/companies/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update status')
      }

      setCompanies((prev) =>
        prev.map((company) =>
          company.id === c.id
            ? {
                ...company,
                status: nextStatus,
              }
            : company,
        ),
      )
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return <div>Loading companies...</div>
  }

  const filtered = companies.filter((c) => {
    if (!search) return true
    const term = search.toLowerCase()
    return c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term)
  })

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Companies</CardTitle>
          <p className="text-sm text-muted-foreground">Manage all companies you have access to.</p>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-64"
          />
          {isSuperAdmin && (
            <Button asChild size="sm" className="md:ml-2">
              <Link href="/companies/new">Add Company</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No companies found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.slug}</TableCell>
                  <TableCell>
                    {isSuperAdmin ? (
                      <button
                        type="button"
                        onClick={() => toggleStatus(c)}
                        disabled={updatingId === c.id}
                        className="cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Badge
                          variant={c.status === 'ACTIVE' || !c.status ? 'default' : 'outline'}
                          className={
                            (c.status === 'SUSPENDED' ? 'text-muted-foreground ' : '') +
                            'transition-opacity disabled:opacity-60'
                          }
                        >
                          {c.status || 'ACTIVE'}
                        </Badge>
                      </button>
                    ) : (
                      <Badge
                        variant={c.status === 'ACTIVE' || !c.status ? 'default' : 'outline'}
                        className={c.status === 'SUSPENDED' ? 'text-muted-foreground' : ''}
                      >
                        {c.status || 'ACTIVE'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/companies/${c.id}`}>View</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/companies/${c.id}/edit`}>Edit</Link>
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
