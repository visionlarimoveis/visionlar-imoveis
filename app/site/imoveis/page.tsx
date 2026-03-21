'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'
const FOTO_DEFAULT = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80'
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

// Checkbox multi-select genérico
function MultiSelectDropdown({
  label, options, selected, onChange, placeholder
}: {
  label: string
  options: { id: string; nome: string }[]
  selected: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])

  const labels = options.filter(o => selected.includes(o.id)).map(o => o.nome)

  return (
    <div className="relative flex-1 min-w-0 border-r border-gray-200 last:border-r-0" ref={ref}>
      <div className="h-full flex flex-col justify-center px-5 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => setOpen(o => !o)}>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
        <div className="flex items-center gap-1.5 min-w-0">
          {labels.length === 0
            ? <span className="text-sm text-gray-500">{placeholder}</span>
            : <>
                <span className="text-sm text-gray-800 font-medium truncate">{labels[0]}</span>
                {labels.length > 1 && <span className="bg-[#0D2137] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">+{labels.length - 1}</span>}
              </>
          }
          {selected.length > 0 &&
            <button onClick={e => { e.stopPropagation(); onChange([]) }} className="ml-auto text-gray-300 hover:text-gray-600 text-lg leading-none shrink-0">×</button>
          }
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 min-w-[240px] max-h-72 overflow-y-auto">
          {options.map(opt => (
            <label key={opt.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
              <div onClick={() => toggle(opt.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selected.includes(opt.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                {selected.includes(opt.id) &&
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                }
              </div>
              <span onClick={() => toggle(opt.id)}
                className={`text-sm ${selected.includes(opt.id) ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                {opt.nome}
              </span>
            </label>
          ))}
          {options.length === 0 && <div className="px-4 py-6 text-center text-xs text-gray-400">Nenhuma opção</div>}
        </div>
      )}
    </div>
  )
}

// Localização — bairros agrupados por cidade com checkboxes
function LocalizacaoDropdown({
  cidades, bairros, selBairros, selCidades, onBairros, onCidades
}: {
  cidades: any[]; bairros: any[]
  selBairros: string[]; selCidades: string[]
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
    ...cidades.filter(c => selCidades.includes(c.id)).map(c => `${c.nome} - ${c.estado}`),
    ...bairros.filter(b => selBairros.includes(b.id)).map(b => {
      const c = cidades.find(x => x.id === b.cidade_id)
      return `${b.nome}${c ? `, ${c.nome}` : ''}`
    }),
  ]

  const toggleB = (id: string) => onBairros(selBairros.includes(id) ? selBairros.filter(x => x !== id) : [...selBairros, id])
  const toggleC = (id: string) => onCidades(selCidades.includes(id) ? selCidades.filter(x => x !== id) : [...selCidades, id])

  return (
    <div className="relative flex-1 min-w-0 border-r border-gray-200" ref={ref}>
      <div className="h-full flex flex-col justify-center px-5 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => setOpen(o => !o)}>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Localização</div>
        <div className="flex items-center gap-1.5 min-w-0">
          {total === 0
            ? <span className="text-sm text-gray-500">Cidade ou bairro</span>
            : <>
                <span className="text-sm text-gray-800 font-medium truncate">{allLabels[0]}</span>
                {total > 1 && <span className="bg-[#0D2137] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">+{total - 1}</span>}
              </>
          }
          {total > 0 &&
            <button onClick={e => { e.stopPropagation(); onBairros([]); onCidades([]) }} className="ml-auto text-gray-300 hover:text-gray-600 text-lg leading-none shrink-0">×</button>
          }
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 min-w-[320px] max-h-80 overflow-y-auto">
          {cidades.map(c => {
            const bairrosCidade = bairros.filter(b => b.cidade_id === c.id)
            return (
              <div key={c.id}>
                {/* Cidade */}
                <div className="sticky top-0 bg-gray-50 px-4 py-1.5 flex items-center gap-2 border-b border-gray-100">
                  <div onClick={() => toggleC(c.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${selCidades.includes(c.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {selCidades.includes(c.id) &&
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    }
                  </div>
                  <span onClick={() => toggleC(c.id)}
                    className={`text-xs font-bold uppercase tracking-wider cursor-pointer ${selCidades.includes(c.id) ? 'text-blue-600' : 'text-gray-500'}`}>
                    {c.nome} - {c.estado}
                  </span>
                </div>
                {/* Bairros desta cidade */}
                {bairrosCidade.map(b => (
                  <label key={b.id} className="flex items-center gap-3 pl-10 pr-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                    <div onClick={() => toggleB(b.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selBairros.includes(b.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                      {selBairros.includes(b.id) &&
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      }
                    </div>
                    <span onClick={() => toggleB(b.id)}
                      className={`text-sm ${selBairros.includes(b.id) ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                      {b.nome}, {c.nome} - {c.estado}
                    </span>
                  </label>
                ))}
                {bairrosCidade.length === 0 && (
                  <div className="pl-10 pr-4 py-2 text-xs text-gray-300 italic">Nenhum bairro cadastrado</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function BuscaImoveisPage() {
  const [imoveis, setImoveis] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [cidades, setCidades] = useState<any[]>([])
  const [bairros, setBairros] = useState<any[]>([])
  const [tipos, setTipos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'lista' | 'mapa'>('lista')
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
    const { data } = await supabase
      .from('imoveis')
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

  // Mapa Leaflet
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
      mk.on('click', () => setSelected(im))
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
      {/* NAV */}
      <nav className="bg-[#0D2137] h-14 px-6 flex items-center justify-between sticky top-0 z-50 shadow-lg shrink-0">
        <Link href="/site">
          <Image src="/logo.png" alt="VisionLar" width={110} height={40} className="object-contain" />
        </Link>
        <div className="hidden md:flex gap-6">
          {[['Home','/site'],['Imóveis','/site/imoveis'],['Contato','/site#contato']].map(([l,h]) => (
            <Link key={l} href={h} className="text-white/60 hover:text-[#D4A843] text-xs font-medium transition-colors">{l}</Link>
          ))}
        </div>
        <a href={`https://wa.me/${WPP}`} target="_blank" rel="noopener"
          className="bg-[#B8892A] text-[#0D2137] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#D4A843] transition-colors">
          📲 WhatsApp
        </a>
      </nav>

      {/* BARRA DE BUSCA ESTILO BORBA */}
      <div className="bg-white shadow-sm shrink-0 border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          {/* Tabs Comprar / Alugar */}
          <div className="flex">
            {[['', 'Todos'], ['Venda', 'Comprar'], ['Aluguel', 'Alugar']].map(([val, label]) => (
              <button key={val} onClick={() => setFinalidade(val)}
                className={`px-7 py-3.5 text-sm font-semibold border-b-[3px] transition-all ${
                  finalidade === val ? 'border-[#B8892A] text-[#B8892A]' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}>{label}
              </button>
            ))}
          </div>

          {/* Dropdowns */}
          <div className="flex items-stretch h-[68px] border-t border-gray-100">
            <MultiSelectDropdown
              label="Tipo de imóvel"
              options={tiposOpts}
              selected={tiposSel}
              onChange={setTiposSel}
              placeholder="Todos os imóveis"
            />
            <LocalizacaoDropdown
              cidades={cidades} bairros={bairros}
              selBairros={bairrosSel} selCidades={cidadesSel}
              onBairros={setBairrosSel} onCidades={setCidadesSel}
            />
            {/* Botão buscar */}
            <div className="flex items-center px-5 shrink-0">
              <div className="bg-[#0D2137] text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-md cursor-default">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TAGS FILTROS ATIVOS */}
      {temFiltro && (
        <div className="bg-white border-b border-gray-100 px-6 py-2 flex gap-2 flex-wrap items-center shrink-0">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">Filtros ativos:</span>
          {finalidade && (
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              {finalidade === 'Venda' ? 'Comprar' : 'Alugar'}
              <button onClick={() => setFinalidade('')}>×</button>
            </span>
          )}
          {tiposSel.map(t => (
            <span key={t} className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              {t}<button onClick={() => setTiposSel(tiposSel.filter(x => x !== t))}>×</button>
            </span>
          ))}
          {cidadesSel.map(cid => {
            const c = cidades.find(x => x.id === cid)
            return c ? (
              <span key={cid} className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                {c.nome} - {c.estado}<button onClick={() => setCidadesSel(cidadesSel.filter(x => x !== cid))}>×</button>
              </span>
            ) : null
          })}
          {bairrosSel.map(bid => {
            const b = bairros.find(x => x.id === bid)
            const c = b ? cidades.find(x => x.id === b.cidade_id) : null
            return b ? (
              <span key={bid} className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                {b.nome}{c ? `, ${c.nome}` : ''}<button onClick={() => setBairrosSel(bairrosSel.filter(x => x !== bid))}>×</button>
              </span>
            ) : null
          })}
          <button onClick={limpar} className="text-[10px] text-red-500 font-bold hover:text-red-700 ml-1 border border-red-200 px-2.5 py-1 rounded-full">
            Limpar todos
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR FILTROS */}
        <aside className={`bg-white border-r border-gray-200 overflow-y-auto shrink-0 transition-all duration-300 ${filtrosAbertos ? 'w-60' : 'w-0 overflow-hidden'}`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Mais filtros</h3>
              {temFiltro && <button onClick={limpar} className="text-[10px] text-red-500 font-bold">Limpar</button>}
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Faixa de Preço (R$)</label>
                <div className="flex gap-1.5">
                  <input type="number" className="w-1/2 border border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:border-blue-400" placeholder="Mínimo" value={precoMin} onChange={e => setPrecoMin(e.target.value)} />
                  <input type="number" className="w-1/2 border border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:border-blue-400" placeholder="Máximo" value={precoMax} onChange={e => setPrecoMax(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Dormitórios</label>
                <div className="flex gap-1">
                  {['','1','2','3','4+'].map(d => (
                    <button key={d} onClick={() => setDorms(d === '4+' ? '4' : d)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${(d==='4+'?dorms==='4':dorms===d)?'bg-[#0D2137] text-white border-[#0D2137]':'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {d || 'Todos'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Vagas Garagem</label>
                <div className="flex gap-1">
                  {['','1','2','3+'].map(v => (
                    <button key={v} onClick={() => setVagas(v === '3+' ? '3' : v)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${(v==='3+'?vagas==='3':vagas===v)?'bg-[#0D2137] text-white border-[#0D2137]':'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {v || 'Todos'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Área mínima (m²)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-blue-400" placeholder="Ex: 80" value={areaMin} onChange={e => setAreaMin(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Ordenar por</label>
                <select className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs outline-none bg-white focus:border-blue-400" value={ordenar} onChange={e => setOrdenar(e.target.value)}>
                  <option value="recente">Mais recentes</option>
                  <option value="menorPreco">Menor preço</option>
                  <option value="maiorPreco">Maior preço</option>
                  <option value="maiorArea">Maior área</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setFiltrosAbertos(f => !f)}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50">
                {filtrosAbertos ? '◀ Ocultar' : '▶ Filtros'}
              </button>
              <span className="text-xs text-gray-500">
                <strong className="text-gray-900">{filtered.length}</strong> imóveis encontrados
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setView('lista')} title="Lista"
                className={`p-1.5 rounded-lg transition-colors ${view==='lista'?'bg-[#0D2137] text-white':'text-gray-400 hover:bg-gray-100'}`}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z"/></svg>
              </button>
              <button onClick={() => setView('mapa')} title="Mapa"
                className={`p-1.5 rounded-lg transition-colors text-sm ${view==='mapa'?'bg-[#0D2137] text-white':'text-gray-400 hover:bg-gray-100'}`}>
                🗺️
              </button>
            </div>
          </div>

          {/* LISTA */}
          {view === 'lista' && (
            <div className="overflow-y-auto flex-1 p-4">
              {loading ? (
                <div className="text-center py-16 text-gray-400"><div className="text-3xl mb-3 animate-pulse">🏠</div><p className="text-sm">Carregando...</p></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm font-medium">Nenhum imóvel encontrado</p>
                  {temFiltro && <button onClick={limpar} className="mt-3 text-xs text-[#B8892A] font-bold border border-[#B8892A] px-4 py-1.5 rounded-lg hover:bg-amber-50">Limpar filtros</button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((im, idx) => <CardImovel key={im.id} im={im} idx={idx} onSelect={setSelected} />)}
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
                  <div key={im.id} onClick={() => setSelected(im)}
                    className={`flex gap-2.5 p-3 border-b border-gray-100 cursor-pointer hover:bg-amber-50 transition-colors ${selected?.id===im.id?'bg-amber-50 border-l-2 border-l-[#B8892A]':''}`}>
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

      {/* MODAL DETALHES */}
      {selected && (
        <div className="fixed inset-0 bg-gray-900/70 z-[200] flex items-center justify-center p-4 backdrop-blur-sm" onClick={e=>{if(e.target===e.currentTarget)setSelected(null)}}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <img src={selected.foto_url||FOTO_DEFAULT} alt={selected.titulo} className="w-full h-52 object-cover rounded-t-2xl" />
            <div className="p-5">
              <div className="flex gap-2 mb-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selected.finalidade==='Venda'?'bg-indigo-50 text-indigo-700':'bg-emerald-50 text-emerald-700'}`}>{selected.finalidade}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{selected.tipo}</span>
                {selected.destaque&&<span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">★ DESTAQUE</span>}
              </div>
              <div className="font-bold text-2xl text-[#0D2137]" style={{fontFamily:'Playfair Display,serif'}}>{fmtP(selected.preco,selected.finalidade)}</div>
              <div className="text-xs font-semibold text-gray-800 mt-1">{selected.titulo}</div>
              <div className="text-xs text-gray-400 mt-0.5 mb-3">📍 {selected.bairro?.nome?`${selected.bairro.nome}, `:''}{selected.cidade?.nome} - {selected.cidade?.estado}</div>
              <div className="flex gap-4 py-3 border-t border-b border-gray-100 mb-3 flex-wrap">
                {selected.area?<div className="text-center"><div className="text-sm font-bold">{selected.area}m²</div><div className="text-[9px] text-gray-400">Área</div></div>:null}
                {selected.dorms?<div className="text-center"><div className="text-sm font-bold">{selected.dorms}</div><div className="text-[9px] text-gray-400">Dorms</div></div>:null}
                {selected.suites?<div className="text-center"><div className="text-sm font-bold">{selected.suites}</div><div className="text-[9px] text-gray-400">Suítes</div></div>:null}
                {selected.banhs?<div className="text-center"><div className="text-sm font-bold">{selected.banhs}</div><div className="text-[9px] text-gray-400">Banhs</div></div>:null}
                {selected.vagas?<div className="text-center"><div className="text-sm font-bold">{selected.vagas}</div><div className="text-[9px] text-gray-400">Vagas</div></div>:null}
              </div>
              {selected.descricao&&<p className="text-xs text-gray-500 leading-relaxed mb-4">{selected.descricao}</p>}
              <div className="flex gap-2">
                <a href={`https://wa.me/${WPP}?text=${encodeURIComponent(`Olá! Tenho interesse: ${selected.titulo}`)}`} target="_blank" rel="noopener"
                  className="flex-1 bg-green-500 text-white text-xs font-bold py-2.5 rounded-xl text-center hover:bg-green-600 transition-colors">
                  📲 Falar pelo WhatsApp
                </a>
                <button onClick={()=>setSelected(null)} className="border border-gray-200 text-xs px-4 py-2.5 rounded-xl hover:bg-gray-50">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CardImovel({ im, idx, onSelect }: { im: any; idx: number; onSelect: (i: any) => void }) {
  const foto = im.foto_url || FOTOS[idx % FOTOS.length]
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
      onClick={() => onSelect(im)}
    >
      {/* FOTO com carousel dots decorativos */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={foto}
          alt={im.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Dots estilo Borba */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white opacity-90"></div>
          <div className="w-2 h-2 rounded-full bg-white/40"></div>
          <div className="w-2 h-2 rounded-full bg-white/40"></div>
        </div>
        {/* Badge destaque */}
        {im.destaque && (
          <div className="absolute top-3 right-3 bg-[#B8892A] text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md">
            ★ DESTAQUE
          </div>
        )}
      </div>

      {/* CORPO DO CARD — igual ao Borba */}
      <div className="p-4">

        {/* Linha 1: badge tipo mobiliado (se tiver) + finalidade */}
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] font-semibold ${im.finalidade === 'Aluguel' ? 'text-emerald-600' : 'text-gray-400'}`}>
            {im.finalidade === 'Aluguel' ? '🏠 Para alugar' : ''}
          </span>
        </div>

        {/* Linha 2: Tipo de imóvel (ex: Apartamento) */}
        <div className="text-xs text-gray-500 mb-0.5">{im.tipo}</div>

        {/* Linha 3: BAIRRO em negrito grande — destaque principal */}
        <div className="font-bold text-lg text-gray-900 leading-tight mb-0.5 truncate">
          {im.bairro?.nome || im.titulo}
        </div>

        {/* Linha 4: Cidade - Estado */}
        <div className="text-xs text-gray-500 mb-3">
          {im.cidade?.nome} - {im.cidade?.estado}
        </div>

        {/* Linha 5: Especificações — m², quartos, banheiros, vagas */}
        {(im.area || im.dorms || im.banhs || im.vagas) && (
          <div className="flex items-center gap-0 text-xs text-gray-600 mb-4 flex-wrap">
            {im.area && (
              <span className="flex items-center gap-1 after:content-['|'] after:mx-2 after:text-gray-300 last:after:content-none">
                {im.area}m²
              </span>
            )}
            {im.dorms ? (
              <span className="flex items-center gap-1 after:content-['|'] after:mx-2 after:text-gray-300 last:after:content-none">
                {im.dorms} {im.dorms === 1 ? 'quarto' : 'quartos'}
              </span>
            ) : null}
            {im.banhs ? (
              <span className="flex items-center gap-1 after:content-['|'] after:mx-2 after:text-gray-300 last:after:content-none">
                {im.banhs} {im.banhs === 1 ? 'banheiro' : 'banheiros'}
              </span>
            ) : null}
            {im.vagas ? (
              <span className="flex items-center gap-1 last:after:content-none">
                {im.vagas} {im.vagas === 1 ? 'vaga' : 'vagas'}
              </span>
            ) : null}
          </div>
        )}

        {/* Divisor */}
        <div className="border-t border-gray-100 pt-3">
          {/* Linha 6: Comprar / Alugar label + Preço */}
          <div className="text-xs font-semibold text-gray-500 mb-0.5">
            {im.finalidade === 'Venda' ? 'Comprar' : 'Alugar'}
          </div>
          <div className="flex items-end justify-between">
            <div className="font-bold text-xl text-gray-900">
              {im.preco >= 1e6
                ? `R$ ${(im.preco / 1e6).toFixed(1).replace('.', ',')}M`
                : `R$ ${im.preco?.toLocaleString('pt-BR')}`}
              {im.finalidade === 'Aluguel' && <span className="text-xs text-gray-400 font-normal">/mês</span>}
            </div>
            {/* Botão WhatsApp */}
            <a
              href={`https://wa.me/${WPP}?text=${encodeURIComponent(`Tenho interesse: ${im.titulo} — ${im.bairro?.nome || ''}, ${im.cidade?.nome}`)}`}
              target="_blank"
              rel="noopener"
              onClick={e => e.stopPropagation()}
              className="bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
            >
              <svg width="11" height="11" fill="white" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
