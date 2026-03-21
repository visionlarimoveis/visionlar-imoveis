'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, type Imovel, type Cidade, type Bairro, type Corretor, type TipoImovel } from '@/lib/supabase'

function fmtPreco(p: number) {
  if (p >= 1e6) return `R$ ${(p / 1e6).toFixed(1).replace('.', ',')}M`
  if (p >= 1e3) return `R$ ${(p / 1e3).toFixed(0)}k`
  return `R$ ${p.toLocaleString('pt-BR')}`
}

const FOTOS = [
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
]

const emptyForm = {
  titulo: '', tipo: '', finalidade: 'Venda' as 'Venda'|'Aluguel',
  preco: '', cidade_id: '', bairro_id: '', endereco: '',
  area: '', dorms: '', suites: '', banhs: '', vagas: '',
  condominio: '', descricao: '', foto_url: '',
  status: 'Ativo' as 'Ativo'|'Inativo', destaque: false, corretor_id: '',
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<any[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [bairros, setBairros] = useState<Bairro[]>([])
  const [tipos, setTipos] = useState<TipoImovel[]>([])
  const [corretores, setCorretores] = useState<Corretor[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [verOpen, setVerOpen] = useState<any>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [filtFin, setFiltFin] = useState('')
  const [filtTipo, setFiltTipo] = useState('')
  const [filtCid, setFiltCid] = useState('')
  const [filtSt, setFiltSt] = useState('')
  const [view, setView] = useState<'grid'|'lista'>('grid')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800) }

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('imoveis')
      .select('*, cidade:cidades(id,nome,estado), bairro:bairros(id,nome), corretor:corretores(id,nome)')
      .order('created_at', { ascending: false })
    setImoveis(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    supabase.from('cidades').select('*').order('nome').then(r => setCidades(r.data || []))
    supabase.from('tipos_imovel').select('*').order('nome').then(r => setTipos(r.data || []))
    supabase.from('corretores').select('*').order('nome').then(r => setCorretores(r.data || []))
  }, [load])

  useEffect(() => {
    if (form.cidade_id) {
      supabase.from('bairros').select('*').eq('cidade_id', form.cidade_id).order('nome')
        .then(r => setBairros(r.data || []))
    } else { setBairros([]) }
  }, [form.cidade_id])

  const filtered = imoveis.filter(i => {
    const s = search.toLowerCase()
    if (s && !i.titulo?.toLowerCase().includes(s) && !i.cidade?.nome?.toLowerCase().includes(s)) return false
    if (filtFin && i.finalidade !== filtFin) return false
    if (filtTipo && i.tipo !== filtTipo) return false
    if (filtCid && i.cidade_id !== filtCid) return false
    if (filtSt && i.status !== filtSt) return false
    return true
  })

  async function salvar() {
    if (!form.titulo || !form.preco || !form.cidade_id) { showToast('⚠️ Preencha título, preço e cidade!'); return }
    setSaving(true)
    const payload = {
      titulo: form.titulo, tipo: form.tipo || tipos[0]?.nome,
      finalidade: form.finalidade, preco: parseFloat(form.preco),
      cidade_id: form.cidade_id, bairro_id: form.bairro_id || null,
      endereco: form.endereco || null, area: form.area ? parseFloat(form.area) : null,
      dorms: form.dorms ? parseInt(form.dorms) : 0, suites: form.suites ? parseInt(form.suites) : 0,
      banhs: form.banhs ? parseInt(form.banhs) : 0, vagas: form.vagas ? parseInt(form.vagas) : 0,
      condominio: form.condominio ? parseFloat(form.condominio) : 0,
      descricao: form.descricao || null, foto_url: form.foto_url || null,
      status: form.status, destaque: form.destaque,
      corretor_id: form.corretor_id || null,
    }
    const { error } = await supabase.from('imoveis').insert(payload)
    if (error) { showToast('❌ Erro: ' + error.message) }
    else { showToast('🏠 Imóvel cadastrado!'); setModalOpen(false); setForm(emptyForm); load() }
    setSaving(false)
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este imóvel?')) return
    await supabase.from('imoveis').delete().eq('id', id)
    showToast('🗑 Imóvel excluído'); load()
  }

  const inp = (k: keyof typeof emptyForm) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <>
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div><div className="text-[15px] font-bold text-gray-900">Imóveis</div><div className="text-[11px] text-gray-400 mt-0.5">Carteira completa de imóveis</div></div>
        <div className="flex gap-2">
          <select className="text-xs border border-gray-200 px-2 py-1.5 rounded-lg bg-white outline-none" value={view} onChange={e => setView(e.target.value as any)}>
            <option value="grid">Grid</option><option value="lista">Lista</option>
          </select>
          <button onClick={() => { setForm(emptyForm); setModalOpen(true) }} className="btn-gold text-xs px-4 py-1.5 rounded-lg">+ Novo Imóvel</button>
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex gap-2 flex-wrap items-center">
        <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-amber-500 flex-1 min-w-[180px]" placeholder="🔍 Título, bairro, cidade..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtFin} onChange={e => setFiltFin(e.target.value)}>
          <option value="">Finalidade</option><option>Venda</option><option>Aluguel</option>
        </select>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtTipo} onChange={e => setFiltTipo(e.target.value)}>
          <option value="">Tipo</option>{tipos.map(t => <option key={t.id}>{t.nome}</option>)}
        </select>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtCid} onChange={e => setFiltCid(e.target.value)}>
          <option value="">Cidade</option>{cidades.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtSt} onChange={e => setFiltSt(e.target.value)}>
          <option value="">Status</option><option>Ativo</option><option>Inativo</option>
        </select>
      </div>

      <main className="p-5">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3 opacity-40">🏠</div><p className="text-sm">Nenhum imóvel encontrado</p></div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(i => (
              <div key={i.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img src={i.foto_url || FOTOS[i.id?.charCodeAt(0) % FOTOS.length] || FOTOS[0]} alt={i.titulo} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onError={e => { (e.target as any).src = FOTOS[0] }} />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i.finalidade === 'Venda' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>{i.finalidade}</span>
                  </div>
                  {i.destaque && <div className="absolute top-2 right-2 bg-[#B8892A] text-[#0D2137] text-[9px] font-black px-2 py-0.5 rounded-full">★ DESTAQUE</div>}
                </div>
                <div className="p-3">
                  <div className="font-playfair text-xl font-bold text-gray-900">{fmtPreco(i.preco)}{i.finalidade === 'Aluguel' && <small className="text-xs text-gray-400 font-normal">/mês</small>}</div>
                  <div className="text-xs font-semibold text-gray-800 mt-1 truncate">{i.titulo}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">📍 {i.bairro?.nome ? `${i.bairro.nome}, ` : ''}{i.cidade?.nome}</div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 flex-wrap">
                    {i.area ? <span className="text-[10px] text-gray-500">📐 <b>{i.area}</b>m²</span> : null}
                    {i.dorms ? <span className="text-[10px] text-gray-500">🛏 <b>{i.dorms}</b></span> : null}
                    {i.banhs ? <span className="text-[10px] text-gray-500">🚿 <b>{i.banhs}</b></span> : null}
                    {i.vagas ? <span className="text-[10px] text-gray-500">🚗 <b>{i.vagas}</b></span> : null}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setVerOpen(i)} className="flex-1 btn-gold text-[10px] py-1.5 rounded-lg text-center">Ver detalhes</button>
                    <button onClick={() => deletar(i.id)} className="bg-red-50 text-red-600 border border-red-100 text-[10px] px-2 py-1.5 rounded-lg hover:bg-red-100 transition-colors">🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-gray-50">{['Imóvel','Tipo','Finalidade','Preço','Local','Status','Ações'].map(h => <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5">{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3"><div className="text-xs font-semibold text-gray-900 max-w-[200px] truncate">{i.titulo}</div></td>
                    <td className="px-4 py-3 text-xs text-gray-600">{i.tipo}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i.finalidade === 'Venda' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>{i.finalidade}</span></td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">{fmtPreco(i.preco)}{i.finalidade === 'Aluguel' ? '/mês' : ''}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{i.cidade?.nome}{i.bairro?.nome ? ` / ${i.bairro.nome}` : ''}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{i.status}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-1.5"><button onClick={() => setVerOpen(i)} className="bg-gray-100 text-gray-700 text-[10px] px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors">👁 Ver</button><button onClick={() => deletar(i.id)} className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-lg hover:bg-red-100 transition-colors">🗑</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal Novo Imóvel */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-sm font-bold text-gray-900">🏠 Cadastrar Imóvel</h2>
              <button onClick={() => setModalOpen(false)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors text-sm">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[['grid-col-span-2','Título *','titulo','text','Apartamento 3 dorms no Centro'],['','Tipo *','tipo','select-tipo',''],['','Finalidade','finalidade','select-fin',''],['','Preço (R$) *','preco','number','350000'],['','Cidade *','cidade_id','select-cid',''],['','Bairro','bairro_id','select-bai',''],['','Endereço','endereco','text','Rua X, 123'],['','Área (m²)','area','number','90'],['','Dormitórios','dorms','number','3'],['','Suítes','suites','number','1'],['','Banheiros','banhs','number','2'],['','Vagas','vagas','number','1'],['','Condomínio (R$/mês)','condominio','number','0'],['','Corretor','corretor_id','select-cor',''],['','Status','status','select-st',''],['','Destaque','destaque','select-dest','']].map(([cls, label, key, type, ph]) => (
                <div key={key} className={cls || ''}>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">{label}</label>
                  {type === 'select-tipo' ? (
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.tipo} onChange={inp('tipo')}>
                      <option value="">Selecione</option>{tipos.map(t => <option key={t.id}>{t.nome}</option>)}
                    </select>
                  ) : type === 'select-fin' ? (
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.finalidade} onChange={inp('finalidade')}>
                      <option>Venda</option><option>Aluguel</option>
                    </select>
                  ) : type === 'select-cid' ? (
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.cidade_id} onChange={inp('cidade_id')}>
                      <option value="">Selecione</option>{cidades.map(c => <option key={c.id} value={c.id}>{c.nome} - {c.estado}</option>)}
                    </select>
                  ) : type === 'select-bai' ? (
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.bairro_id} onChange={inp('bairro_id')}>
                      <option value="">Selecione</option>{bairros.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                    </select>
                  ) : type === 'select-cor' ? (
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.corretor_id} onChange={inp('corretor_id')}>
                      <option value="">Sem corretor</option>{corretores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  ) : type === 'select-st' ? (
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.status} onChange={inp('status')}>
                      <option>Ativo</option><option>Inativo</option>
                    </select>
                  ) : type === 'select-dest' ? (
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.destaque ? '1' : '0'} onChange={e => setForm(f => ({ ...f, destaque: e.target.value === '1' }))}>
                      <option value="0">Não</option><option value="1">Sim — aparecer em destaque</option>
                    </select>
                  ) : (
                    <input type={type} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder={ph} value={(form as any)[key]} onChange={inp(key as any)} />
                  )}
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Descrição</label>
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 resize-y min-h-[70px]" placeholder="Descreva o imóvel..." value={form.descricao} onChange={inp('descricao')} />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-gray-700 block mb-1">URL da Foto Principal</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="https://..." value={form.foto_url} onChange={inp('foto_url')} />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex gap-2 justify-end">
              <button onClick={() => setModalOpen(false)} className="text-xs border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={salvar} disabled={saving} className="btn-gold text-xs px-5 py-2 rounded-lg disabled:opacity-60">{saving ? 'Salvando...' : '💾 Salvar Imóvel'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Imóvel */}
      {verOpen && (
        <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setVerOpen(null) }}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <img src={verOpen.foto_url || FOTOS[0]} alt={verOpen.titulo} className="w-full h-56 object-cover rounded-t-2xl" onError={e => { (e.target as any).src = FOTOS[0] }} />
            <div className="p-5">
              <div className="flex gap-2 mb-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${verOpen.finalidade === 'Venda' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>{verOpen.finalidade}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${verOpen.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{verOpen.status}</span>
                {verOpen.destaque && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">★ DESTAQUE</span>}
              </div>
              <div className="font-playfair text-3xl font-bold text-[#0D2137]">{fmtPreco(verOpen.preco)}{verOpen.finalidade === 'Aluguel' && <span className="text-sm text-gray-400 font-normal">/mês</span>}</div>
              {verOpen.condominio > 0 && <div className="text-xs text-gray-400 mt-0.5">Condomínio: R$ {verOpen.condominio?.toLocaleString('pt-BR')}/mês</div>}
              <div className="text-xs text-gray-400 mt-1.5 mb-3">📍 {verOpen.bairro?.nome ? `${verOpen.bairro.nome}, ` : ''}{verOpen.cidade?.nome} - {verOpen.cidade?.estado}</div>
              <div className="flex gap-4 py-3 border-t border-b border-gray-100 mb-3 flex-wrap">
                {verOpen.area ? <div className="text-center"><div className="text-sm font-bold">{verOpen.area}m²</div><div className="text-[10px] text-gray-400">Área</div></div> : null}
                {verOpen.dorms ? <div className="text-center"><div className="text-sm font-bold">{verOpen.dorms}</div><div className="text-[10px] text-gray-400">Dorms</div></div> : null}
                {verOpen.suites ? <div className="text-center"><div className="text-sm font-bold">{verOpen.suites}</div><div className="text-[10px] text-gray-400">Suítes</div></div> : null}
                {verOpen.banhs ? <div className="text-center"><div className="text-sm font-bold">{verOpen.banhs}</div><div className="text-[10px] text-gray-400">Banhs</div></div> : null}
                {verOpen.vagas ? <div className="text-center"><div className="text-sm font-bold">{verOpen.vagas}</div><div className="text-[10px] text-gray-400">Vagas</div></div> : null}
              </div>
              {verOpen.descricao && <p className="text-xs text-gray-500 leading-relaxed mb-3">{verOpen.descricao}</p>}
              {verOpen.corretor && <div className="text-xs text-gray-400 mb-4">🤝 Corretor: <strong className="text-gray-900">{verOpen.corretor.nome}</strong>{verOpen.corretor.creci ? ` · CRECI ${verOpen.corretor.creci}` : ''}</div>}
              <div className="flex gap-2">
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'}?text=${encodeURIComponent(`Tenho interesse no imóvel: ${verOpen.titulo}`)}`} target="_blank" rel="noopener" className="flex-1 bg-green-500 text-white text-xs font-bold py-2.5 rounded-xl text-center hover:bg-green-600 transition-colors">📲 WhatsApp</a>
                <button onClick={() => setVerOpen(null)} className="border border-gray-200 text-xs px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="fixed bottom-5 right-5 bg-[#0D2137] text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold z-[100] animate-bounce">{toast}</div>}
    </>
  )
}
