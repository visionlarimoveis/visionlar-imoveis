'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [auth, setAuth] = useState<boolean | null>(null)

  useEffect(() => {
    const ok = sessionStorage.getItem('adm_auth') === 'true'
    if (!ok) {
      router.replace('/adm')
    } else {
      setAuth(true)
    }
  }, [router])

  if (auth === null) {
    return (
      <div className="min-h-screen bg-[#0D2137] flex items-center justify-center">
        <div className="text-white/40 text-sm flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Verificando acesso...
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <Sidebar />
      <div className="ml-[252px] flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
