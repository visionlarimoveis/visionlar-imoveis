'use client'
 import BotoesSociais from '@/components/ui/BotoesSociais'
import { useEffect, useState, useCallback, useRef } from 'react'
import BotoesFlutuantes from '@/components/ui/BotoesFlutuantes'
import Image from 'next/image'
import FloatingButtons from '@/components/ui/FloatingButtons'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import FloatButtons from '@/components/ui/FloatButtons'

const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'
const CRECI = process.env.NEXT_PUBLIC_CRECI || '44.627'
const FOTOS = [
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
  'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600&q=80',
]

function fmtP(p: number, f: string) {
  const v = p >= 1e6 ? `R$ ${(p/1e6).toFixed(1).replace('.',',')}M`
    : p >= 1e3 ? `R$ ${(p/1e3).toFixed(0)}k`
    : `R$ ${p.toLocaleString('pt-BR')}`
  return f === 'Aluguel' ? `${v}/mês` : v
}

// ── Multi-select tipos com checkboxes ──────────────────────────
function TiposDropdown({ tipos, selected, onChange }: {
  tipos: any[]; selected: string[]; onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  const toggle = (nome: string) => onChange(selected.includes(nome) ? selected.filter(s => s !== nome) : [...selected, nome])
  const label = selected.length === 0 ? 'Tipo de imóvel'
    : selected.length === 1 ? selected[0]
    : `${selected[0]} +${selected.length - 1}`

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="h-10 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 text-sm hover:border-[#B8892A] transition-colors min-w-[160px]">
        <span className={`flex-1 text-left truncate ${selected.length === 0 ? 'text-gray-400' : 'text-gray-800 font-medium'}`}>{label}</span>
        {selected.length > 0
          ? <button onClick={e => { e.stopPropagation(); onChange([]) }} className="text-gray-300 hover:text-gray-600 text-lg leading-none">×</button>
          : <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-300"><path d="M6 9l6 6 6-6"/></svg>
        }
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 min-w-[200px] max-h-64 overflow-y-auto">
          {tipos.map(t => (
            <label key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
              <div onClick={() => toggle(t.nome)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selected.includes(t.nome) ? 'bg-[#0D2137] border-[#0D2137]' : 'border-gray-300'}`}>
                {selected.includes(t.nome) && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span onClick={() => toggle(t.nome)} className={`text-sm ${selected.includes(t.nome) ? 'text-[#0D2137] font-semibold' : 'text-gray-700'}`}>{t.nome}</span>
            </label>
          ))}
        </div>
      )}

    </div>
  )
}

// ── Localização dropdown ──────────────────────────────────────
function LocalizacaoDropdown({ cidades, bairros, selBairros, selCidades, onBairros, onCidades }: {
  cidades: any[]; bairros: any[]; selBairros: string[]; selCidades: string[]
  onBairros: (v: string[]) => void; onCidades: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  const total = selBairros.length + selCidades.length
  const allLabels = [
    ...cidades.filter(c => selCidades.includes(c.id)).map(c => c.nome),
    ...bairros.filter(b => selBairros.includes(b.id)).map(b => b.nome),
  ]
  const label = total === 0 ? 'Cidade ou bairro' : total === 1 ? allLabels[0] : `${allLabels[0]} +${total - 1}`
  const toggleB = (id: string) => onBairros(selBairros.includes(id) ? selBairros.filter(x => x !== id) : [...selBairros, id])
  const toggleC = (id: string) => onCidades(selCidades.includes(id) ? selCidades.filter(x => x !== id) : [...selCidades, id])

  return (
    <div className="relative flex-1 min-w-[180px]" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full h-10 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 text-sm hover:border-[#B8892A] transition-colors">
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span className={`flex-1 truncate text-left ${total === 0 ? 'text-gray-400' : 'text-gray-800 font-medium'}`}>{label}</span>
        {total > 0
          ? <button onClick={e => { e.stopPropagation(); onBairros([]); onCidades([]) }} className="text-gray-300 hover:text-gray-600 text-lg leading-none shrink-0">×</button>
          : <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-300 shrink-0"><path d="M6 9l6 6 6-6"/></svg>
        }
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 min-w-[300px] max-h-72 overflow-y-auto">
          {cidades.map(c => {
            const bc = bairros.filter(b => b.cidade_id === c.id)
            return (
              <div key={c.id}>
                <div className="sticky top-0 bg-gray-50 px-4 py-2 flex items-center gap-2.5 border-b border-gray-100">
                  <div onClick={() => toggleC(c.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${selCidades.includes(c.id) ? 'bg-[#0D2137] border-[#0D2137]' : 'border-gray-300'}`}>
                    {selCidades.includes(c.id) && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span onClick={() => toggleC(c.id)} className={`text-xs font-bold uppercase tracking-wide cursor-pointer ${selCidades.includes(c.id) ? 'text-[#0D2137]' : 'text-gray-500'}`}>{c.nome} - {c.estado}</span>
                </div>
                {bc.map(b => (
                  <label key={b.id} className="flex items-center gap-3 pl-9 pr-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                    <div onClick={() => toggleB(b.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selBairros.includes(b.id) ? 'bg-[#0D2137] border-[#0D2137]' : 'border-gray-300'}`}>
                      {selBairros.includes(b.id) && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span onClick={() => toggleB(b.id)} className={`text-sm ${selBairros.includes(b.id) ? 'text-[#0D2137] font-semibold' : 'text-gray-700'}`}>{b.nome}, {c.nome}</span>
                  </label>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ImoveisHomePage() {
  const [imoveis, setImoveis] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [bannerIdx, setBannerIdx] = useState(0)
  const bannerRef = useRef<any>(null)
  const [cidades, setCidades] = useState<any[]>([])
  const [bairros, setBairros] = useState<any[]>([])
  const [tipos, setTipos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'mapa'>('grid')
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [finalidade, setFinalidade] = useState('Venda')
  const [tiposSel, setTiposSel] = useState<string[]>([])
  const [bairrosSel, setBairrosSel] = useState<string[]>([])
  const [cidadesSel, setCidadesSel] = useState<string[]>([])
  const [precoMin, setPrecoMin] = useState('')
  const [precoMax, setPrecoMax] = useState('')
  const [dorms, setDorms] = useState('')
  const [suitesSel, setSuitesSel] = useState('')
  const [mobiliado, setMobiliado] = useState('')
  const [vagas, setVagas] = useState('')
  const [areaMin, setAreaMin] = useState('')
  const [areaMax, setAreaMax] = useState('')
  const [ordenar, setOrdenar] = useState('recente')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('imoveis')
      .select('*, cidade:cidades(id,nome,estado), bairro:bairros(id,nome,cidade_id)')
      .eq('status', 'Ativo')
      .order('destaque', { ascending: false })
      .order('created_at', { ascending: false })
    setImoveis(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    supabase.from('cidades').select('*').order('nome').then(r => setCidades(r.data || []))
    supabase.from('bairros').select('*').order('nome').then(r => setBairros(r.data || []))
    supabase.from('tipos_imovel').select('*').order('nome').then(r => setTipos(r.data || []))
  }, [load])

  // Auto-scroll do banner a cada 5s
  const destaques = imoveis.filter(i => i.destaque)
  useEffect(() => {
    if (destaques.length <= 1) return
    const t = setInterval(() => setBannerIdx(i => (i + 1) % destaques.length), 5000)
    return () => clearInterval(t)
  }, [destaques.length])

  useEffect(() => {
    let list = [...imoveis]
    if (finalidade) list = list.filter(i => i.finalidade === finalidade)
    if (tiposSel.length) list = list.filter(i => tiposSel.includes(i.tipo))
    if (cidadesSel.length || bairrosSel.length)
      list = list.filter(i => cidadesSel.includes(i.cidade_id) || bairrosSel.includes(i.bairro_id))
    if (precoMin) list = list.filter(i => i.preco >= parseFloat(precoMin))
    if (precoMax) list = list.filter(i => i.preco <= parseFloat(precoMax))
    if (dorms) list = list.filter(i => (i.dorms||0) >= parseInt(dorms))
    if (suitesSel) list = list.filter(i => (i.suites||0) >= parseInt(suitesSel))
    if (mobiliado) list = list.filter(i => i.mobiliado === mobiliado)
    if (vagas) list = list.filter(i => (i.vagas||0) >= parseInt(vagas))
    if (areaMin) list = list.filter(i => (i.area||0) >= parseFloat(areaMin))
    if (areaMax) list = list.filter(i => (i.area||0) <= parseFloat(areaMax))
    if (ordenar === 'menorPreco') list.sort((a, b) => a.preco - b.preco)
    else if (ordenar === 'maiorPreco') list.sort((a, b) => b.preco - a.preco)
    else if (ordenar === 'maiorArea') list.sort((a, b) => (b.area||0) - (a.area||0))
    setFiltered(list)
  }, [imoveis, finalidade, tiposSel, cidadesSel, bairrosSel, precoMin, precoMax, dorms, vagas, areaMin, areaMax, ordenar])

  useEffect(() => {
    if (view !== 'mapa' || mapLoaded) return
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    s.onload = () => setMapLoaded(true)
    document.head.appendChild(s)
    const l = document.createElement('link'); l.rel = 'stylesheet'
    l.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(l)
  }, [view, mapLoaded])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return
    const L = (window as any).L
    const map = L.map(mapRef.current).setView([-29.67, -52.7], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
    mapInstanceRef.current = map
  }, [mapLoaded])

  useEffect(() => {
    if (!mapInstanceRef.current) return
    const L = (window as any).L
    markersRef.current.forEach(m => m.remove()); markersRef.current = []
    // Centro padrão (Santa Cruz do Sul)
    const CENTER_LAT = -29.6896
    const CENTER_LNG = -52.7014
    filtered.forEach(im => {
      // Usa coordenadas reais se disponíveis, senão distribui aleatoriamente
      const lat = im.latitude ? parseFloat(im.latitude) : CENTER_LAT + (Math.random() - 0.5) * 0.08
      const lng = im.longitude ? parseFloat(im.longitude) : CENTER_LNG + (Math.random() - 0.5) * 0.1
      const color = im.finalidade === 'Venda' ? '#4F46E5' : '#10B981'
      const icon = L.divIcon({ html: `<div style="background:${color};color:#fff;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3)">${fmtP(im.preco,im.finalidade)}</div>`, className: '', iconAnchor: [30,15] })
      const mk = L.marker([lat,lng],{icon}).addTo(mapInstanceRef.current)
      mk.on('click', () => window.location.href = `/site/imoveis/${im.id}`)
      markersRef.current.push(mk)
    })
  }, [filtered, mapLoaded])

  function limparTudo() {
    setFinalidade(''); setTiposSel([]); setBairrosSel([]); setCidadesSel([])
    setPrecoMin(''); setPrecoMax(''); setDorms(''); setSuitesSel(''); setVagas(''); setAreaMin(''); setAreaMax(''); setMobiliado(''); setOrdenar('recente')
  }

  const temFiltro = !!(finalidade || tiposSel.length || bairrosSel.length || cidadesSel.length || precoMin || precoMax || dorms || vagas || areaMin || areaMax)
  const gridCols = sidebarOpen ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">{/* wrapper */}
      {/* NAV */}
      <nav className="bg-[#0D2137] shrink-0 shadow-lg z-50" style={{height:"64px",overflow:"hidden"}}>
        <div className="h-full px-6 flex items-center justify-between">
          <Link href="/site/imoveis">
            <Image src="/logo.png?v=2" alt="Visionlar Consultoria Imobiliária" width={130} height={44} className="object-contain" />
          </Link>
          <div className="hidden md:flex gap-1">
            {[['Imóveis','/site/imoveis'],['Institucional','/site/institucional'],['Contato','/site/contato']].map(([l,h])=>(
              <Link key={l} href={h} className="text-white/65 hover:text-white hover:bg-white/10 px-4 py-1.5 rounded-lg text-sm font-medium transition-all">{l}</Link>
            ))}
          </div>
          <a href={`https://wa.me/${WPP}?text=${encodeURIComponent('Olá! Vim pelo site da Visionlar Consultoria Imobiliária.')}`} target="_blank" rel="noopener"
            className="bg-[#B8892A] text-[#0D2137] px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#D4A843] transition-colors flex items-center gap-1.5">
            <svg width="13" height="13" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z"/></svg>
            WhatsApp
          </a>
        </div>
      </nav>

      {/* BARRA BUSCA SIMPLES */}
      <div className="bg-white border-b border-gray-200 shadow-sm shrink-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
          <button onClick={() => setSidebarOpen(o => !o)}
            className={`h-10 px-3 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0 ${sidebarOpen ? 'bg-[#0D2137] text-white border-[#0D2137]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            Filtros
          </button>
          <div className="w-px h-6 bg-gray-200 shrink-0"/>
          {/* 1. TRANSAÇÃO */}
          <div className="flex gap-1 shrink-0">
            {[['Venda','Comprar'],['Aluguel','Alugar']].map(([val,label])=>(
              <button key={val} onClick={() => setFinalidade(val === finalidade ? '' : val)}
                className={`h-10 px-4 rounded-xl text-sm font-semibold border transition-all ${finalidade===val?'bg-[#0D2137] text-white border-[#0D2137]':'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-gray-200 shrink-0"/>
          {/* 2. TIPO — multi-select com checkboxes */}
          <TiposDropdown tipos={tipos} selected={tiposSel} onChange={setTiposSel} />
          <div className="w-px h-6 bg-gray-200 shrink-0"/>
          {/* 3. LOCALIZAÇÃO */}
          <LocalizacaoDropdown cidades={cidades} bairros={bairros}
            selBairros={bairrosSel} selCidades={cidadesSel}
            onBairros={setBairrosSel} onCidades={setCidadesSel}
          />
          {temFiltro && (
            <button onClick={limparTudo} className="h-10 px-3 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 shrink-0">✕ Limpar</button>
          )}
          {/* Direita */}
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <span className="text-xs text-gray-500"><strong className="text-gray-800">{filtered.length}</strong> imóveis</span>
            <select value={ordenar} onChange={e => setOrdenar(e.target.value)} className="h-10 border border-gray-200 rounded-xl px-3 text-xs bg-white outline-none focus:border-[#B8892A] text-gray-600">
              <option value="recente">Recentes</option>
              <option value="menorPreco">Menor preço</option>
              <option value="maiorPreco">Maior preço</option>
              <option value="maiorArea">Maior área</option>
            </select>
            <div className="flex gap-1 border border-gray-200 rounded-xl p-1 bg-white">
              <button onClick={() => setView('grid')} title="Grid" className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${view==='grid'?'bg-[#0D2137] text-white':'text-gray-400 hover:bg-gray-100'}`}>
                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/></svg>
              </button>
              <button onClick={() => setView('mapa')} title="Mapa" className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${view==='mapa'?'bg-[#0D2137] text-white':'text-gray-400 hover:bg-gray-100'}`}>🗺️</button>
            </div>
          </div>
        </div>
      </div>

      {/* CORPO */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`bg-white border-r border-gray-200 shrink-0 transition-all duration-300 overflow-hidden flex flex-col ${sidebarOpen ? 'w-56' : 'w-0'}`}>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Filtros avançados</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Faixa de Preço (R$)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400 mb-1.5" placeholder="Mínimo" value={precoMin} onChange={e => setPrecoMin(e.target.value)}/>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400" placeholder="Máximo" value={precoMax} onChange={e => setPrecoMax(e.target.value)}/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Dormitórios</label>
                <div className="grid grid-cols-5 gap-1">
                  {['','1','2','3','4+'].map(d=>(
                    <button key={d} onClick={() => setDorms(d==='4+'?'4':d)}
                      className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${(d==='4+'?dorms==='4':dorms===d)?'bg-[#0D2137] text-white border-[#0D2137]':'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {d||'Td'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Suítes</label>
                <div className="grid grid-cols-4 gap-1">
                  {['','1','2','3+'].map(s=>(
                    <button key={s} onClick={() => setSuitesSel(s==='3+'?'3':s)}
                      className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${(s==='3+'?suitesSel==='3':suitesSel===s)?'bg-[#0D2137] text-white border-[#0D2137]':'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {s||'Td'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Mobiliado</label>
                <div className="flex flex-col gap-1">
                  {[['','Todos'],['Sim','Mobiliado'],['Semimobiliado','Semimobiliado'],['Não','Não mobiliado']].map(([val,label])=>(
                    <button key={val} onClick={() => setMobiliado(val)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all text-left ${mobiliado===val?'bg-[#0D2137] text-white border-[#0D2137]':'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Vagas Garagem</label>
                <div className="grid grid-cols-4 gap-1">
                  {['','1','2','3+'].map(v=>(
                    <button key={v} onClick={() => setVagas(v==='3+'?'3':v)}
                      className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${(v==='3+'?vagas==='3':vagas===v)?'bg-[#0D2137] text-white border-[#0D2137]':'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {v||'Td'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Área (m²)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400 mb-1.5" placeholder="Mínima" value={areaMin} onChange={e => setAreaMin(e.target.value)}/>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400" placeholder="Máxima" value={areaMax} onChange={e => setAreaMax(e.target.value)}/>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 p-3">
            <button onClick={() => setSidebarOpen(false)} className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 py-1">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              Recolher filtros
            </button>
          </div>
        </aside>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* ── BANNER DESTAQUES ── */}
          {destaques.length > 0 && (
            <div className="relative overflow-hidden shrink-0" style={{height: '340px'}}>
              {destaques.map((im, idx) => {
                const foto = im.foto_url || FOTOS[idx % FOTOS.length]
                const ativo = idx === bannerIdx
                return (
                  <div key={im.id}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: ativo ? 1 : 0, zIndex: ativo ? 1 : 0 }}>
                    <img src={foto} alt={im.titulo}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as any).src = FOTOS[0] }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                      <div>
                        {im.codigo && <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 inline-block">{im.codigo}</span>}
                        <h2 className="text-white font-bold text-2xl leading-tight drop-shadow-lg" style={{fontFamily:'Playfair Display,serif'}}>{im.titulo}</h2>
                        <p className="text-white/75 text-sm mt-1">📍 {im.bairro?.nome && `${im.bairro.nome} — `}{im.cidade?.nome} - {im.cidade?.estado}</p>
                        <p className="text-[#D4A843] font-bold text-xl mt-1" style={{fontFamily:'Playfair Display,serif'}}>
                          {im.preco >= 1e6 ? `R$ ${(im.preco/1e6).toFixed(1).replace('.',',')}M` : im.preco >= 1e3 ? `R$ ${(im.preco/1e3).toFixed(0)}k` : `R$ ${im.preco?.toLocaleString('pt-BR')}`}
                          {im.finalidade === 'Aluguel' && <span className="text-sm font-normal text-white/60">/mês</span>}
                        </p>
                      </div>
                      <button onClick={() => window.location.href=`/site/imoveis/${im.id}`}
                        className="bg-[#B8892A] hover:bg-[#D4A843] text-[#0D2137] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0 shadow-lg">
                        Ver imóvel →
                      </button>
                    </div>
                  </div>
                )
              })}
              {destaques.length > 1 && (
                <>
                  <button onClick={() => setBannerIdx(i => (i - 1 + destaques.length) % destaques.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors">‹</button>
                  <button onClick={() => setBannerIdx(i => (i + 1) % destaques.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors">›</button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                    {destaques.map((_, i) => (
                      <button key={i} onClick={() => setBannerIdx(i)}
                        className={`rounded-full transition-all ${i === bannerIdx ? 'w-5 h-2 bg-[#B8892A]' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`} />
                    ))}
                  </div>
                </>
              )}
              <div className="absolute top-4 right-4 z-10 bg-[#B8892A] text-white text-[10px] font-black px-3 py-1 rounded-full shadow">★ Destaque</div>
            </div>
          )}
          {view === 'grid' && (
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center text-gray-400"><div className="text-5xl mb-4 animate-pulse">🏠</div><p className="text-sm">Carregando imóveis...</p></div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center text-gray-400">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="font-semibold text-gray-600 mb-1">Nenhum imóvel encontrado</p>
                    <p className="text-sm mb-4">Tente ajustar os filtros</p>
                    {temFiltro && <button onClick={limparTudo} className="text-sm text-[#B8892A] font-bold border border-[#B8892A] px-5 py-2 rounded-xl hover:bg-amber-50">Limpar filtros</button>}
                  </div>
                </div>
              ) : (
                <div className={`grid gap-4 ${gridCols}`}>
                  {filtered.map((im,idx) => <CardImovel key={im.id} im={im} idx={idx}/>)}
                </div>
              )}
            </div>
          )}
          {view === 'mapa' && (
            <div className="flex h-full">
              <div className="flex-1 relative min-h-full">
                <div ref={mapRef} className="absolute inset-0"/>
                {!mapLoaded && <div className="absolute inset-0 flex items-center justify-center bg-gray-100"><div className="text-center text-gray-400"><div className="text-3xl mb-2 animate-pulse">🗺️</div><p className="text-sm">Carregando mapa...</p></div></div>}
              </div>
              <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto shrink-0">
                <div className="p-3 border-b border-gray-100 sticky top-0 bg-white"><p className="text-xs font-bold text-gray-700">{filtered.length} imóveis</p></div>
                {filtered.map((im,idx) => (
                  <div key={im.id} onClick={() => window.location.href=`/site/imoveis/${im.id}`}
                    className="flex gap-2.5 p-3 border-b border-gray-100 cursor-pointer hover:bg-amber-50 transition-colors">
                    <img src={im.foto_url||FOTOS[idx%FOTOS.length]} alt={im.titulo} className="w-16 h-12 object-cover rounded-lg shrink-0"/>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{im.titulo}</div>
                      <div className="text-[10px] text-gray-400">📍 {im.bairro?.nome||im.cidade?.nome}</div>
                      <div className="text-xs font-bold text-[#0D2137] mt-0.5">{fmtP(im.preco,im.finalidade)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* FOOTER dentro do scroll */}
          <footer className="bg-white border-t border-gray-200 py-4 px-6 flex items-center justify-between mt-auto">
            <span className="text-gray-400 text-[10px]">© {new Date().getFullYear()} Visionlar Consultoria Imobiliária — Corretor de Imóveis CRECI-RS {CRECI}</span>
            <a href="https://midiavision.com.br" target="_blank" rel="noopener" className="text-gray-300 hover:text-gray-500 text-[10px] transition-colors">Desenvolvido por MidiaVision Digital</a>
          </footer>
        </div>
      </div>
      <FloatButtons />
    </div>
  )
}

function CardImovel({ im, idx }: { im: any; idx: number }) {
  const foto = im.foto_url || FOTOS[idx % FOTOS.length]
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
      onClick={() => window.location.href=`/site/imoveis/${im.id}`}>
      <div className="relative overflow-hidden bg-gray-100" style={{aspectRatio:'4/3'}}>
        <img src={foto} alt={im.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shadow ${im.finalidade==='Venda'?'bg-indigo-600 text-white':'bg-emerald-600 text-white'}`}>{im.finalidade}</span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white text-gray-700 shadow">{im.tipo}</span>
        </div>
        {im.destaque && <div className="absolute top-2.5 right-2.5 bg-[#B8892A] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">★</div>}
        {im.codigo && <div className="absolute bottom-2.5 left-2.5 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{im.codigo}</div>}
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="text-[10px] text-gray-500">{im.tipo}</span>
          {im.mobiliado && im.mobiliado !== 'Não' && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${im.mobiliado==='Sim'?'bg-blue-50 text-blue-600':'bg-orange-50 text-orange-600'}`}>
              🛋️ {im.mobiliado === 'Sim' ? 'Mobiliado' : 'Semimobiliado'}
            </span>
          )}
        </div>
        <div className="font-bold text-base text-gray-900 leading-tight truncate">{im.bairro?.nome||im.titulo}</div>
        <div className="text-xs text-gray-500 mb-2.5">{im.cidade?.nome} - {im.cidade?.estado}</div>
        {(im.area||im.dorms||im.banhs||im.vagas) && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
            {im.area&&<span>{im.area}m²</span>}
            {im.dorms?<span>{im.dorms} {im.dorms===1?'quarto':'quartos'}</span>:null}
            {im.banhs?<span>{im.banhs} {im.banhs===1?'banho':'banhos'}</span>:null}
            {im.vagas?<span>{im.vagas} {im.vagas===1?'vaga':'vagas'}</span>:null}
          </div>
        )}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[9px] text-gray-400 font-semibold">{im.finalidade==='Venda'?'Comprar':'Alugar'}</div>
            <div className="font-bold text-lg text-gray-900 leading-none" style={{fontFamily:'Playfair Display,serif'}}>
              {im.preco>=1e6?`R$ ${(im.preco/1e6).toFixed(1).replace('.',',')}M`:im.preco>=1e3?`R$ ${(im.preco/1e3).toFixed(0)}k`:`R$ ${im.preco?.toLocaleString('pt-BR')}`}
              {im.finalidade==='Aluguel'&&<span className="text-[10px] text-gray-400 font-normal">/mês</span>}
            </div>
          </div>
          <a href={`https://wa.me/${WPP}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel${im.codigo?' código '+im.codigo:''}: ${im.titulo}`)}`}
            target="_blank" rel="noopener" onClick={e => e.stopPropagation()}
            className="bg-green-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1">
            <svg width="10" height="10" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z"/></svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
