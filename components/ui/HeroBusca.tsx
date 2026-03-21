'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Dropdown multiselect igual à página de busca
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
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])

  const labels = options.filter(o => selected.includes(o.id)).map(o => o.nome)

  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <div
        className="flex flex-col justify-center h-full px-4 cursor-pointer hover:bg-gray-50/50 transition-colors rounded-lg select-none"
        onClick={() => setOpen(o => !o)}
      >
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
        <div className="flex items-center gap-1.5 min-w-0">
          {labels.length === 0
            ? <span className="text-sm text-gray-500">{placeholder}</span>
            : <>
                <span className="text-sm text-gray-800 font-medium truncate">{labels[0]}</span>
                {labels.length > 1 && (
                  <span className="bg-[#0D2137] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                    +{labels.length - 1}
                  </span>
                )}
              </>
          }
          {selected.length > 0 && (
            <button
              onClick={e => { e.stopPropagation(); onChange([]) }}
              className="ml-auto text-gray-300 hover:text-gray-600 text-lg leading-none shrink-0"
            >×</button>
          )}
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 min-w-[220px] max-h-64 overflow-y-auto">
          {options.map(opt => (
            <label key={opt.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
              <div
                onClick={() => toggle(opt.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                  selected.includes(opt.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}
              >
                {selected.includes(opt.id) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span
                onClick={() => toggle(opt.id)}
                className={`text-sm ${selected.includes(opt.id) ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
              >
                {opt.nome}
              </span>
            </label>
          ))}
          {options.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-gray-400">Nenhuma opção</div>
          )}
        </div>
      )}
    </div>
  )
}

// Dropdown de localização igual à página de busca
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
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
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
    <div className="relative flex-1 min-w-0" ref={ref}>
      <div
        className="flex flex-col justify-center h-full px-4 cursor-pointer hover:bg-gray-50/50 transition-colors rounded-lg select-none"
        onClick={() => setOpen(o => !o)}
      >
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Localização</div>
        <div className="flex items-center gap-1.5 min-w-0">
          {total === 0
            ? <span className="text-sm text-gray-500">Cidade ou bairro</span>
            : <>
                <span className="text-sm text-gray-800 font-medium truncate">{allLabels[0]}</span>
                {total > 1 && (
                  <span className="bg-[#0D2137] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                    +{total - 1}
                  </span>
                )}
              </>
          }
          {total > 0 && (
            <button
              onClick={e => { e.stopPropagation(); onBairros([]); onCidades([]) }}
              className="ml-auto text-gray-300 hover:text-gray-600 text-lg leading-none shrink-0"
            >×</button>
          )}
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 min-w-[300px] max-h-72 overflow-y-auto">
          {cidades.map(c => {
            const bairrosCidade = bairros.filter(b => b.cidade_id === c.id)
            return (
              <div key={c.id}>
                <div className="sticky top-0 bg-gray-50 px-4 py-1.5 flex items-center gap-2 border-b border-gray-100">
                  <div
                    onClick={() => toggleC(c.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                      selCidades.includes(c.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}
                  >
                    {selCidades.includes(c.id) && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span
                    onClick={() => toggleC(c.id)}
                    className={`text-xs font-bold uppercase tracking-wider cursor-pointer ${selCidades.includes(c.id) ? 'text-blue-600' : 'text-gray-500'}`}
                  >
                    {c.nome} - {c.estado}
                  </span>
                </div>
                {bairrosCidade.map(b => (
                  <label key={b.id} className="flex items-center gap-3 pl-10 pr-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                    <div
                      onClick={() => toggleB(b.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        selBairros.includes(b.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}
                    >
                      {selBairros.includes(b.id) && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span
                      onClick={() => toggleB(b.id)}
                      className={`text-sm ${selBairros.includes(b.id) ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                    >
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

export default function HeroBusca() {
  const router = useRouter()
  const [finalidade, setFinalidade] = useState('')
  const [tiposSel, setTiposSel] = useState<string[]>([])
  const [bairrosSel, setBairrosSel] = useState<string[]>([])
  const [cidadesSel, setCidadesSel] = useState<string[]>([])
  const [cidades, setCidades] = useState<any[]>([])
  const [bairros, setBairros] = useState<any[]>([])
  const [tipos, setTipos] = useState<any[]>([])

  useEffect(() => {
    supabase.from('cidades').select('*').order('nome').then(r => setCidades(r.data || []))
    supabase.from('bairros').select('*').order('nome').then(r => setBairros(r.data || []))
    supabase.from('tipos_imovel').select('*').order('nome').then(r => setTipos(r.data || []))
  }, [])

  function buscar() {
    const params = new URLSearchParams()
    if (finalidade) params.set('finalidade', finalidade)
    if (tiposSel.length > 0) params.set('tipos', tiposSel.join(','))
    if (cidadesSel.length > 0) params.set('cidades', cidadesSel.join(','))
    if (bairrosSel.length > 0) params.set('bairros', bairrosSel.join(','))
    const query = params.toString()
    router.push(`/site/imoveis${query ? '?' + query : ''}`)
  }

  const tiposOpts = tipos.map(t => ({ id: t.nome, nome: t.nome }))
  const temSelecao = finalidade || tiposSel.length > 0 || cidadesSel.length > 0 || bairrosSel.length > 0

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
      {/* Tabs Comprar / Alugar */}
      <div className="flex border-b border-gray-100">
        {[['', 'Comprar ou Alugar'], ['Venda', 'Comprar'], ['Aluguel', 'Alugar']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFinalidade(val)}
            className={`px-6 py-3 text-xs font-bold border-b-[3px] transition-all ${
              finalidade === val
                ? 'border-[#B8892A] text-[#B8892A]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Dropdowns */}
      <div className="flex items-stretch h-16 divide-x divide-gray-100">
        <MultiSelectDropdown
          label="Tipo de imóvel"
          options={tiposOpts}
          selected={tiposSel}
          onChange={setTiposSel}
          placeholder="Todos os imóveis"
        />

        <LocalizacaoDropdown
          cidades={cidades}
          bairros={bairros}
          selBairros={bairrosSel}
          selCidades={cidadesSel}
          onBairros={setBairrosSel}
          onCidades={setCidadesSel}
        />

        {/* Botão buscar */}
        <div className="flex items-center px-4 shrink-0">
          <button
            onClick={buscar}
            className="btn-gold px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap hover:scale-105 transition-transform"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            {temSelecao ? 'Ver imóveis' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Tags selecionadas */}
      {temSelecao && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-1.5 flex-wrap items-center">
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mr-1">Filtros:</span>
          {finalidade && (
            <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              {finalidade === 'Venda' ? 'Comprar' : 'Alugar'}
              <button onClick={() => setFinalidade('')} className="hover:text-blue-900 ml-0.5">×</button>
            </span>
          )}
          {tiposSel.map(t => (
            <span key={t} className="bg-indigo-100 text-indigo-700 text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              {t}
              <button onClick={() => setTiposSel(tiposSel.filter(x => x !== t))} className="hover:text-indigo-900">×</button>
            </span>
          ))}
          {cidadesSel.map(cid => {
            const c = cidades.find(x => x.id === cid)
            return c ? (
              <span key={cid} className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                {c.nome}
                <button onClick={() => setCidadesSel(cidadesSel.filter(x => x !== cid))}>×</button>
              </span>
            ) : null
          })}
          {bairrosSel.map(bid => {
            const b = bairros.find(x => x.id === bid)
            const c = b ? cidades.find(x => x.id === b.cidade_id) : null
            return b ? (
              <span key={bid} className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                {b.nome}{c ? `, ${c.nome}` : ''}
                <button onClick={() => setBairrosSel(bairrosSel.filter(x => x !== bid))}>×</button>
              </span>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}
