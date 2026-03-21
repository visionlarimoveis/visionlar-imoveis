'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export default function TiposPage() {
  const [tipos, setTipos] = useState<any[]>([])
  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState('🏠')
  const [toast, setToast] = useState('')
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2800) }
  const load = useCallback(async () => { const { data } = await supabase.from('tipos_imovel').select('*').order('nome'); setTipos(data || []) }, [])
  useEffect(() => { load() }, [load])

  async function add() {
    if (!nome.trim()) return showToast('⚠️ Digite o nome!')
    const { error } = await supabase.from('tipos_imovel').insert({ nome: nome.trim(), icone: icone || '🏠' })
    if (error) showToast('❌ ' + error.message)
    else { showToast('🏷️ Tipo adicionado!'); setNome(''); setIcone('🏠'); load() }
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center sticky top-0 z-40 shadow-sm">
        <div><div className="text-[15px] font-bold text-gray-900">Tipos de Imóvel</div><div className="text-[11px] text-gray-400 mt-0.5">Categorias de imóveis</div></div>
      </header>
      <main className="p-5 grid grid-cols-[340px,1fr] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-900">➕ Novo Tipo</h3></div>
          <div className="p-5 flex flex-col gap-3">
            <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Nome *</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="Ex: Apartamento" value={nome} onChange={e => setNome(e.target.value)} /></div>
            <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Ícone (emoji)</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="🏠" maxLength={4} value={icone} onChange={e => setIcone(e.target.value)} /></div>
          </div>
          <div className="px-5 pb-5"><button onClick={add} className="btn-gold w-full text-xs py-2 rounded-lg">+ Adicionar</button></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-900">Tipos Cadastrados</h3></div>
          <table className="w-full">
            <thead><tr className="bg-gray-50">{['Ícone','Tipo','Ações'].map(h => <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5">{h}</th>)}</tr></thead>
            <tbody>{tipos.map(t => <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50/50"><td className="px-4 py-3 text-2xl">{t.icone}</td><td className="px-4 py-3 text-xs font-semibold text-gray-900">{t.nome}</td><td className="px-4 py-3"><button onClick={async () => { await supabase.from('tipos_imovel').delete().eq('id', t.id); load() }} className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-lg hover:bg-red-100 border border-red-100">🗑</button></td></tr>)}</tbody>
          </table>
        </div>
      </main>
      {toast && <div className="fixed bottom-5 right-5 bg-[#0D2137] text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold z-[100]">{toast}</div>}
    </>
  )
}
