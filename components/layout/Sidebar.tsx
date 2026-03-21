'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const navGroups = [
  {
    label: 'Painel',
    items: [
      { href: '/dashboard', icon: '📊', label: 'Dashboard' },
      { href: '/site', icon: '🌐', label: 'Site Público' },
    ],
  },
  {
    label: 'Cadastros',
    items: [
      { href: '/imoveis', icon: '🏠', label: 'Imóveis' },
      { href: '/clientes', icon: '👥', label: 'Clientes' },
      { href: '/leads', icon: '🎯', label: 'Leads / CRM' },
    ],
  },
  {
    label: 'Configurações',
    items: [
      { href: '/cidades', icon: '🏙️', label: 'Cidades' },
      { href: '/bairros', icon: '📍', label: 'Bairros' },
      { href: '/tipos', icon: '🏷️', label: 'Tipos de Imóvel' },
      { href: '/corretores', icon: '🤝', label: 'Corretores' },
      { href: '/config', icon: '⚙️', label: 'Configurações' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[252px] bg-[#0D2137] flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/[0.07] flex items-center">
        <Image
          src="/logo.png"
          alt="VisionLar Imóveis"
          width={170}
          height={60}
          className="object-contain"
          priority
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="text-[10px] font-bold text-white/25 tracking-[2.5px] uppercase px-2.5 py-3">
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg mb-0.5 text-[13px] font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#B8892A] to-[#D4A843] text-[#0D2137] font-bold shadow-[0_2px_12px_rgba(184,137,42,0.35)]'
                      : 'text-white/55 hover:bg-white/[0.06] hover:text-white/90'
                  }`}
                >
                  <span className="text-sm w-4 text-center shrink-0">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-white/[0.07]">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B8892A] to-[#D4A843] flex items-center justify-center text-[#0D2137] text-xs font-bold shrink-0">
            VL
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-500">Administrador</div>
            <div className="text-white/35 text-[10px]">VisionLar Imóveis</div>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem('adm_auth'); window.location.href = '/site' }}
            className="text-white/25 hover:text-red-400 transition-colors text-[10px] shrink-0"
            title="Sair"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
