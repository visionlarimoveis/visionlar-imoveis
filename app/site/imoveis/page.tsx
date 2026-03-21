'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'
const FOTOS = [
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
  'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600&q=80',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&q=80',
]

function fmtP(p: number, f: string) {
  const v = p >= 1e6 ? `R$ ${(p/1e6).toFixed(1).replace('.',',')}M` : p >= 1e3 ? `R$ ${(p/1e3).toFixed(0)}k` : `R$ ${p.toLocaleString('pt-BR')}`
  return f === 'Aluguel' ? `${v}/mês` : v
}

export default function BuscaImoveisPage() {
  const [imoveis, setImoveis] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [cidades, setCidades] = useState<any[]>([])
  const [bairros, setBairros] = useState<any[]>([])
  const [tipos, setTipos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'lista'|'mapa'>('lista')
  const [selected, setSelected] = useState<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  // Filtros
  const [finalidade, setFinalidade] = useState('')
  const [tipo, setTipo] = useState('')
  const [cidadeId, setCidadeId] = useState('')
  const [bairroId, setBairroId] = useState('')
  const [precoMin, setPrecoMin] = useState('')
  const [precoMax, setPrecoMax] = useState('')
  const [dorms, setDorms] = useState('')
  const [vagas, setVagas] = useState('')
  const [busca, setBusca] = useState('')
  const [areaMin, setAreaMin] = useState('')
  const [filtrosAbertos, setFiltrosAbertos] = useState(true)
  const [ordenar, setOrdenar] = useState('recente')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('imoveis')
      .select('*, cidade:cidades(id,nome,estado), bairro:bairros(id,nome)')
      .eq('status', 'Ativo')
      .order('destaque', { ascending: false })
      .order('created_at', { ascending: false })
    setImoveis(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    supabase.from('cidades').select('*').order('nome').then(r => setCidades(r.data || []))
    supabase.from('tipos_imovel').select('*').order('nome').then(r => setTipos(r.data || []))
  }, [load])

  useEffect(() => {
    if (cidadeId) {
      supabase.from('bairros').select('*').eq('cidade_id', cidadeId).order('nome').then(r => setBairros(r.data || []))
    } else setBairros([])
  }, [cidadeId])

  // Filtrar
  useEffect(() => {
    let list = [...imoveis]
    if (finalidade) list = list.filter(i => i.finalidade === finalidade)
    if (tipo) list = list.filter(i => i.tipo === tipo)
    if (cidadeId) list = list.filter(i => i.cidade_id === cidadeId)
    if (bairroId) list = list.filter(i => i.bairro_id === bairroId)
    if (precoMin) list = list.filter(i => i.preco >= parseFloat(precoMin))
    if (precoMax) list = list.filter(i => i.preco <= parseFloat(precoMax))
    if (dorms) list = list.filter(i => i.dorms >= parseInt(dorms))
    if (vagas) list = list.filter(i => i.vagas >= parseInt(vagas))
    if (areaMin) list = list.filter(i => i.area >= parseFloat(areaMin))
    if (busca) {
      const s = busca.toLowerCase()
      list = list.filter(i =>
        i.titulo?.toLowerCase().includes(s) ||
        i.cidade?.nome?.toLowerCase().includes(s) ||
        i.bairro?.nome?.toLowerCase().includes(s) ||
        i.endereco?.toLowerCase().includes(s)
      )
    }
    if (ordenar === 'menorPreco') list.sort((a, b) => a.preco - b.preco)
    else if (ordenar === 'maiorPreco') list.sort((a, b) => b.preco - a.preco)
    else if (ordenar === 'maiorArea') list.sort((a, b) => (b.area || 0) - (a.area || 0))
    setFiltered(list)
  }, [imoveis, finalidade, tipo, cidadeId, bairroId, precoMin, precoMax, dorms, vagas, areaMin, busca, ordenar])

  // Inicializar mapa Leaflet
  useEffect(() => {
    if (view !== 'mapa' || mapLoaded) return
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => setMapLoaded(true)
    document.head.appendChild(script)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(link)
  }, [view, mapLoaded])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return
    const L = (window as any).L
    const map = L.map(mapRef.current).setView([-29.67, -52.7], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)
    mapInstanceRef.current = map
  }, [mapLoaded])

  // Atualizar markers no mapa
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const L = (window as any).L
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    // Imóveis com coordenadas (se tiver lat/lng no futuro)
    // Por ora coloca pin no centro da cidade com offset aleatório
    filtered.forEach((im, idx) => {
      const lat = -29.67 + (Math.random() - 0.5) * 0.08
      const lng = -52.7 + (Math.random() - 0.5) * 0.1
      const color = im.finalidade === 'Venda' ? '#4F46E5' : '#10B981'
      const icon = L.divIcon({
        html: `<div style="background:${color};color:#fff;padding:3px 7px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${im.finalidade==='Venda'?'V':'A'} ${im.preco>=1e6?(im.preco/1e6).toFixed(1)+'M':im.preco>=1e3?(im.preco/1e3).toFixed(0)+'k':im.preco}</div>`,
        className: '',
        iconAnchor: [30, 15],
      })
      const marker = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current)
      marker.on('click', () => setSelected(im))
      markersRef.current.push(marker)
    })
  }, [filtered, mapLoaded])

  function limparFiltros() {
    setFinalidade(''); setTipo(''); setCidadeId(''); setBairroId('')
    setPrecoMin(''); setPrecoMax(''); setDorms(''); setVagas('')
    setAreaMin(''); setBusca(''); setOrdenar('recente')
  }

  const temFiltro = finalidade || tipo || cidadeId || bairroId || precoMin || precoMax || dorms || vagas || areaMin || busca

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="bg-[#0D2137] h-14 px-6 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <Link href="/site" className="flex items-center gap-2">
          <Image src="/logo.png" alt="VisionLar" width={110} height={40} className="object-contain" />
        </Link>
        <div className="hidden md:flex gap-6 list-none">
          {[['/', 'Início'], ['/site', 'Home'], ['/site/imoveis', 'Imóveis']].map(([href, label]) => (
            <Link key={href} href={href} className="text-white/60 hover:text-[#D4A843] text-xs font-medium transition-colors">{label}</Link>
          ))}
        </div>
        <a href={`https://wa.me/${WPP}?text=${encodeURIComponent('Olá! Vim pelo site da VisionLar.')}`}
          target="_blank" rel="noopener"
          className="bg-[#B8892A] text-[#0D2137] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#D4A843] transition-colors">
          📲 WhatsApp
        </a>
      </nav>

      {/* HERO BUSCA */}
      <div className="bg-gradient-to-r from-[#0D2137] to-[#1A3558] py-6 px-6">
        <h1 className="text-white font-bold text-lg mb-3">Encontre seu imóvel ideal</h1>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex bg-white rounded-xl overflow-hidden shadow-lg flex-1 min-w-[280px]">
            <button onClick={() => setFinalidade('')} className={`px-4 py-2.5 text-xs font-bold transition-colors ${!finalidade ? 'bg-[#B8892A] text-[#0D2137]' : 'text-gray-500 hover:bg-gray-50'}`}>Todos</button>
            <button onClick={() => setFinalidade('Venda')} className={`px-4 py-2.5 text-xs font-bold transition-colors ${finalidade==='Venda' ? 'bg-[#B8892A] text-[#0D2137]' : 'text-gray-500 hover:bg-gray-50'}`}>Comprar</button>
            <button onClick={() => setFinalidade('Aluguel')} className={`px-4 py-2.5 text-xs font-bold transition-colors ${finalidade==='Aluguel' ? 'bg-[#B8892A] text-[#0D2137]' : 'text-gray-500 hover:bg-gray-50'}`}>Alugar</button>
          </div>
          <div className="flex-1 min-w-[240px] relative">
            <input
              className="w-full bg-white rounded-xl px-4 py-2.5 text-xs outline-none shadow-lg"
              placeholder="🔍 Digite cidade, bairro ou tipo..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView(v => v === 'lista' ? 'mapa' : 'lista')}
              className="bg-white text-[#0D2137] px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              {view === 'lista' ? '🗺️ Ver Mapa' : '📋 Ver Lista'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-130px)]">
        {/* SIDEBAR FILTROS */}
        <aside className={`bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ${filtrosAbertos ? 'w-64 min-w-[256px]' : 'w-0 min-w-0 overflow-hidden'}`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Filtros</h3>
              {temFiltro && (
                <button onClick={limparFiltros} className="text-[10px] text-red-500 font-semibold hover:text-red-700">
                  Limpar tudo
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Tipo de imóvel */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Tipo de Imóvel</label>
                <select className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={tipo} onChange={e => setTipo(e.target.value)}>
                  <option value="">Todos os tipos</option>
                  {tipos.map(t => <option key={t.id}>{t.nome}</option>)}
                </select>
              </div>

              {/* Cidade */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Cidade</label>
                <select className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={cidadeId} onChange={e => { setCidadeId(e.target.value); setBairroId('') }}>
                  <option value="">Todas as cidades</option>
                  {cidades.map(c => <option key={c.id} value={c.id}>{c.nome} - {c.estado}</option>)}
                </select>
              </div>

              {/* Bairro */}
              {bairros.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Bairro</label>
                  <select className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={bairroId} onChange={e => setBairroId(e.target.value)}>
                    <option value="">Todos os bairros</option>
                    {bairros.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                  </select>
                </div>
              )}

              {/* Preço */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Faixa de Preço (R$)</label>
                <div className="flex gap-1.5">
                  <input type="number" className="w-1/2 border border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:border-amber-500" placeholder="Mínimo" value={precoMin} onChange={e => setPrecoMin(e.target.value)} />
                  <input type="number" className="w-1/2 border border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:border-amber-500" placeholder="Máximo" value={precoMax} onChange={e => setPrecoMax(e.target.value)} />
                </div>
              </div>

              {/* Dormitórios */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Dormitórios</label>
                <div className="flex gap-1.5">
                  {['', '1', '2', '3', '4'].map(d => (
                    <button key={d} onClick={() => setDorms(d)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${dorms === d ? 'bg-[#0D2137] text-white border-[#0D2137]' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {d || 'Todos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vagas */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Vagas de Garagem</label>
                <div className="flex gap-1.5">
                  {['', '1', '2', '3'].map(v => (
                    <button key={v} onClick={() => setVagas(v)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${vagas === v ? 'bg-[#0D2137] text-white border-[#0D2137]' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {v || 'Todos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Área */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Área mínima (m²)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-amber-500" placeholder="Ex: 80" value={areaMin} onChange={e => setAreaMin(e.target.value)} />
              </div>

              {/* Ordenar */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Ordenar por</label>
                <select className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={ordenar} onChange={e => setOrdenar(e.target.value)}>
                  <option value="recente">Mais recentes</option>
                  <option value="menorPreco">Menor preço</option>
                  <option value="maiorPreco">Maior preço</option>
                  <option value="maiorArea">Maior área</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* BOTÃO TOGGLE FILTROS */}
        <button
          onClick={() => setFiltrosAbertos(f => !f)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-r-lg p-1.5 shadow-md hover:bg-gray-50 transition-colors"
          style={{ left: filtrosAbertos ? '256px' : '0', transition: 'left 0.3s' }}
        >
          <span className="text-gray-500 text-xs">{filtrosAbertos ? '◀' : '▶'}</span>
        </button>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Barra resultado */}
          <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setFiltrosAbertos(f => !f)} className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50">
                ⚙️ Filtros {temFiltro && <span className="bg-[#B8892A] text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold">ON</span>}
              </button>
              <span className="text-xs text-gray-500">
                <strong className="text-gray-900">{filtered.length}</strong> imóveis encontrados
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setView('lista')} className={`p-1.5 rounded-lg transition-colors ${view==='lista' ? 'bg-[#0D2137] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z"/></svg>
              </button>
              <button onClick={() => setView('mapa')} className={`p-1.5 rounded-lg transition-colors ${view==='mapa' ? 'bg-[#0D2137] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                🗺️
              </button>
            </div>
          </div>

          {/* LISTA */}
          {view === 'lista' && (
            <div className="overflow-y-auto flex-1 p-4">
              {loading ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-3xl mb-3 animate-pulse">🏠</div>
                  <p className="text-sm">Carregando imóveis...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm font-medium">Nenhum imóvel encontrado</p>
                  <p className="text-xs mt-1">Tente ajustar os filtros</p>
                  {temFiltro && <button onClick={limparFiltros} className="mt-3 text-xs text-[#B8892A] font-bold hover:underline">Limpar filtros</button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((im, idx) => (
                    <CardImovel key={im.id} im={im} idx={idx} onSelect={setSelected} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MAPA */}
          {view === 'mapa' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Mapa */}
              <div className="flex-1 relative">
                <div ref={mapRef} className="w-full h-full" />
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center text-gray-400">
                      <div className="text-3xl mb-2 animate-pulse">🗺️</div>
                      <p className="text-sm">Carregando mapa...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista lateral no mapa */}
              <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-700">{filtered.length} imóveis no mapa</p>
                </div>
                {filtered.map((im, idx) => (
                  <div
                    key={im.id}
                    onClick={() => setSelected(im)}
                    className={`flex gap-2.5 p-3 border-b border-gray-100 cursor-pointer hover:bg-amber-50 transition-colors ${selected?.id === im.id ? 'bg-amber-50 border-l-2 border-l-[#B8892A]' : ''}`}
                  >
                    <img
                      src={im.foto_url || FOTOS[idx % FOTOS.length]}
                      alt={im.titulo}
                      className="w-16 h-12 object-cover rounded-lg shrink-0"
                      onError={e => { (e.target as any).src = FOTOS[0] }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{im.titulo}</div>
                      <div className="text-[10px] text-gray-400 truncate">📍 {im.bairro?.nome || im.cidade?.nome}</div>
                      <div className="text-xs font-bold text-[#0D2137] mt-0.5">{fmtP(im.preco, im.finalidade)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL IMÓVEL SELECIONADO */}
      {selected && (
        <div className="fixed inset-0 bg-gray-900/70 z-[200] flex items-center justify-center p-4 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <img
              src={selected.foto_url || FOTOS[0]}
              alt={selected.titulo}
              className="w-full h-52 object-cover rounded-t-2xl"
              onError={e => { (e.target as any).src = FOTOS[0] }}
            />
            <div className="p-5">
              <div className="flex gap-2 mb-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selected.finalidade==='Venda'?'bg-indigo-50 text-indigo-700':'bg-emerald-50 text-emerald-700'}`}>{selected.finalidade}</span>
                {selected.destaque && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">★ DESTAQUE</span>}
              </div>
              <div className="font-bold text-2xl text-[#0D2137]" style={{fontFamily:'Playfair Display, serif'}}>{fmtP(selected.preco, selected.finalidade)}</div>
              {selected.condominio > 0 && <div className="text-xs text-gray-400 mt-0.5">+ Cond. R$ {selected.condominio?.toLocaleString('pt-BR')}/mês</div>}
              <div className="text-xs font-semibold text-gray-800 mt-1">{selected.titulo}</div>
              <div className="text-xs text-gray-400 mt-0.5 mb-3">📍 {selected.bairro?.nome ? `${selected.bairro.nome}, ` : ''}{selected.cidade?.nome} - {selected.cidade?.estado}</div>
              <div className="flex gap-4 py-3 border-t border-b border-gray-100 mb-3 flex-wrap">
                {selected.area ? <div className="text-center"><div className="text-sm font-bold">{selected.area}m²</div><div className="text-[9px] text-gray-400">Área</div></div> : null}
                {selected.dorms ? <div className="text-center"><div className="text-sm font-bold">{selected.dorms}</div><div className="text-[9px] text-gray-400">Dorms</div></div> : null}
                {selected.suites ? <div className="text-center"><div className="text-sm font-bold">{selected.suites}</div><div className="text-[9px] text-gray-400">Suítes</div></div> : null}
                {selected.banhs ? <div className="text-center"><div className="text-sm font-bold">{selected.banhs}</div><div className="text-[9px] text-gray-400">Banhs</div></div> : null}
                {selected.vagas ? <div className="text-center"><div className="text-sm font-bold">{selected.vagas}</div><div className="text-[9px] text-gray-400">Vagas</div></div> : null}
              </div>
              {selected.descricao && <p className="text-xs text-gray-500 leading-relaxed mb-4">{selected.descricao}</p>}
              <div className="flex gap-2">
                <a href={`https://wa.me/${WPP}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel: ${selected.titulo} — ${selected.cidade?.nome}`)}`}
                  target="_blank" rel="noopener"
                  className="flex-1 bg-green-500 text-white text-xs font-bold py-2.5 rounded-xl text-center hover:bg-green-600 transition-colors">
                  📲 Falar pelo WhatsApp
                </a>
                <button onClick={() => setSelected(null)} className="border border-gray-200 text-xs px-4 py-2.5 rounded-xl hover:bg-gray-50">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CardImovel({ im, idx, onSelect }: { im: any, idx: number, onSelect: (i: any) => void }) {
  const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group">
      <div className="relative h-44 overflow-hidden bg-gray-100 cursor-pointer" onClick={() => onSelect(im)}>
        <img
          src={im.foto_url || FOTOS[idx % FOTOS.length]}
          alt={im.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { (e.target as any).src = FOTOS[0] }}
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${im.finalidade==='Venda'?'bg-indigo-600 text-white':'bg-emerald-600 text-white'}`}>{im.finalidade}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-gray-700 shadow">{im.tipo}</span>
        </div>
        {im.destaque && <div className="absolute top-2 right-2 bg-[#B8892A] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">★ DESTAQUE</div>}
      </div>
      <div className="p-3">
        <div className="font-bold text-xl text-gray-900" style={{fontFamily:'Playfair Display, serif'}}>
          {im.preco >= 1e6 ? `R$ ${(im.preco/1e6).toFixed(1).replace('.',',')}M` : im.preco >= 1e3 ? `R$ ${(im.preco/1e3).toFixed(0)}k` : `R$ ${im.preco?.toLocaleString('pt-BR')}`}
          {im.finalidade === 'Aluguel' && <span className="text-xs text-gray-400 font-normal">/mês</span>}
        </div>
        <div className="text-xs font-semibold text-gray-800 mt-0.5 truncate cursor-pointer hover:text-[#B8892A]" onClick={() => onSelect(im)}>{im.titulo}</div>
        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
          <span>📍</span>
          <span className="truncate">{im.bairro?.nome ? `${im.bairro.nome}, ` : ''}{im.cidade?.nome} - {im.cidade?.estado}</span>
        </div>

        {/* Specs */}
        <div className="flex gap-3 mt-2.5 pt-2.5 border-t border-gray-100 flex-wrap">
          {im.area ? <span className="flex items-center gap-1 text-[10px] text-gray-500"><span>📐</span><b>{im.area}</b>m²</span> : null}
          {im.dorms ? <span className="flex items-center gap-1 text-[10px] text-gray-500"><span>🛏</span><b>{im.dorms}</b> dorms</span> : null}
          {im.suites ? <span className="flex items-center gap-1 text-[10px] text-gray-500"><span>🛁</span><b>{im.suites}</b> suítes</span> : null}
          {im.banhs ? <span className="flex items-center gap-1 text-[10px] text-gray-500"><span>🚿</span><b>{im.banhs}</b> banhs</span> : null}
          {im.vagas ? <span className="flex items-center gap-1 text-[10px] text-gray-500"><span>🚗</span><b>{im.vagas}</b> vagas</span> : null}
        </div>

        {/* Ações */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onSelect(im)}
            className="flex-1 bg-[#0D2137] text-white text-[10px] font-bold py-2 rounded-lg hover:bg-[#1A3558] transition-colors"
          >
            Ver detalhes
          </button>
          <a
            href={`https://wa.me/${WPP}?text=${encodeURIComponent(`Tenho interesse: ${im.titulo}`)}`}
            target="_blank" rel="noopener"
            className="bg-green-500 text-white text-[10px] font-bold px-3 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
          >
            <svg width="11" height="11" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z"/></svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
