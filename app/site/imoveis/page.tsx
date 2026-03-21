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
]

function fmtP(p: number, f: string) {
  const v = p >= 1e6 ? `R$ ${(p/1e6).toFixed(1).replace('.',',')}M`
    : p >= 1e3 ? `R$ ${(p/1e3).toFixed(0)}k`
    : `R$ ${p.toLocaleString('pt-BR')}`
  return f === 'Aluguel' ? `${v}/mês` : v
}

// ── Dropdown multiselect ──────────────────────────────────────────
function MultiSelectDropdown({ label, options, selected, onChange, placeholder }: {
  label: string; options: { id: string; nome: string }[]
  selected: string[]; onChange: (v: string[]) => void; placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])
  const labels = options.filter(o => selected.includes(o.id)).map(o => o.nome)
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm hover:border-[#B8892A] transition-colors min-w-[160px]">
        <span className="text-gray-600 truncate flex-1 text-left">
          {labels.length === 0 ? placeholder : labels.length === 1 ? labels[0] : `${labels[0]} +${labels.length-1}`}
        </span>
        {selected.length > 0
          ? <button onClick={e => { e.stopPropagation(); onChange([]) }} className="text-gray-300 hover:text-gray-600 text-lg leading-none shrink-0">×</button>
          : <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 text-gray-400"><path d="M6 9l6 6 6-6"/></svg>
        }
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 min-w-[220px] max-h-64 overflow-y-auto">
          {options.map(opt => (
            <label key={opt.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
              <div onClick={() => toggle(opt.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selected.includes(opt.id) ? 'bg-[#0D2137] border-[#0D2137]' : 'border-gray-300'}`}>
                {selected.includes(opt.id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span onClick={() => toggle(opt.id)} className={`text-sm ${selected.includes(opt.id) ? 'text-[#0D2137] font-semibold' : 'text-gray-700'}`}>{opt.nome}</span>
            </label>
          ))}
          {options.length === 0 && <div className="px-4 py-6 text-center text-xs text-gray-400">Nenhuma opção</div>}
        </div>
      )}
    </div>
  )
}

// ── Localização dropdown ──────────────────────────────────────────
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
  const toggleB = (id: string) => onBairros(selBairros.includes(id) ? selBairros.filter(x => x !== id) : [...selBairros, id])
  const toggleC = (id: string) => onCidades(selCidades.includes(id) ? selCidades.filter(x => x !== id) : [...selCidades, id])
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm hover:border-[#B8892A] transition-colors min-w-[180px]">
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 shrink-0">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span className="text-gray-600 truncate flex-1 text-left">
          {total === 0 ? 'Cidade ou bairro' : total === 1 ? allLabels[0] : `${allLabels[0]} +${total-1}`}
        </span>
        {total > 0
          ? <button onClick={e => { e.stopPropagation(); onBairros([]); onCidades([]) }} className="text-gray-300 hover:text-gray-600 text-lg leading-none shrink-0">×</button>
          : <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 text-gray-400"><path d="M6 9l6 6 6-6"/></svg>
        }
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 min-w-[300px] max-h-72 overflow-y-auto">
          {cidades.map(c => {
            const bc = bairros.filter(b => b.cidade_id === c.id)
            return (
              <div key={c.id}>
                <div className="sticky top-0 bg-gray-50 px-4 py-1.5 flex items-center gap-2 border-b border-gray-100">
                  <div onClick={() => toggleC(c.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${selCidades.includes(c.id) ? 'bg-[#0D2137] border-[#0D2137]' : 'border-gray-300'}`}>
                    {selCidades.includes(c.id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span onClick={() => toggleC(c.id)} className={`text-xs font-bold uppercase tracking-wider cursor-pointer ${selCidades.includes(c.id) ? 'text-[#0D2137]' : 'text-gray-500'}`}>{c.nome} - {c.estado}</span>
                </div>
                {bc.map(b => (
                  <label key={b.id} className="flex items-center gap-3 pl-10 pr-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                    <div onClick={() => toggleB(b.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selBairros.includes(b.id) ? 'bg-[#0D2137] border-[#0D2137]' : 'border-gray-300'}`}>
                      {selBairros.includes(b.id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
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

// ── Página principal ──────────────────────────────────────────────
export default function ImoveisHomePage() {
  const [imoveis, setImoveis] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [cidades, setCidades] = useState<any[]>([])
  const [bairros, setBairros] = useState<any[]>([])
  const [tipos, setTipos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'mapa'>('grid')
  const [selected, setSelected] = useState<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  // Filtros
  const [finalidade, setFinalidade] = useState('')
  const [tiposSel, setTiposSel] = useState<string[]>([])
  const [bairrosSel, setBairrosSel] = useState<string[]>([])
  const [cidadesSel, setCidadesSel] = useState<string[]>([])
  const [precoMin, setPrecoMin] = useState('')
  const [precoMax, setPrecoMax] = useState('')
  const [dorms, setDorms] = useState('')
  const [vagas, setVagas] = useState('')
  const [areaMin, setAreaMin] = useState('')
  const [ordenar, setOrdenar] = useState('recente')
  const [filtrosAbertos, setFiltrosAbertos] = useState(true)

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

  // Filtrar
  useEffect(() => {
    let list = [...imoveis]
    if (finalidade) list = list.filter(i => i.finalidade === finalidade)
    if (tiposSel.length > 0) list = list.filter(i => tiposSel.includes(i.tipo))
    if (cidadesSel.length > 0 || bairrosSel.length > 0)
      list = list.filter(i => cidadesSel.includes(i.cidade_id) || bairrosSel.includes(i.bairro_id))
    if (precoMin) list = list.filter(i => i.preco >= parseFloat(precoMin))
    if (precoMax) list = list.filter(i => i.preco <= parseFloat(precoMax))
    if (dorms) list = list.filter(i => (i.dorms || 0) >= parseInt(dorms))
    if (vagas) list = list.filter(i => (i.vagas || 0) >= parseInt(vagas))
    if (areaMin) list = list.filter(i => (i.area || 0) >= parseFloat(areaMin))
    if (ordenar === 'menorPreco') list.sort((a, b) => a.preco - b.preco)
    else if (ordenar === 'maiorPreco') list.sort((a, b) => b.preco - a.preco)
    else if (ordenar === 'maiorArea') list.sort((a, b) => (b.area || 0) - (a.area || 0))
    setFiltered(list)
  }, [imoveis, finalidade, tiposSel, cidadesSel, bairrosSel, precoMin, precoMax, dorms, vagas, areaMin, ordenar])

  // Mapa
  useEffect(() => {
    if (view !== 'mapa' || mapLoaded) return
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    s.onload = () => setMapLoaded(true)
    document.head.appendChild(s)
    const l = document.createElement('link')
    l.rel = 'stylesheet'
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
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    filtered.forEach(im => {
      const lat = -29.67 + (Math.random() - 0.5) * 0.08
      const lng = -52.7 + (Math.random() - 0.5) * 0.1
      const color = im.finalidade === 'Venda' ? '#4F46E5' : '#10B981'
      const icon = L.divIcon({
        html: `<div style="background:${color};color:#fff;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3)">${fmtP(im.preco, im.finalidade)}</div>`,
        className: '', iconAnchor: [30, 15],
      })
      const mk = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current)
      mk.on('click', () => window.location.href = `/site/imoveis/${im.id}`)
      markersRef.current.push(mk)
    })
  }, [filtered, mapLoaded])

  function limpar() {
    setFinalidade(''); setTiposSel([]); setBairrosSel([]); setCidadesSel([])
    setPrecoMin(''); setPrecoMax(''); setDorms(''); setVagas(''); setAreaMin(''); setOrdenar('recente')
  }

  const temFiltro = !!(finalidade || tiposSel.length || bairrosSel.length || cidadesSel.length || precoMin || precoMax || dorms || vagas || areaMin)
  const tiposOpts = tipos.map(t => ({ id: t.nome, nome: t.nome }))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── NAV PRINCIPAL ───────────────────────────────────── */}
      <nav className="bg-[#0D2137] h-16 px-6 flex items-center justify-between sticky top-0 z-50 shadow-lg shrink-0">
        <Link href="/site/imoveis">
          <Image src="/logo.png" alt="VisionLar" width={130} height={48} className="object-contain" />
        </Link>

        <div className="hidden md:flex gap-1">
          {[
            ['Imóveis', '/site/imoveis'],
            ['Institucional', '/site/institucional'],
            ['Contato', '/site/contato'],
          ].map(([label, href]) => (
            <Link key={label} href={href}
              className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all">
              {label}
            </Link>
          ))}
        </div>

        <a href={`https://wa.me/${WPP}?text=${encodeURIComponent('Olá! Vim pelo site da VisionLar Imóveis.')}`}
          target="_blank" rel="noopener"
          className="bg-[#B8892A] text-[#0D2137] px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#D4A843] transition-colors flex items-center gap-1.5">
          <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z"/></svg>
          Falar no WhatsApp
        </a>
      </nav>

      {/* ── BARRA DE BUSCA ──────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-6">
          {/* Tabs Comprar / Alugar */}
          <div className="flex">
            {[['', 'Todos'], ['Venda', 'Comprar'], ['Aluguel', 'Alugar']].map(([val, label]) => (
              <button key={val} onClick={() => setFinalidade(val)}
                className={`px-6 py-3.5 text-sm font-semibold border-b-[3px] transition-all ${
                  finalidade === val ? 'border-[#B8892A] text-[#B8892A]' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}>{label}
              </button>
            ))}
          </div>

          {/* Filtros inline */}
          <div className="flex items-center gap-3 py-3 flex-wrap">
            <MultiSelectDropdown
              label="Tipo" options={tiposOpts} selected={tiposSel}
              onChange={setTiposSel} placeholder="Tipo de imóvel"
            />
            <LocalizacaoDropdown
              cidades={cidades} bairros={bairros}
              selBairros={bairrosSel} selCidades={cidadesSel}
              onBairros={setBairrosSel} onCidades={setCidadesSel}
            />

            {/* Preço */}
            <div className="flex items-center gap-1.5">
              <input type="number" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-28 outline-none focus:border-[#B8892A] bg-white" placeholder="Preço min" value={precoMin} onChange={e => setPrecoMin(e.target.value)} />
              <span className="text-gray-400 text-xs">—</span>
              <input type="number" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-28 outline-none focus:border-[#B8892A] bg-white" placeholder="Preço max" value={precoMax} onChange={e => setPrecoMax(e.target.value)} />
            </div>

            {/* Dorms */}
            <div className="flex items-center gap-1">
              {['', '1', '2', '3', '4+'].map(d => (
                <button key={d} onClick={() => setDorms(d === '4+' ? '4' : d)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    (d === '4+' ? dorms === '4' : dorms === d) ? 'bg-[#0D2137] text-white border-[#0D2137]' : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
                  }`}>
                  {d ? `${d} 🛏` : 'Dorms'}
                </button>
              ))}
            </div>

            {/* Ordenar */}
            <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#B8892A] bg-white ml-auto" value={ordenar} onChange={e => setOrdenar(e.target.value)}>
              <option value="recente">Mais recentes</option>
              <option value="menorPreco">Menor preço</option>
              <option value="maiorPreco">Maior preço</option>
              <option value="maiorArea">Maior área</option>
            </select>

            {/* View toggle */}
            <div className="flex gap-1 border border-gray-200 rounded-xl p-1 bg-white">
              <button onClick={() => setView('grid')} title="Grid"
                className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-[#0D2137] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/></svg>
              </button>
              <button onClick={() => setView('mapa')} title="Mapa"
                className={`p-1.5 rounded-lg transition-colors text-sm ${view === 'mapa' ? 'bg-[#0D2137] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                🗺️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tags filtros ativos */}
      {temFiltro && (
        <div className="bg-white border-b border-gray-100 px-6 py-2 flex gap-2 flex-wrap items-center shrink-0 max-w-full overflow-x-auto">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider shrink-0">Filtros:</span>
          {finalidade && <Tag label={finalidade === 'Venda' ? 'Comprar' : 'Alugar'} color="blue" onRemove={() => setFinalidade('')} />}
          {tiposSel.map(t => <Tag key={t} label={t} color="indigo" onRemove={() => setTiposSel(tiposSel.filter(x => x !== t))} />)}
          {cidadesSel.map(cid => { const c = cidades.find(x => x.id === cid); return c ? <Tag key={cid} label={c.nome} color="green" onRemove={() => setCidadesSel(cidadesSel.filter(x => x !== cid))} /> : null })}
          {bairrosSel.map(bid => { const b = bairros.find(x => x.id === bid); return b ? <Tag key={bid} label={b.nome} color="green" onRemove={() => setBairrosSel(bairrosSel.filter(x => x !== bid))} /> : null })}
          {dorms && <Tag label={`${dorms}+ dorms`} color="amber" onRemove={() => setDorms('')} />}
          <button onClick={limpar} className="text-[10px] text-red-500 font-bold hover:text-red-700 border border-red-200 px-2.5 py-1 rounded-full ml-1 shrink-0">Limpar tudo</button>
        </div>
      )}

      {/* ── CORPO ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full px-0">

        {/* Sidebar filtros extras */}
        <aside className={`bg-white border-r border-gray-200 overflow-y-auto shrink-0 transition-all duration-300 ${filtrosAbertos ? 'w-56' : 'w-0 overflow-hidden'}`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Mais filtros</h3>
              {temFiltro && <button onClick={limpar} className="text-[10px] text-red-500 font-bold">Limpar</button>}
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Vagas Garagem</label>
                <div className="flex gap-1">
                  {['', '1', '2', '3+'].map(v => (
                    <button key={v} onClick={() => setVagas(v === '3+' ? '3' : v)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${(v === '3+' ? vagas === '3' : vagas === v) ? 'bg-[#0D2137] text-white border-[#0D2137]' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {v || 'Todos'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Área mínima (m²)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-amber-500" placeholder="Ex: 80" value={areaMin} onChange={e => setAreaMin(e.target.value)} />
              </div>
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barra resultados */}
          <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-3 shrink-0">
            <button onClick={() => setFiltrosAbertos(f => !f)}
              className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 flex items-center gap-1">
              {filtrosAbertos ? '◀' : '▶'} Filtros
            </button>
            <span className="text-sm text-gray-500">
              <strong className="text-gray-900 font-bold">{filtered.length}</strong> imóveis encontrados
            </span>
          </div>

          {/* GRID */}
          {view === 'grid' && (
            <div className="overflow-y-auto flex-1 p-5">
              {loading ? (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-4xl mb-3 animate-pulse">🏠</div>
                  <p className="text-sm">Carregando imóveis...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="font-medium text-gray-600 mb-1">Nenhum imóvel encontrado</p>
                  <p className="text-sm text-gray-400 mb-4">Tente ajustar os filtros de busca</p>
                  {temFiltro && <button onClick={limpar} className="text-sm text-[#B8892A] font-bold border border-[#B8892A] px-5 py-2 rounded-xl hover:bg-amber-50">Limpar filtros</button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filtered.map((im, idx) => <CardImovel key={im.id} im={im} idx={idx} />)}
                </div>
              )}
            </div>
          )}

          {/* MAPA */}
          {view === 'mapa' && (
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 relative">
                <div ref={mapRef} className="w-full h-full" />
                {!mapLoaded && <div className="absolute inset-0 flex items-center justify-center bg-gray-100"><div className="text-center text-gray-400"><div className="text-3xl mb-2 animate-pulse">🗺️</div><p className="text-sm">Carregando mapa...</p></div></div>}
              </div>
              <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
                <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                  <p className="text-xs font-bold text-gray-700">{filtered.length} imóveis no mapa</p>
                </div>
                {filtered.map((im, idx) => (
                  <div key={im.id} onClick={() => window.location.href=`/site/imoveis/${im.id}`}
                    className="flex gap-2.5 p-3 border-b border-gray-100 cursor-pointer hover:bg-amber-50 transition-colors">
                    <img src={im.foto_url||FOTOS[idx%FOTOS.length]} alt={im.titulo} className="w-16 h-12 object-cover rounded-lg shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{im.titulo}</div>
                      <div className="text-[10px] text-gray-400 truncate">📍 {im.bairro?.nome||im.cidade?.nome}</div>
                      <div className="text-xs font-bold text-[#0D2137] mt-0.5">{fmtP(im.preco,im.finalidade)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer mínimo */}
      <footer className="bg-[#0D2137] py-4 px-6 flex items-center justify-between shrink-0">
        <span className="text-white/25 text-[10px]">© 2025 VisionLar Imóveis</span>
        <a href="/adm" className="text-white/15 hover:text-white/50 transition-colors text-[10px] border border-white/10 px-2.5 py-1 rounded-lg hover:border-white/25">🔐 Adm</a>
      </footer>
    </div>
  )
}

// ── Card do imóvel ────────────────────────────────────────────────
function CardImovel({ im, idx }: { im: any; idx: number }) {
  const foto = im.foto_url || FOTOS[idx % FOTOS.length]
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
      onClick={() => window.location.href = `/site/imoveis/${im.id}`}>
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={foto} alt={im.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80"/>
          <div className="w-1.5 h-1.5 rounded-full bg-white/40"/>
          <div className="w-1.5 h-1.5 rounded-full bg-white/40"/>
        </div>
        {im.destaque && <div className="absolute top-2 right-2 bg-[#B8892A] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">★ DESTAQUE</div>}
        {im.codigo && <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{im.codigo}</div>}
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-0.5">{im.tipo}</div>
        <div className="font-bold text-lg text-gray-900 leading-tight truncate">{im.bairro?.nome || im.titulo}</div>
        <div className="text-xs text-gray-500 mb-3">{im.cidade?.nome} - {im.cidade?.estado}</div>
        {(im.area || im.dorms || im.banhs || im.vagas) && (
          <div className="flex items-center gap-0 text-xs text-gray-600 mb-4 flex-wrap">
            {im.area && <span className="after:content-['|'] after:mx-2 after:text-gray-300 last:after:content-none">{im.area}m²</span>}
            {im.dorms ? <span className="after:content-['|'] after:mx-2 after:text-gray-300 last:after:content-none">{im.dorms} {im.dorms === 1 ? 'quarto' : 'quartos'}</span> : null}
            {im.banhs ? <span className="after:content-['|'] after:mx-2 after:text-gray-300 last:after:content-none">{im.banhs} {im.banhs === 1 ? 'banheiro' : 'banheiros'}</span> : null}
            {im.vagas ? <span>{im.vagas} {im.vagas === 1 ? 'vaga' : 'vagas'}</span> : null}
          </div>
        )}
        <div className="border-t border-gray-100 pt-3 flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-400 mb-0.5">{im.finalidade === 'Venda' ? 'Comprar' : 'Alugar'}</div>
            <div className="font-bold text-xl text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              {im.preco >= 1e6 ? `R$ ${(im.preco/1e6).toFixed(1).replace('.',',')}M` : `R$ ${im.preco?.toLocaleString('pt-BR')}`}
              {im.finalidade === 'Aluguel' && <span className="text-xs text-gray-400 font-normal">/mês</span>}
            </div>
          </div>
          <a href={`https://wa.me/${WPP}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel${im.codigo ? ' código ' + im.codigo : ''}: ${im.titulo}`)}`}
            target="_blank" rel="noopener"
            onClick={e => e.stopPropagation()}
            className="bg-green-500 text-white text-[10px] font-bold px-3 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1">
            <svg width="11" height="11" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z"/></svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Tag de filtro ──────────────────────────────────────────────────
function Tag({ label, color, onRemove }: { label: string; color: string; onRemove: () => void }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-800',
  }
  return (
    <span className={`${colors[color] || colors.blue} text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0`}>
      {label}
      <button onClick={onRemove} className="hover:opacity-70 text-base leading-none">×</button>
    </span>
  )
}
