'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const FOTO_DEFAULT = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80'
const BUCKET = 'imoveis-fotos'

const emptyForm = {
  codigo:'', titulo:'', tipo:'', finalidade:'Venda' as any,
  preco:'', cidade_id:'', bairro_id:'',
  rua:'', numero:'', complemento:'', cep:'',
  area:'', dorms:'', suites:'', banhs:'', vagas:'',
  condominio:'', descricao:'', foto_url:'', fotos:[] as string[],
  status:'Ativo' as any, destaque:false, corretor_id:'',
  latitude:'', longitude:'',
}

function fmtP(p:number,f:string){
  const v=p>=1e6?`R$ ${(p/1e6).toFixed(1).replace('.',',')}M`:p>=1e3?`R$ ${(p/1e3).toFixed(0)}k`:`R$ ${p.toLocaleString('pt-BR')}`
  return f==='Aluguel'?`${v}/mês`:v
}

// ── Componente de upload de fotos ─────────────────────────────
function FotoUploader({ fotos, onFotosChange, fotoUrl, onFotoUrlChange }: {
  fotos: string[]
  onFotosChange: (fotos: string[]) => void
  fotoUrl: string
  onFotoUrlChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFotos(files: FileList) {
    setUploading(true)
    const novasUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress(`Enviando ${i+1} de ${files.length}...`)

      // Gera nome único
      const ext = file.name.split('.').pop()
      const nomeArquivo = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(nomeArquivo, file, { cacheControl: '3600', upsert: false })

      if (error) {
        console.error('Erro upload:', error)
        continue
      }

      // Pega URL pública
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(nomeArquivo)

      novasUrls.push(urlData.publicUrl)
    }

    const todasFotos = [...fotos, ...novasUrls]
    onFotosChange(todasFotos)

    // Primeira foto vira foto principal
    if (!fotoUrl && novasUrls.length > 0) {
      onFotoUrlChange(novasUrls[0])
    }

    setUploading(false)
    setUploadProgress('')
  }

  async function removerFoto(url: string) {
    // Remove do storage se for do Supabase
    if (url.includes(BUCKET)) {
      const partes = url.split('/')
      const nomeArquivo = partes[partes.length - 1]
      await supabase.storage.from(BUCKET).remove([nomeArquivo])
    }
    const novas = fotos.filter(f => f !== url)
    onFotosChange(novas)
    // Se era a foto principal, atualiza
    if (fotoUrl === url) {
      onFotoUrlChange(novas[0] || '')
    }
  }

  function definirPrincipal(url: string) {
    onFotoUrlChange(url)
  }

  function moverFoto(idx: number, dir: -1 | 1) {
    const novas = [...fotos]
    const novo = idx + dir
    if (novo < 0 || novo >= novas.length) return
    ;[novas[idx], novas[novo]] = [novas[novo], novas[idx]]
    onFotosChange(novas)
  }

  return (
    <div className="col-span-2">
      <label className="text-[11px] font-bold text-gray-700 block mb-2">
        📸 Fotos do Imóvel
        <span className="text-gray-400 font-normal ml-1">({fotos.length} foto{fotos.length !== 1 ? 's' : ''})</span>
      </label>

      {/* Área de upload */}
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-amber-400 transition-colors cursor-pointer mb-3 bg-gray-50"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-amber-400', 'bg-amber-50') }}
        onDragLeave={e => { e.currentTarget.classList.remove('border-amber-400', 'bg-amber-50') }}
        onDrop={e => {
          e.preventDefault()
          e.currentTarget.classList.remove('border-amber-400', 'bg-amber-50')
          if (e.dataTransfer.files.length > 0) uploadFotos(e.dataTransfer.files)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files?.length) uploadFotos(e.target.files) }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"/>
            <span className="text-xs text-amber-600 font-medium">{uploadProgress}</span>
          </div>
        ) : (
          <div>
            <div className="text-2xl mb-1">📤</div>
            <div className="text-xs font-semibold text-gray-600">Clique ou arraste fotos aqui</div>
            <div className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP • Múltiplas fotos permitidas</div>
          </div>
        )}
      </div>

      {/* Grid de fotos */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {fotos.map((url, i) => (
            <div key={url} className="relative group rounded-xl overflow-hidden border-2 transition-all"
              style={{ borderColor: fotoUrl === url ? '#B8892A' : 'transparent' }}>
              <img src={url} alt={`Foto ${i+1}`} className="w-full h-20 object-cover"/>
              {/* Badge principal */}
              {fotoUrl === url && (
                <div className="absolute top-1 left-1 bg-[#B8892A] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  ★ Principal
                </div>
              )}
              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {fotoUrl !== url && (
                  <button onClick={() => definirPrincipal(url)}
                    className="bg-amber-500 text-white text-[9px] font-bold px-2 py-1 rounded-lg hover:bg-amber-600"
                    title="Definir como principal">⭐</button>
                )}
                <button onClick={() => moverFoto(i, -1)} disabled={i === 0}
                  className="bg-white/20 text-white text-[10px] px-1.5 py-1 rounded-lg hover:bg-white/40 disabled:opacity-30">◀</button>
                <button onClick={() => moverFoto(i, 1)} disabled={i === fotos.length - 1}
                  className="bg-white/20 text-white text-[10px] px-1.5 py-1 rounded-lg hover:bg-white/40 disabled:opacity-30">▶</button>
                <button onClick={() => removerFoto(url)}
                  className="bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-lg hover:bg-red-600"
                  title="Remover">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* URL manual (fallback) */}
      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
          Ou cole URL da foto principal
        </label>
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500"
          placeholder="https://..."
          value={fotoUrl}
          onChange={e => onFotoUrlChange(e.target.value)}
        />
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<any[]>([])
  const [cidades, setCidades] = useState<any[]>([])
  const [bairros, setBairros] = useState<any[]>([])
  const [tipos, setTipos] = useState<any[]>([])
  const [corretores, setCorretores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
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

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2800) }
  const inp = (k: keyof typeof emptyForm) => (e: any) => setForm(f => ({...f, [k]: e.target.value}))

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('imoveis')
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
    } else setBairros([])
  }, [form.cidade_id])

  const filtered = imoveis.filter(i => {
    const s = search.toLowerCase()
    if (s && !i.titulo?.toLowerCase().includes(s) && !i.cidade?.nome?.toLowerCase().includes(s) && !i.codigo?.toLowerCase().includes(s)) return false
    if (filtFin && i.finalidade !== filtFin) return false
    if (filtTipo && i.tipo !== filtTipo) return false
    if (filtCid && i.cidade_id !== filtCid) return false
    if (filtSt && i.status !== filtSt) return false
    return true
  })

  function abrirNovo() { setEditId(null); setForm(emptyForm); setModalOpen(true) }

  function abrirEditar(im: any) {
    setEditId(im.id)
    setForm({
      codigo: im.codigo||'', titulo: im.titulo||'', tipo: im.tipo||'', finalidade: im.finalidade||'Venda',
      preco: String(im.preco||''), cidade_id: im.cidade_id||'', bairro_id: im.bairro_id||'',
      rua: im.rua||'', numero: im.numero||'', complemento: im.complemento||'', cep: im.cep||'',
      area: String(im.area||''), dorms: String(im.dorms||''),
      suites: String(im.suites||''), banhs: String(im.banhs||''), vagas: String(im.vagas||''),
      condominio: String(im.condominio||''), descricao: im.descricao||'',
      foto_url: im.foto_url||'', fotos: im.fotos||[],
      latitude: String(im.latitude||''), longitude: String(im.longitude||''),
      status: im.status||'Ativo', destaque: im.destaque||false, corretor_id: im.corretor_id||'',
    })
    setModalOpen(true)
  }

  async function salvar() {
    const titulo = form.titulo.trim()
    const preco = parseFloat(form.preco)
    const cidade_id = form.cidade_id
    if (!titulo || !preco || !cidade_id) { showToast('⚠️ Preencha título, preço e cidade!'); return }
    setSaving(true)

    // Garante que foto_url é a primeira da galeria se não definida
    const fotoFinal = form.foto_url || form.fotos[0] || null

    // Monta endereço completo a partir dos campos
    const enderecoCompleto = [form.rua, form.numero, form.complemento].filter(Boolean).join(', ')
    const payload: any = {
      titulo, preco, cidade_id, tipo: form.tipo || tipos[0]?.nome,
      finalidade: form.finalidade, bairro_id: form.bairro_id||null,
      rua: form.rua||null, numero: form.numero||null,
      complemento: form.complemento||null, cep: form.cep||null,
      endereco: enderecoCompleto || null, area: form.area ? parseFloat(form.area) : null,
      dorms: form.dorms ? parseInt(form.dorms) : 0, suites: form.suites ? parseInt(form.suites) : 0,
      banhs: form.banhs ? parseInt(form.banhs) : 0, vagas: form.vagas ? parseInt(form.vagas) : 0,
      condominio: form.condominio ? parseFloat(form.condominio) : 0,
      descricao: form.descricao||null, foto_url: fotoFinal,
      fotos: form.fotos, status: form.status, destaque: form.destaque,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      corretor_id: form.corretor_id||null,
    }
    if (form.codigo.trim()) payload.codigo = form.codigo.trim().toUpperCase()

    let error
    if (editId) { ({ error } = await supabase.from('imoveis').update(payload).eq('id', editId)) }
    else { ({ error } = await supabase.from('imoveis').insert(payload)) }

    if (error) showToast('❌ Erro: ' + error.message)
    else { showToast(editId ? '✅ Imóvel atualizado!' : '🏠 Imóvel cadastrado!'); setModalOpen(false); load() }
    setSaving(false)
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este imóvel?')) return
    await supabase.from('imoveis').delete().eq('id', id)
    showToast('🗑 Excluído'); load()
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div><div className="text-[15px] font-bold text-gray-900">Imóveis</div><div className="text-[11px] text-gray-400 mt-0.5">Carteira completa</div></div>
        <div className="flex gap-2">
          <select className="text-xs border border-gray-200 px-2 py-1.5 rounded-lg bg-white outline-none" value={view} onChange={e => setView(e.target.value as any)}>
            <option value="grid">Grid</option><option value="lista">Lista</option>
          </select>
          <button onClick={abrirNovo} className="btn-gold text-xs px-4 py-1.5 rounded-lg">+ Novo Imóvel</button>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 px-5 py-3 flex gap-2 flex-wrap">
        <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-amber-500 flex-1 min-w-[180px]" placeholder="🔍 Código, título, cidade..." value={search} onChange={e => setSearch(e.target.value)}/>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtFin} onChange={e => setFiltFin(e.target.value)}><option value="">Finalidade</option><option>Venda</option><option>Aluguel</option></select>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtTipo} onChange={e => setFiltTipo(e.target.value)}><option value="">Tipo</option>{tipos.map(t => <option key={t.id}>{t.nome}</option>)}</select>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtCid} onChange={e => setFiltCid(e.target.value)}><option value="">Cidade</option>{cidades.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtSt} onChange={e => setFiltSt(e.target.value)}><option value="">Status</option><option>Ativo</option><option>Inativo</option></select>
      </div>

      <main className="p-5">
        {loading ? <div className="text-center py-16 text-gray-400 text-sm">Carregando...</div> :
        filtered.length === 0 ? <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3 opacity-40">🏠</div><p className="text-sm">Nenhum imóvel</p></div> :
        view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((i, idx) => {
              const fotoCapa = i.foto_url || (i.fotos?.length ? i.fotos[0] : FOTO_DEFAULT)
              const totalFotos = i.fotos?.length || (i.foto_url ? 1 : 0)
              return (
                <div key={i.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                  <div className="relative h-44 overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setVerOpen(i)}>
                    <img src={fotoCapa} alt={i.titulo} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onError={e => {(e.target as any).src = FOTO_DEFAULT}}/>
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${i.finalidade==='Venda'?'bg-indigo-100 text-indigo-700':'bg-emerald-100 text-emerald-700'}`}>{i.finalidade}</span>
                    </div>
                    {i.codigo && <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{i.codigo}</div>}
                    {totalFotos > 1 && <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">📸 {totalFotos}</div>}
                    {i.destaque && <div className="absolute top-2 right-2 bg-[#B8892A] text-white text-[9px] font-black px-2 py-0.5 rounded-full">★</div>}
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-lg text-gray-900" style={{fontFamily:'Playfair Display,serif'}}>{fmtP(i.preco, i.finalidade)}</div>
                    <div className="text-xs font-semibold text-gray-700 truncate mt-0.5">{i.titulo}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">📍 {i.bairro?.nome ? `${i.bairro.nome}, ` : ''}{i.cidade?.nome}</div>
                    <div className="flex gap-1.5 mt-3">
                      <button onClick={() => setVerOpen(i)} className="flex-1 bg-gray-100 text-gray-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-gray-200">👁 Ver</button>
                      <button onClick={() => abrirEditar(i)} className="flex-1 bg-amber-50 text-amber-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-amber-100 border border-amber-200">✏️ Editar</button>
                      <button onClick={() => deletar(i.id)} className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1.5 rounded-lg hover:bg-red-100 border border-red-100">🗑</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-gray-50">{['Código','Imóvel','Fotos','Tipo','Finalidade','Preço','Local','Status','Ações'].map(h => <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5">{h}</th>)}</tr></thead>
              <tbody>{filtered.map(i => (
                <tr key={i.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3"><span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{i.codigo||'—'}</span></td>
                  <td className="px-4 py-3 text-xs font-semibold text-gray-900 max-w-[160px] truncate">{i.titulo}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">📸 {(i.fotos?.length || 0) + (i.foto_url ? 1 : 0)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{i.tipo}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i.finalidade==='Venda'?'bg-indigo-50 text-indigo-700':'bg-emerald-50 text-emerald-700'}`}>{i.finalidade}</span></td>
                  <td className="px-4 py-3 text-xs font-bold">{fmtP(i.preco, i.finalidade)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{i.cidade?.nome}{i.bairro?.nome ? ` / ${i.bairro.nome}` : ''}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i.status==='Ativo'?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-500'}`}>{i.status}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-1.5">
                    <button onClick={() => abrirEditar(i)} className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-lg hover:bg-amber-100 border border-amber-200 font-bold">✏️</button>
                    <button onClick={() => deletar(i.id)} className="bg-red-50 text-red-600 text-[10px] px-2.5 py-1 rounded-lg hover:bg-red-100 border border-red-100 font-bold">🗑</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL CADASTRO/EDIÇÃO */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-sm font-bold text-gray-900">{editId ? '✏️ Editar Imóvel' : '🏠 Novo Imóvel'}</h2>
              <button onClick={() => setModalOpen(false)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-sm">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Código <span className="text-gray-400 font-normal">(aparece no WhatsApp)</span></label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 font-mono uppercase tracking-wider" placeholder="Ex: AP-001" value={form.codigo} onChange={inp('codigo')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Finalidade<span className="text-red-500">*</span></label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.finalidade} onChange={inp('finalidade')}><option>Venda</option><option>Aluguel</option></select></div>
              <div className="col-span-2"><label className="text-[11px] font-bold text-gray-700 block mb-1">Título<span className="text-red-500">*</span></label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="Ex: Apartamento 3 dorms no Centro" value={form.titulo} onChange={inp('titulo')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Tipo<span className="text-red-500">*</span></label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.tipo} onChange={inp('tipo')}><option value="">Selecione</option>{tipos.map(t => <option key={t.id}>{t.nome}</option>)}</select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Preço (R$)<span className="text-red-500">*</span></label><input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="350000" value={form.preco} onChange={inp('preco')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Cidade<span className="text-red-500">*</span></label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.cidade_id} onChange={inp('cidade_id')}><option value="">Selecione</option>{cidades.map(c => <option key={c.id} value={c.id}>{c.nome} - {c.estado}</option>)}</select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Bairro</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.bairro_id} onChange={inp('bairro_id')}><option value="">Selecione</option>{bairros.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}</select></div>
              {/* Coordenadas GPS */}
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-gray-700 block mb-2">
                  📍 Coordenadas GPS
                  <a href="https://maps.google.com" target="_blank" rel="noopener"
                    className="ml-2 text-[10px] text-blue-500 font-normal hover:underline">
                    → Pegar no Google Maps
                  </a>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 font-mono" placeholder="Latitude  Ex: -29.6896" value={form.latitude} onChange={inp('latitude')}/>
                    <div className="text-[9px] text-gray-400 mt-0.5">Latitude (ex: -29.6896)</div>
                  </div>
                  <div className="flex-1">
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 font-mono" placeholder="Longitude  Ex: -52.7014" value={form.longitude} onChange={inp('longitude')}/>
                    <div className="text-[9px] text-gray-400 mt-0.5">Longitude (ex: -52.7014)</div>
                  </div>
                </div>
                {/* Link automático para Google Maps com o endereço */}
                {(form.rua || form.numero) && (
                  <a
                    href={`https://maps.google.com/maps?q=${encodeURIComponent([form.rua, form.numero, form.complemento, form.cep].filter(Boolean).join(', '))}`}
                    target="_blank" rel="noopener"
                    className="flex items-center gap-2 text-[10px] text-blue-600 font-semibold mt-2 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    🗺️ Abrir endereço no Google Maps → clique direito → copie as coordenadas
                  </a>
                )}
                <div className="text-[10px] text-gray-400 mt-1.5 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  💡 <strong>Passo a passo:</strong> Preencha o endereço acima → clique no link → clique direito no pin → copie Latitude e Longitude
                </div>
              </div>

              {/* Endereço completo */}
              <div className="col-span-2 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <label className="text-[11px] font-bold text-blue-700 block mb-3">📍 Endereço do Imóvel</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Rua / Avenida</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" placeholder="Ex: Rua das Flores" value={form.rua} onChange={inp('rua')}/>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Número</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" placeholder="Ex: 123" value={form.numero} onChange={inp('numero')}/>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Complemento</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" placeholder="Apto 42, Bl B..." value={form.complemento} onChange={inp('complemento')}/>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">CEP</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white font-mono" placeholder="00000-000" maxLength={9} value={form.cep} onChange={e => {
                      // Auto-formata CEP
                      const v = e.target.value.replace(/\D/g,'').slice(0,8)
                      setForm(f => ({...f, cep: v.length > 5 ? v.slice(0,5)+'-'+v.slice(5) : v}))
                    }}/>
                  </div>
                  <div className="col-span-3 text-[10px] text-blue-600 mt-1">
                    💡 Endereço completo monta automaticamente para o Google Maps
                  </div>
                </div>
              </div>

              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Área (m²)</label><input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.area} onChange={inp('area')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Dormitórios</label><input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.dorms} onChange={inp('dorms')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Suítes</label><input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.suites} onChange={inp('suites')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Banheiros</label><input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.banhs} onChange={inp('banhs')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Vagas</label><input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.vagas} onChange={inp('vagas')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Condomínio (R$/mês)</label><input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.condominio} onChange={inp('condominio')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Corretor</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.corretor_id} onChange={inp('corretor_id')}><option value="">Sem corretor</option>{corretores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Status</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.status} onChange={inp('status')}><option>Ativo</option><option>Inativo</option><option>Vendido</option><option>Alugado</option></select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Destaque?</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.destaque?'1':'0'} onChange={e => setForm(f => ({...f, destaque: e.target.value==='1'}))}><option value="0">Não</option><option value="1">Sim</option></select></div>
              <div className="col-span-2"><label className="text-[11px] font-bold text-gray-700 block mb-1">Descrição</label><textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 resize-y min-h-[70px]" value={form.descricao} onChange={inp('descricao')}/></div>

              {/* Upload de fotos */}
              <FotoUploader
                fotos={form.fotos}
                onFotosChange={fotos => setForm(f => ({...f, fotos}))}
                fotoUrl={form.foto_url}
                onFotoUrlChange={url => setForm(f => ({...f, foto_url: url}))}
              />
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex gap-2 justify-end">
              <button onClick={() => setModalOpen(false)} className="text-xs border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={salvar} disabled={saving} className="btn-gold text-xs px-5 py-2 rounded-lg disabled:opacity-60">{saving ? 'Salvando...' : (editId ? '💾 Salvar Alterações' : '💾 Cadastrar Imóvel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER */}
      {verOpen && (
        <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setVerOpen(null) }}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Galeria mini */}
            {(() => {
              const todasFotos = [verOpen.foto_url, ...(verOpen.fotos||[])].filter(Boolean)
              return todasFotos.length > 0 ? (
                <div>
                  <img src={todasFotos[0]} alt={verOpen.titulo} className="w-full h-52 object-cover rounded-t-2xl"/>
                  {todasFotos.length > 1 && (
                    <div className="flex gap-1 p-2 bg-gray-50 overflow-x-auto">
                      {todasFotos.slice(1).map((f: string, i: number) => (
                        <img key={i} src={f} alt={`Foto ${i+2}`} className="w-16 h-12 object-cover rounded-lg shrink-0"/>
                      ))}
                    </div>
                  )}
                </div>
              ) : <div className="w-full h-52 bg-gray-100 rounded-t-2xl flex items-center justify-center text-4xl">🏠</div>
            })()}
            <div className="p-5">
              {verOpen.codigo && <div className="inline-block bg-[#0D2137] text-white text-[10px] font-bold px-3 py-1 rounded-full mb-3">Código: {verOpen.codigo}</div>}
              <div className="font-bold text-2xl text-[#0D2137] mb-1" style={{fontFamily:'Playfair Display,serif'}}>{fmtP(verOpen.preco, verOpen.finalidade)}</div>
              <div className="text-sm font-semibold text-gray-800">{verOpen.titulo}</div>
              <div className="text-xs text-gray-400 mt-0.5 mb-3">📍 {verOpen.bairro?.nome ? `${verOpen.bairro.nome}, ` : ''}{verOpen.cidade?.nome}</div>
              <div className="flex gap-2">
                <button onClick={() => { setVerOpen(null); abrirEditar(verOpen) }} className="flex-1 bg-amber-50 text-amber-700 text-xs font-bold py-2.5 rounded-xl border border-amber-200 hover:bg-amber-100">✏️ Editar</button>
                <button onClick={() => setVerOpen(null)} className="border border-gray-200 text-xs px-4 py-2.5 rounded-xl hover:bg-gray-50">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-5 right-5 bg-[#0D2137] text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold z-[100]">{toast}</div>}
    </>
  )
}
