'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const BUCKET = 'corretores-fotos'
const empty = { nome:'', creci:'', telefone:'', email:'', status:'Ativo' as any, foto_url:'' }

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2800) }
  const inp = (k: keyof typeof empty) => (e: any) => setForm(f => ({...f, [k]: e.target.value}))

  const load = useCallback(async () => {
    const { data } = await supabase.from('corretores').select('*').order('nome')
    setCorretores(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  function abrirNovo() { setEditId(null); setForm(empty); setModalOpen(true) }
  function abrirEditar(c: any) {
    setEditId(c.id)
    setForm({ nome: c.nome||'', creci: c.creci||'', telefone: c.telefone||'', email: c.email||'', status: c.status||'Ativo', foto_url: c.foto_url||'' })
    setModalOpen(true)
  }

  async function uploadFoto(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const nome = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage.from(BUCKET).upload(nome, file, { upsert: false })
    if (error) { showToast('❌ Erro no upload'); setUploading(false); return }
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(nome)
    setForm(f => ({...f, foto_url: urlData.publicUrl}))
    setUploading(false)
    showToast('📸 Foto enviada!')
  }

  async function salvar() {
    if (!form.nome.trim() || !form.creci.trim()) { showToast('⚠️ Preencha nome e CRECI!'); return }
    setSaving(true)
    const payload = { nome: form.nome, creci: form.creci, telefone: form.telefone||null, email: form.email||null, status: form.status, foto_url: form.foto_url||null }
    let error
    if (editId) { ({ error } = await supabase.from('corretores').update(payload).eq('id', editId)) }
    else { ({ error } = await supabase.from('corretores').insert(payload)) }
    if (error) showToast('❌ ' + error.message)
    else { showToast(editId ? '✅ Atualizado!' : '🤝 Cadastrado!'); setModalOpen(false); load() }
    setSaving(false)
  }

  const ini = (n: string) => n.split(' ').slice(0,2).map((p: string) => p[0]).join('').toUpperCase()

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div><div className="text-[15px] font-bold text-gray-900">Corretores</div><div className="text-[11px] text-gray-400 mt-0.5">Equipe comercial</div></div>
        <button onClick={abrirNovo} className="btn-gold text-xs px-4 py-1.5 rounded-lg">+ Novo Corretor</button>
      </header>

      <main className="p-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {corretores.length === 0
            ? <div className="text-center py-12 text-gray-400"><div className="text-3xl mb-2 opacity-40">🤝</div><p className="text-sm">Nenhum corretor</p></div>
            : (
              <table className="w-full">
                <thead><tr className="bg-gray-50">{['Corretor','CRECI','Telefone','Email','Status','Ações'].map(h => <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5">{h}</th>)}</tr></thead>
                <tbody>
                  {corretores.map(c => (
                    <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Foto ou iniciais */}
                          {c.foto_url
                            ? <img src={c.foto_url} alt={c.nome} className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-[#B8892A]"/>
                            : <div className="w-10 h-10 rounded-full bg-[#0D2137] text-white flex items-center justify-center font-bold text-sm shrink-0">{ini(c.nome)}</div>
                          }
                          <span className="text-xs font-semibold text-gray-900">{c.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{c.creci}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{c.telefone||'—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{c.email||'—'}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status==='Ativo'?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-500'}`}>{c.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => abrirEditar(c)} className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-lg hover:bg-amber-100 border border-amber-200 font-bold">✏️</button>
                          <button onClick={async () => { if (!confirm('Excluir?')) return; await supabase.from('corretores').delete().eq('id', c.id); load(); showToast('🗑 Excluído') }} className="bg-red-50 text-red-600 text-[10px] px-2.5 py-1 rounded-lg hover:bg-red-100 border border-red-100 font-bold">🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </main>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">{editId ? '✏️ Editar Corretor' : '🤝 Novo Corretor'}</h2>
              <button onClick={() => setModalOpen(false)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-sm">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">

              {/* Upload foto */}
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-gray-700 block mb-2">📸 Foto do Corretor</label>
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div className="shrink-0">
                    {form.foto_url
                      ? <img src={form.foto_url} alt="Foto" className="w-20 h-20 rounded-full object-cover border-2 border-[#B8892A]"/>
                      : <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-2xl">👤</div>
                    }
                  </div>
                  <div className="flex-1">
                    <input ref={inputRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { if (e.target.files?.[0]) uploadFoto(e.target.files[0]) }}/>
                    <button onClick={() => inputRef.current?.click()}
                      disabled={uploading}
                      className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 hover:border-amber-400 hover:bg-amber-50 transition-colors flex items-center justify-center gap-2">
                      {uploading
                        ? <><div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"/><span>Enviando...</span></>
                        : <><span className="text-lg">📤</span><span>Clique para enviar foto</span></>
                      }
                    </button>
                    {form.foto_url && (
                      <button onClick={() => setForm(f => ({...f, foto_url: ''}))}
                        className="mt-1.5 text-[10px] text-red-500 hover:text-red-700 font-semibold">
                        🗑 Remover foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-2"><label className="text-[11px] font-bold text-gray-700 block mb-1">Nome Completo<span className="text-red-500">*</span></label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.nome} onChange={inp('nome')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">CRECI<span className="text-red-500">*</span></label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="12345-J" value={form.creci} onChange={inp('creci')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Telefone</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.telefone} onChange={inp('telefone')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Email</label><input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.email} onChange={inp('email')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Status</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.status} onChange={inp('status')}><option>Ativo</option><option>Inativo</option></select></div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex gap-2 justify-end">
              <button onClick={() => setModalOpen(false)} className="text-xs border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={salvar} disabled={saving} className="btn-gold text-xs px-5 py-2 rounded-lg disabled:opacity-60">{saving ? 'Salvando...' : (editId ? '💾 Salvar' : '💾 Cadastrar')}</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-5 right-5 bg-[#0D2137] text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold z-[100]">{toast}</div>}
    </>
  )
}
