'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const emptyForm = { cliente_id: '', imovel_id: '', corretor_id: '', interesse: 'Compra' as any, status: 'Lead' as any, orcamento: '', observacoes: '' }
const statusColors: Record<string, string> = { Lead: 'bg-amber-50 text-amber-800', Negociando: 'bg-yellow-50 text-yellow-800', Fechado: 'bg-emerald-50 text-emerald-700', Perdido: 'bg-red-50 text-red-700' }
function fmtP(p: number) { return p >= 1e6 ? `R$ ${(p/1e6).toFixed(1).replace('.',',')}M` : `R$ ${(p/1000).toFixed(0)}k` }

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [imoveis, setImoveis] = useState<any[]>([])
  const [corretores, setCorretores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [filtro, setFiltro] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800) }

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('leads')
      .select('*, cliente:clientes(id,nome,telefone), imovel:imoveis(id,titulo), corretor:corretores(id,nome)')
      .order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    supabase.from('clientes').select('id,nome').order('nome').then(r => setClientes(r.data || []))
    supabase.from('imoveis').select('id,titulo').eq('status','Ativo').order('titulo').then(r => setImoveis(r.data || []))
    supabase.from('corretores').select('id,nome').eq('status','Ativo').order('nome').then(r => setCorretores(r.data || []))
  }, [load])

  const filtered = filtro ? leads.filter(l => l.status === filtro) : leads
  const inp = (k: keyof typeof emptyForm) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function salvar() {
    if (!form.cliente_id) { showToast('⚠️ Selecione um cliente!'); return }
    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      cliente_id: form.cliente_id, imovel_id: form.imovel_id || null,
      corretor_id: form.corretor_id || null, interesse: form.interesse,
      status: form.status, orcamento: form.orcamento ? parseFloat(form.orcamento) : null,
      observacoes: form.observacoes || null, data_contato: new Date().toISOString().split('T')[0],
    })
    if (error) showToast('❌ Erro: ' + error.message)
    else { showToast('🎯 Lead registrado!'); setModalOpen(false); setForm(emptyForm); load() }
    setSaving(false)
  }

  async function updStatus(id: string, status: string) {
    await supabase.from('leads').update({ status }).eq('id', id)
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l))
    showToast('✅ Status atualizado!')
  }

  async function deletar(id: string) {
    if (!confirm('Excluir lead?')) return
    await supabase.from('leads').delete().eq('id', id)
    showToast('🗑 Lead excluído'); load()
  }

  const pills = ['', 'Lead', 'Negociando', 'Fechado', 'Perdido']
  const pillLabels: Record<string, string> = { '': 'Todos', Lead: '🔵 Lead', Negociando: '🟡 Negociando', Fechado: '🟢 Fechado', Perdido: '🔴 Perdido' }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div><div className="text-[15px] font-bold text-gray-900">Leads / CRM</div><div className="text-[11px] text-gray-400 mt-0.5">Pipeline de oportunidades</div></div>
        <button onClick={() => { setForm(emptyForm); setModalOpen(true) }} className="btn-gold text-xs px-4 py-1.5 rounded-lg">+ Novo Lead</button>
      </header>

      <div className="bg-white border-b border-gray-200 px-5 py-3 flex gap-2 flex-wrap">
        {pills.map(p => (
          <button key={p} onClick={() => setFiltro(p)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filtro === p ? 'bg-[#0D2137] text-white border-[#0D2137]' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>{pillLabels[p]}</button>
        ))}
      </div>

      <main className="p-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div> : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><div className="text-3xl mb-2 opacity-40">🎯</div><p className="text-sm">Nenhum lead encontrado</p></div>
          ) : (
            <table className="w-full">
              <thead><tr className="bg-gray-50">{['Cliente','Interesse','Imóvel','Orçamento','Corretor','Status','Data','Ações'].map(h => <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5">{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">{l.cliente?.nome}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{l.interesse}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-[140px] truncate">{l.imovel?.titulo || '—'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">{l.orcamento ? fmtP(l.orcamento) : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{l.corretor?.nome || '—'}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[l.status] || ''}`}>{l.status}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{l.data_contato ? new Date(l.data_contato + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 items-center">
                        <select className="border border-gray-200 rounded-lg px-1.5 py-1 text-[10px] outline-none bg-white" value={l.status} onChange={e => updStatus(l.id, e.target.value)}>
                          <option>Lead</option><option>Negociando</option><option>Fechado</option><option>Perdido</option>
                        </select>
                        <button onClick={() => deletar(l.id)} className="bg-red-50 text-red-600 text-[10px] px-1.5 py-1 rounded-lg hover:bg-red-100 border border-red-100">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-sm font-bold text-gray-900">🎯 Registrar Lead</h2>
              <button onClick={() => setModalOpen(false)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-sm">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Cliente *</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.cliente_id} onChange={inp('cliente_id')}><option value="">Selecione</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Interesse</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.interesse} onChange={inp('interesse')}><option>Compra</option><option>Aluguel</option><option>Venda</option></select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Imóvel de Interesse</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.imovel_id} onChange={inp('imovel_id')}><option value="">— Nenhum específico —</option>{imoveis.map(i => <option key={i.id} value={i.id}>{i.titulo.substring(0,40)}</option>)}</select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Corretor</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.corretor_id} onChange={inp('corretor_id')}><option value="">— Sem corretor —</option>{corretores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Status</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.status} onChange={inp('status')}><option>Lead</option><option>Negociando</option><option>Fechado</option><option>Perdido</option></select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Orçamento (R$)</label><input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="500000" value={form.orcamento} onChange={inp('orcamento')} /></div>
              <div className="col-span-2"><label className="text-[11px] font-bold text-gray-700 block mb-1">Observações</label><textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 resize-y min-h-[65px]" placeholder="Detalhes do contato..." value={form.observacoes} onChange={inp('observacoes')} /></div>
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
