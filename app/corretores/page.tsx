'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const emptyForm = { nome: '', creci: '', telefone: '', email: '', status: 'Ativo' as any }

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2800) }
  const load = useCallback(async () => { const { data } = await supabase.from('corretores').select('*').order('nome'); setCorretores(data || []) }, [])
  useEffect(() => { load() }, [load])

  const ini = (n: string) => n.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()
  const inp = (k: keyof typeof emptyForm) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function salvar() {
    if (!form.nome || !form.creci) return showToast('⚠️ Preencha nome e CRECI!')
    setSaving(true)
    const { error } = await supabase.from('corretores').insert({ nome: form.nome, creci: form.creci, telefone: form.telefone || null, email: form.email || null, status: form.status })
    if (error) showToast('❌ ' + error.message)
    else { showToast('🤝 Corretor cadastrado!'); setModalOpen(false); setForm(emptyForm); load() }
    setSaving(false)
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div><div className="text-[15px] font-bold text-gray-900">Corretores</div><div className="text-[11px] text-gray-400 mt-0.5">Equipe comercial</div></div>
        <button onClick={() => { setForm(emptyForm); setModalOpen(true) }} className="btn-gold text-xs px-4 py-1.5 rounded-lg">+ Novo Corretor</button>
      </header>
      <main className="p-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {corretores.length === 0 ? <div className="text-center py-12 text-gray-400"><div className="text-3xl mb-2 opacity-40">🤝</div><p className="text-sm">Nenhum corretor cadastrado</p></div> : (
            <table className="w-full">
              <thead><tr className="bg-gray-50">{['Corretor','CRECI','Telefone','Email','Status','Ações'].map(h => <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5">{h}</th>)}</tr></thead>
              <tbody>{corretores.map(c => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0D2137] text-white flex items-center justify-center text-[10px] font-bold shrink-0">{ini(c.nome)}</div>
                      <span className="text-xs font-semibold text-gray-900">{c.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{c.creci}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{c.telefone || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{c.email || '—'}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{c.status}</span></td>
                  <td className="px-4 py-3"><button onClick={async () => { if (!confirm('Excluir?')) return; await supabase.from('corretores').delete().eq('id', c.id); load() }} className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-lg hover:bg-red-100 border border-red-100">🗑</button></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">🤝 Cadastrar Corretor</h2>
              <button onClick={() => setModalOpen(false)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-sm">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="text-[11px] font-bold text-gray-700 block mb-1">Nome Completo *</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="Nome do corretor" value={form.nome} onChange={inp('nome')} /></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">CRECI *</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="12345-J" value={form.creci} onChange={inp('creci')} /></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Telefone</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="(54) 9 9999-9999" value={form.telefone} onChange={inp('telefone')} /></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Email</label><input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.email} onChange={inp('email')} /></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Status</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.status} onChange={inp('status')}><option>Ativo</option><option>Inativo</option></select></div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex gap-2 justify-end">
              <button onClick={() => setModalOpen(false)} className="text-xs border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={salvar} disabled={saving} className="btn-gold text-xs px-5 py-2 rounded-lg disabled:opacity-60">{saving ? 'Salvando...' : '💾 Salvar'}</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-5 right-5 bg-[#0D2137] text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold z-[100]">{toast}</div>}
    </>
  )
}
