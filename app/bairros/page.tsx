'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export default function BairrosPage() {
  const [bairros, setBairros] = useState<any[]>([])
  const [cidades, setCidades] = useState<any[]>([])
  const [nome, setNome] = useState('')
  const [cidadeId, setCidadeId] = useState('')
  const [toast, setToast] = useState('')
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2800) }
  const load = useCallback(async () => { const { data } = await supabase.from('bairros').select('*, cidade:cidades(nome)').order('nome'); setBairros(data || []) }, [])
  useEffect(() => { load(); supabase.from('cidades').select('*').order('nome').then(r => { setCidades(r.data || []); if (r.data?.length) setCidadeId(r.data[0].id) }) }, [load])

  async function add() {
    if (!nome.trim() || !cidadeId) return showToast('⚠️ Preencha os campos!')
    const { error } = await supabase.from('bairros').insert({ nome: nome.trim(), cidade_id: cidadeId })
    if (error) showToast('❌ ' + error.message)
    else { showToast('📍 Bairro adicionado!'); setNome(''); load() }
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center sticky top-0 z-40 shadow-sm">
        <div><div className="text-[15px] font-bold text-gray-900">Bairros</div><div className="text-[11px] text-gray-400 mt-0.5">Bairros por cidade</div></div>
      </header>
      <main className="p-5 grid grid-cols-[340px,1fr] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-900">➕ Novo Bairro</h3></div>
          <div className="p-5 flex flex-col gap-3">
            <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Cidade *</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={cidadeId} onChange={e => setCidadeId(e.target.value)}>{cidades.map(c => <option key={c.id} value={c.id}>{c.nome} - {c.estado}</option>)}</select></div>
            <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Nome do Bairro *</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="Ex: Centro" value={nome} onChange={e => setNome(e.target.value)} /></div>
          </div>
          <div className="px-5 pb-5"><button onClick={add} className="btn-gold w-full text-xs py-2 rounded-lg">+ Adicionar</button></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-900">Bairros Cadastrados</h3></div>
          <table className="w-full">
            <thead><tr className="bg-gray-50">{['Bairro','Cidade','Ações'].map(h => <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5">{h}</th>)}</tr></thead>
            <tbody>{bairros.map(b => <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50/50"><td className="px-4 py-3 text-xs font-semibold text-gray-900">{b.nome}</td><td className="px-4 py-3 text-xs text-gray-500">{b.cidade?.nome}</td><td className="px-4 py-3"><button onClick={async () => { await supabase.from('bairros').delete().eq('id', b.id); load() }} className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-lg hover:bg-red-100 border border-red-100">🗑</button></td></tr>)}</tbody>
          </table>
        </div>
      </main>
      {toast && <div className="fixed bottom-5 right-5 bg-[#0D2137] text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold z-[100]">{toast}</div>}
    </>
  )
}
