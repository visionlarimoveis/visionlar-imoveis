'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'
const FOTOS_DEMO = [
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=90',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=85',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=85',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=85',
]

function fmtPreco(p: number) {
  if (!p) return '—'
  return `R$ ${p.toLocaleString('pt-BR')}`
}
function fmtPCurto(p: number, f: string) {
  const v = p >= 1e6 ? `R$ ${(p/1e6).toFixed(1).replace('.',',')}M` : `R$ ${(p/1000).toFixed(0)}k`
  return f === 'Aluguel' ? `${v}/mês` : v
}

export default function ImovelPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [imovel, setImovel] = useState<any>(null)
  const [similares, setSimilares] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [galeria, setGaleria] = useState<string[]>([])
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [showMapa, setShowMapa] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('imoveis')
        .select('*, cidade:cidades(id,nome,estado), bairro:bairros(id,nome), corretor:corretores(id,nome,creci,telefone)')
        .eq('id', id).single()
      if (!data) { router.push('/site/imoveis'); return }
      setImovel(data)
      const fotos: string[] = []
      if (data.foto_url) fotos.push(data.foto_url)
      if (data.fotos?.length) fotos.push(...data.fotos)
      while (fotos.length < 6) fotos.push(FOTOS_DEMO[fotos.length % FOTOS_DEMO.length])
      setGaleria(fotos)
      const { data: sim } = await supabase.from('imoveis')
        .select('*, cidade:cidades(nome,estado), bairro:bairros(nome)')
        .eq('status','Ativo').eq('tipo',data.tipo).eq('cidade_id',data.cidade_id).neq('id',id).limit(4)
      setSimilares(sim || [])
      setLoading(false)
    }
    load()
  }, [id, router])

  // Lock body scroll quando lightbox aberto
  useEffect(() => {
    if (lightboxIdx !== null) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [lightboxIdx])

  // Teclado
  useEffect(() => {
    if (lightboxIdx === null) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setLightboxIdx(i => i !== null ? Math.max(0, i-1) : null)
      if (e.key === 'ArrowRight') setLightboxIdx(i => i !== null ? Math.min(galeria.length-1, i+1) : null)
      if (e.key === 'Escape') setLightboxIdx(null)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [lightboxIdx, galeria.length])

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-gray-400"><div className="text-4xl mb-3 animate-pulse">🏠</div><p className="text-sm">Carregando...</p></div>
    </div>
  )
  if (!imovel) return null

  const wppMsg = `Olá! Vi o imóvel${imovel.codigo ? ` código ${imovel.codigo}` : ''}: ${imovel.titulo} — ${imovel.cidade?.nome || ''} e gostaria de mais informações.`
  const wppLink = `https://wa.me/${WPP}?text=${encodeURIComponent(wppMsg)}`

  const specs = [
    imovel.area && { label:'Área total', value:`${imovel.area} m²`, icon:'📐' },
    imovel.dorms && { label:'Quartos', value:imovel.dorms, icon:'🛏' },
    imovel.suites && { label:'Suítes', value:imovel.suites, icon:'🛁' },
    imovel.banhs && { label:'Banheiros', value:imovel.banhs, icon:'🚿' },
    imovel.vagas && { label:'Vagas', value:imovel.vagas, icon:'🚗' },
    imovel.condominio>0 && { label:'Condomínio', value:`R$ ${imovel.condominio?.toLocaleString('pt-BR')}/mês`, icon:'🏢' },
  ].filter(Boolean) as any[]

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* NAV */}
        <nav className="bg-[#0D2137] sticky top-0 z-40 shadow-lg" style={{height:"64px",overflow:"hidden"}}>
          <div className="h-full px-6 flex items-center justify-between">
            <Link href="/site/imoveis">
              <Image src="/logo.png" alt="VisionLar" width={130} height={44} className="object-contain" />
            </Link>
            <div className="hidden md:flex gap-1">
              {([['Imóveis','/site/imoveis'],['Institucional','/site/institucional'],['Contato','/site/contato']] as [string,string][]).map(([l,h])=>(
                <Link key={l} href={h} className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all">{l}</Link>
              ))}
            </div>
            <a href={wppLink} target="_blank" rel="noopener"
              className="bg-[#B8892A] text-[#0D2137] px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#D4A843] transition-colors flex items-center gap-1.5">
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z"/></svg>
              WhatsApp
            </a>
          </div>
        </nav>

        {/* BREADCRUMB */}
        <div className="bg-white border-b border-gray-100 px-6 py-2">
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-[11px] text-gray-400 flex-wrap">
            <Link href="/site/imoveis" className="hover:text-[#B8892A]">Imóveis</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium truncate max-w-xs">{imovel.titulo}</span>
            {imovel.codigo && <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono text-[10px]">Cód. {imovel.codigo}</span>}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-5">
          {/* GALERIA */}
          <div className="rounded-2xl overflow-hidden mb-6" style={{height:'480px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3px'}}>
            {/* Foto principal */}
            <div className="relative overflow-hidden cursor-pointer group bg-gray-200"
              style={{gridRow:'1 / span 3'}}
              onClick={() => openLightbox(0)}>
              <img src={galeria[0]} alt={imovel.titulo}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                onError={e => {(e.target as any).src=FOTOS_DEMO[0]}}/>
              {/* Botões */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  onClick={e => { e.stopPropagation(); openLightbox(0) }}
                  className="bg-black/65 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-black/80 transition-colors">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Fotos ({galeria.length})
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setShowMapa(m => !m) }}
                  className="bg-black/65 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-black/80 transition-colors">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Mapa
                </button>
              </div>
            </div>
            {/* 3 fotos pequenas */}
            {[1,2,3].map(i => (
              <div key={i} className="relative overflow-hidden cursor-pointer group bg-gray-200"
                onClick={() => openLightbox(i)}>
                <img src={galeria[i]||FOTOS_DEMO[i]} alt={`Foto ${i+1}`}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  onError={e => {(e.target as any).src=FOTOS_DEMO[i%FOTOS_DEMO.length]}}/>
                {i===3 && galeria.length>4 && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center hover:bg-black/65 transition-colors">
                    <span className="text-white font-bold text-lg">+ Ver mais</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* MAPA INLINE */}
          {showMapa && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{height:'280px'}}>
              <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(`${imovel.bairro?.nome||''} ${imovel.cidade?.nome} ${imovel.cidade?.estado}`)}&output=embed`}
                width="100%" height="280" style={{border:0}} allowFullScreen loading="lazy"/>
            </div>
          )}

          {/* GRID 2 colunas */}
          <div className="grid grid-cols-[1fr,340px] gap-6">
            <div>
              {/* Header */}
              <div className="bg-white rounded-2xl p-5 mb-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{imovel.titulo}</h1>
                    <div className="text-sm text-gray-500 mt-0.5">📍 {imovel.bairro?.nome&&`${imovel.bairro.nome} — `}{imovel.cidade?.nome} - {imovel.cidade?.estado}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {imovel.codigo&&<span className="bg-[#0D2137] text-white text-[10px] font-bold px-3 py-1.5 rounded-full">Código {imovel.codigo}</span>}
                    {imovel.destaque&&<span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full">⭐ Destaque</span>}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 font-medium mb-1">{imovel.finalidade==='Venda'?'Comprar':'Alugar'}</div>
                  <div className="font-bold text-4xl text-gray-900" style={{fontFamily:'Playfair Display,serif'}}>
                    {fmtPreco(imovel.preco)}{imovel.finalidade==='Aluguel'&&<span className="text-lg text-gray-400 font-normal">/mês</span>}
                  </div>
                  {imovel.condominio>0&&<div className="text-xs text-gray-400 mt-1">+ Condomínio: R$ {imovel.condominio?.toLocaleString('pt-BR')}/mês</div>}
                </div>
              </div>
              {/* Specs */}
              {specs.length>0&&(
                <div className="bg-white rounded-2xl p-5 mb-4 border border-gray-100 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-4 text-sm">Características</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {specs.map((s:any)=>(
                      <div key={s.label} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl text-center">
                        <div className="text-2xl mb-1.5">{s.icon}</div>
                        <div className="font-bold text-gray-900 text-sm">{s.value}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Descrição */}
              {imovel.descricao&&(
                <div className="bg-white rounded-2xl p-5 mb-4 border border-gray-100 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-3">Descrição</h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{imovel.descricao}</p>
                </div>
              )}
              {/* Comodidades */}
              {imovel.comodidades?.length>0&&(
                <div className="bg-white rounded-2xl p-5 mb-4 border border-gray-100 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-4">Comodidades do imóvel</h2>
                  <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                    {imovel.comodidades.map((c:string)=>(
                      <div key={c} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Coluna direita — sticky */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm sticky top-20">
                <h3 className="font-bold text-gray-900 mb-1 text-sm">Interessado neste imóvel?</h3>
                <p className="text-xs text-gray-400 mb-4">Entre em contato pelo WhatsApp.</p>
                <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Mensagem</div>
                  <p className="text-xs text-gray-700 leading-relaxed">{wppMsg}</p>
                </div>
                <a href={wppLink} target="_blank" rel="noopener"
                  className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-md">
                  <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z"/></svg>
                  Enviar pelo WhatsApp
                </a>
                {imovel.corretor&&(
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0D2137] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {imovel.corretor.nome.split(' ').slice(0,2).map((n:string)=>n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-400">Corretor responsável</div>
                      <div className="text-sm font-bold text-gray-900 truncate">{imovel.corretor.nome}</div>
                      {imovel.corretor.creci&&<div className="text-[10px] text-gray-400">CRECI: {imovel.corretor.creci}</div>}
                    </div>
                    {imovel.corretor.telefone&&(
                      <a href={`https://wa.me/55${imovel.corretor.telefone.replace(/\D/g,'')}`} target="_blank" rel="noopener"
                        className="bg-green-500 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shrink-0">
                        <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z"/></svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-[#0D2137] rounded-2xl p-4 text-center">
                <div className="text-white/60 text-xs mb-2">Tem um imóvel para vender?</div>
                <a href={`https://wa.me/${WPP}?text=${encodeURIComponent('Olá! Gostaria de anunciar meu imóvel com a VisionLar.')}`} target="_blank" rel="noopener"
                  className="inline-block bg-[#B8892A] text-[#0D2137] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#D4A843]">Anuncie conosco</a>
              </div>
            </div>
          </div>

          {/* Similares */}
          {similares.length>0&&(
            <div className="mt-10">
              <h2 className="font-bold text-xl text-[#0D2137] mb-5" style={{fontFamily:'Playfair Display,serif'}}>
                Imóveis <span className="text-[#B8892A]">similares</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {similares.map((s,idx)=>(
                  <Link key={s.id} href={`/site/imoveis/${s.id}`}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group">
                    <div className="relative h-36 overflow-hidden bg-gray-100">
                      <img src={s.foto_url||FOTOS_DEMO[idx%FOTOS_DEMO.length]} alt={s.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e=>{(e.target as any).src=FOTOS_DEMO[0]}}/>
                      <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${s.finalidade==='Venda'?'bg-indigo-600 text-white':'bg-emerald-600 text-white'}`}>{s.finalidade}</span>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] text-gray-400">{s.tipo}</div>
                      <div className="text-xs font-bold text-gray-900 mt-0.5 truncate">{s.bairro?.nome||s.titulo}</div>
                      <div className="text-[10px] text-gray-400">{s.cidade?.nome} - {s.cidade?.estado}</div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="text-[9px] text-gray-400">{s.finalidade==='Venda'?'Comprar':'Alugar'}</div>
                        <div className="font-bold text-sm text-gray-900">{fmtPCurto(s.preco,s.finalidade)}</div>
                        {s.codigo&&<div className="text-[9px] text-gray-400 mt-0.5">Cód. {s.codigo}</div>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <footer className="bg-[#0D2137] mt-12 py-4 px-6 flex items-center justify-between">
          <span className="text-white/25 text-[10px]">© 2025 VisionLar Imóveis</span>
          <a href="/adm" className="text-white/15 hover:text-white/50 text-[10px] border border-white/10 px-2.5 py-1 rounded-lg">🔐 Adm</a>
        </footer>
      </div>

      {/* ═══════════════════════════════════════════════════
          LIGHTBOX — renderizado fora do fluxo normal
          usando portal via div fixo com z-[9999]
      ═══════════════════════════════════════════════════ */}
      {lightboxIdx !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.97)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={() => setLightboxIdx(null)}
        >
          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',flexShrink:0}}
            onClick={e => e.stopPropagation()}>
            <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px'}}>{imovel.titulo}</div>
            <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
              <span style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>{lightboxIdx+1} / {galeria.length}</span>
              <button onClick={() => setLightboxIdx(null)}
                style={{color:'rgba(255,255,255,0.5)',fontSize:'24px',background:'none',border:'none',cursor:'pointer',lineHeight:1}}>✕</button>
            </div>
          </div>

          {/* Foto */}
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',padding:'0 60px'}}
            onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxIdx(i => i!==null ? Math.max(0,i-1) : null)}
              disabled={lightboxIdx === 0}
              style={{position:'absolute',left:'8px',top:'50%',transform:'translateY(-50%)',width:'44px',height:'44px',borderRadius:'50%',background:'rgba(255,255,255,0.15)',color:'white',fontSize:'24px',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:lightboxIdx===0?0.2:1}}
            >‹</button>

            <img
              key={lightboxIdx}
              src={galeria[lightboxIdx]}
              alt={`Foto ${lightboxIdx+1}`}
              style={{maxWidth:'100%',maxHeight:'70vh',objectFit:'contain',borderRadius:'12px',boxShadow:'0 25px 60px rgba(0,0,0,0.5)'}}
              onError={e => {(e.target as any).src=FOTOS_DEMO[0]}}
            />

            <button
              onClick={() => setLightboxIdx(i => i!==null ? Math.min(galeria.length-1,i+1) : null)}
              disabled={lightboxIdx === galeria.length-1}
              style={{position:'absolute',right:'8px',top:'50%',transform:'translateY(-50%)',width:'44px',height:'44px',borderRadius:'50%',background:'rgba(255,255,255,0.15)',color:'white',fontSize:'24px',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:lightboxIdx===galeria.length-1?0.2:1}}
            >›</button>
          </div>

          {/* Thumbnails */}
          <div style={{display:'flex',justifyContent:'center',gap:'8px',padding:'16px',flexShrink:0,overflowX:'auto'}}
            onClick={e => e.stopPropagation()}>
            {galeria.map((foto,i) => (
              <img key={i} src={foto} alt={`Thumb ${i+1}`}
                onClick={() => setLightboxIdx(i)}
                style={{
                  width:'56px', height:'44px', objectFit:'cover', borderRadius:'8px',
                  cursor:'pointer', flexShrink:0,
                  opacity: lightboxIdx===i ? 1 : 0.45,
                  outline: lightboxIdx===i ? '2px solid #B8892A' : 'none',
                  outlineOffset: '2px',
                  transform: lightboxIdx===i ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s',
                }}
                onError={e => {(e.target as any).src=FOTOS_DEMO[0]}}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
