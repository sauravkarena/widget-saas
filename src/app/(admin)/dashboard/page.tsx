'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

interface DashboardStats {
  widgets: number
  companies: number
}

export default function DashboardPage() {
  const { user, isSuperAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({ widgets: 0, companies: 0 })

  useEffect(() => {
    if (!user) return

    console.log('Dashboard current user:', user)
    console.log('Dashboard globalRole:', (user as any).globalRole)
    console.log('Dashboard isSuperAdmin:', isSuperAdmin)

    // Load basic counts using existing APIs
    Promise.all([
      fetch('/api/widgets').then((res) => res.json()),
      fetch('/api/companies').then((res) => res.json()),
    ])
      .then(([widgetsData, companiesData]) => {
        setStats({
          widgets: (widgetsData.widgets || []).length,
          companies: (companiesData.companies || []).length,
        })
      })
      .catch(() => {})
  }, [user, isSuperAdmin])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => signOut({ callbackUrl: '/login' })}>
          Logout
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
        <p className="text-gray-600">Email: {user?.email}</p>
        {isSuperAdmin && (
          <p className="text-xs text-green-600 mt-1 font-medium">SUPERADMIN access</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Widgets</h3>
          <p className="text-3xl font-bold">{stats.widgets}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Companies</h3>
          <p className="text-3xl font-bold">{stats.companies}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Role</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}