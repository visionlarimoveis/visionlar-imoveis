'use client'
import { useState } from 'react'

export default function ConfigPage() {
  const [toast, setToast] = useState('')
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2800) }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center sticky top-0 z-40 shadow-sm">
        <div><div className="text-[15px] font-bold text-gray-900">Configurações</div><div className="text-[11px] text-gray-400 mt-0.5">Dados gerais da imobiliária</div></div>
      </header>
      <main className="p-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-3xl">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-900">Dados da Imobiliária</h3></div>
          <div className="p-5 grid grid-cols-2 gap-4">
            <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Nome da Imobiliária</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" defaultValue="VisionLar Imóveis" /></div>
            <div><label className="text-[11px] font-bold text-gray-700 block mb-1">CRECI</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="00000-J" /></div>
            <div><label className="text-[11px] font-bold text-gray-700 block mb-1">WhatsApp (com DDI+DDD)</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" defaultValue="5551997901012" /></div>
            <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Email</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" defaultValue="contato@visionlarimovies.com.br" /></div>
            <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Telefone</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" defaultValue="(51) 9 9790-1012" /></div>
            <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Cidade Sede</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="Candelária - RS" /></div>
            <div className="col-span-2"><label className="text-[11px] font-bold text-gray-700 block mb-1">Endereço Completo</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="Rua X, 123 - Centro" /></div>
            <div className="col-span-2"><label className="text-[11px] font-bold text-gray-700 block mb-1">Sobre a Empresa (aparece no site)</label><textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 resize-y min-h-[80px]" defaultValue="A VisionLar Imóveis é uma empresa especializada em intermediação imobiliária, com foco em proporcionar uma experiência segura, transparente e eficiente para quem deseja comprar ou vender imóveis." /></div>
          </div>
          <div className="px-5 py-3 border-t border-gray-200 flex gap-2 justify-end">
            <button onClick={() => showToast('✅ Configurações salvas!')} className="btn-gold text-xs px-5 py-2 rounded-lg">💾 Salvar Configurações</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-3xl mt-4">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">🔑 Variáveis de Ambiente — Vercel</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Settings → Environment Variables no painel do Vercel</p>
          </div>
          <div className="p-5 space-y-2">
            {[
              ['NEXT_PUBLIC_SUPABASE_URL', 'https://sgrsjmizmwbsotamfsbw.supabase.co'],
              ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'sb_publishable_2YnL7v...'],
              ['NEXT_PUBLIC_WHATSAPP', '5551997901012'],
              ['NEXT_PUBLIC_SITE_URL', 'https://visionlar.vercel.app'],
            ].map(([key, val]) => (
              <div key={key} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5">
                <code className="text-[10px] font-bold text-[#B8892A] min-w-[280px]">{key}</code>
                <code className="text-[10px] text-gray-400">{val}</code>
              </div>
            ))}
          </div>
        </div>
      </main>
      {toast && <div className="fixed bottom-5 right-5 bg-[#0D2137] text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold z-[100]">{toast}</div>}
    </>
  )
}
