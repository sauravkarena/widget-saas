'use client'

import { useEffect, useState } from 'react'
import { CompanyWithMembers } from '@/types'

export function useCompany() {
  const [currentCompany, setCurrentCompany] = useState<CompanyWithMembers | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get from localStorage
    const stored = localStorage.getItem('currentCompany')
    if (stored) {
      setCurrentCompany(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  const switchCompany = (company: CompanyWithMembers) => {
    setCurrentCompany(company)
    localStorage.setItem('currentCompany', JSON.stringify(company))
  }

  return {
    currentCompany,
    switchCompany,
    isLoading,
  }
}