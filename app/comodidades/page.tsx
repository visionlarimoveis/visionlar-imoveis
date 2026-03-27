'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export default function ComodidadesPage() {
  const [lista, setLista] = useState<any[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState('✅')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2800) }

  const load = useCallback(async () => {
    const { data } = await supabase.from('comodidades_opcoes').select('*').order('nome')
    setLista(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  function abrir(c: any) { setEditId(c.id); setNome(c.nome); setIcone(c.icone || '✅') }
  function cancelar() { setEditId(null); setNome(''); setIcone('✅') }

  async function salvar() {
    if (!nome.trim()) { showToast('⚠️ Digite o nome!'); return }
    setLoading(true)
    let error
    if (editId) {
      ({ error } = await supabase.from('comodidades_opcoes').update({ nome: nome.trim(), icone: icone || '✅' }).eq('id', editId))
    } else {
      ({ error } = await supabase.from('comodidades_opcoes').insert({ nome: nome.trim(), icone: icone || '✅' }))
    }
    setLoading(false)
    if (error) showToast('❌ ' + error.message)
    else { showToast(editId ? '✅ Atualizado!' : '✅ Comodidade adicionada!'); cancelar(); load() }
  }

  async function deletar(id: string, nome: string) {
    if (!confirm(`Remover "${nome}"?`)) return
    await supabase.from('comodidades_opcoes').delete().eq('id', id)
    showToast('🗑 Removido')
    load()
  }

  const icones = ['✅','🏊','🍖','🛗','💪','🎉','🛝','🔐','❄️','🔥','🌿','🏡','🚗','🧺','🍳','🚿','👗','💼','📦','☀️','🚨','📹','📡','🐾','♿','🏋️','🎮','📚','🎵','🌊','⚡','🌳','🏕️','🎯','🔑']

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center sticky top-0 z-40 shadow-sm">
        <div>
          <div className="text-[15px] font-bold text-gray-900">Comodidades</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Opções disponíveis no cadastro de imóveis</div>
        </div>
      </header>

      <main className="p-5 grid grid-cols-[340px,1fr] gap-4">

        {/* Formulário */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden self-start">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">{editId ? '✏️ Editar Comodidade' : '➕ Nova Comodidade'}</h3>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Nome <span className="text-red-500">*</span></label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500"
                placeholder="Ex: Piscina aquecida"
                value={nome}
                onChange={e => setNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && salvar()}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-2">Ícone</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {icones.map(i => (
                  <button key={i} onClick={() => setIcone(i)}
                    className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${icone === i ? 'bg-amber-100 ring-2 ring-amber-400 scale-110' : 'hover:bg-gray-100'}`}>
                    {i}
                  </button>
                ))}
              </div>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500"
                placeholder="Ou cole qualquer emoji aqui"
                maxLength={4}
                value={icone}
                onChange={e => setIcone(e.target.value)}
              />
            </div>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            {editId && (
              <button onClick={cancelar} className="text-xs border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
            )}
            <button onClick={salvar} disabled={loading}
              className="btn-gold flex-1 text-xs py-2 rounded-lg disabled:opacity-60">
              {loading ? 'Salvando...' : editId ? '💾 Salvar Alterações' : '+ Adicionar'}
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Comodidades cadastradas</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{lista.length} opção{lista.length !== 1 ? 'ões' : ''}</p>
            </div>
          </div>
          {lista.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Nenhuma comodidade cadastrada</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
              {lista.map((c, idx) => (
                <div key={c.id}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? '' : ''} border-b border-gray-100 last:border-0`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl w-7 text-center">{c.icone}</span>
                    <span className="text-sm font-medium text-gray-800">{c.nome}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => abrir(c)}
                      className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-amber-600 transition-colors"
                      title="Editar">
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => deletar(c.id, c.nome)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 transition-colors"
                      title="Remover">
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-5 right-5 bg-[#0D2137] text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold z-[100]">
          {toast}
        </div>
      )}
    </>
  )
}
