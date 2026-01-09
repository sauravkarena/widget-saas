'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/use-auth'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 13h8V3H3v10zM13 21h8V11h-8v10z" />
        <path d="M3 21h8v-4H3v4zM13 9h8V3h-8v6z" />
      </svg>
    ),
  },
  {
    href: '/users',
    label: 'Users',
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="3" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/widgets',
    label: 'Widgets',
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/companies',
    label: 'Companies',
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 21V7l9-4 9 4v14H3z" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    href: '/packages',
    label: 'Packages',
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    superAdminOnly: true
  },
  

]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, isLoading, isSuperAdmin } = useAuth()

  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const sidebarWidthClass = sidebarCollapsed ? 'md:w-20' : 'md:w-64'

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navbar */}
      <header className="border-b bg-white">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <span className="sr-only">Toggle menu</span>
              <span className="block h-0.5 w-5 bg-gray-800 mb-1" />
              <span className="block h-0.5 w-5 bg-gray-800 mb-1" />
              <span className="block h-0.5 w-5 bg-gray-800" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-xs font-bold text-white">
                WS
              </span>
              <span className="font-semibold text-lg hidden sm:inline-block">
                Widget SaaS
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex mr-1 h-8 w-8 rounded-full border border-gray-200"
              onClick={() => setSidebarCollapsed((v) => !v)}
            >
              <span className="sr-only">Toggle sidebar width</span>
              <span className="text-lg leading-none">
                {sidebarCollapsed ? '»' : '«'}
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.email?.[0]?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block max-w-[160px] truncate">
                    {user?.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    signOut({ callbackUrl: '/login' })
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-30 w-64 transform border-r bg-white shadow-sm
            transition-all duration-200 ease-in-out
            md:static md:translate-x-0 ${sidebarWidthClass}
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="hidden md:flex h-14 items-center justify-end px-3 border-b">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full border border-gray-200"
              onClick={() => setSidebarCollapsed((v) => !v)}
            >
              <span className="sr-only">Collapse sidebar</span>
              <span className="text-lg leading-none">
                {sidebarCollapsed ? '»' : '«'}
              </span>
            </Button>
          </div>
          <div className="flex h-14 items-center px-4 md:hidden border-b">
            <span className="font-semibold">Menu</span>
            <button
              type="button"
              className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <span className="block h-0.5 w-5 rotate-45 bg-gray-800 translate-y-0.5" />
              <span className="block h-0.5 w-5 -rotate-45 bg-gray-800 -translate-y-0.5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-3 md:p-3">
            {navItems
              .filter((item) => {
                if (item.href === '/users') return isSuperAdmin
                if ((item as any).superAdminOnly) return isSuperAdmin
                return true
              })
              .map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium
                      transition-colors border-l-2
                      ${
                        active
                          ? 'bg-gray-900 text-white border-l-blue-500'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-l-transparent'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-gray-600">
                      {item.icon}
                    </span>
                    <span className={sidebarCollapsed ? 'sr-only' : 'inline-block'}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
          </nav>
        </aside>

        {/* Main content */}
        <main
          className={`flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 transition-[margin] duration-200`}
        >
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}