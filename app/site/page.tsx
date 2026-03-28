'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import FloatButtons from '@/components/ui/FloatButtons'

const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'

const FOTOS_HERO = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=90',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=90',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=90',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=90',
]

function fmtP(p: number, f: string) {
  const v = p >= 1e6 ? \`R$ \${(p / 1e6).toFixed(1).replace('.', ',')}M\`
    : p >= 1e3 ? \`R$ \${(p / 1e3).toFixed(0)}k\`
    : \`R$ \${p?.toLocaleString('pt-BR')}\`
  return f === 'Aluguel' ? \`\${v}/mês\` : v
}

export default function HomePage() {
  const [heroIdx, setHeroIdx] = useState(0)
  const [destaques, setDestaques] = useState<any[]>([])
  const [stats, setStats] = useState({ imoveis: 0, cidades: 0 })
  const [busca, setBusca] = useState({ finalidade: 'Venda', texto: '' })
  const [leadForm, setLeadForm] = useState({ nome: '', telefone: '', tipo: 'Comprar', preco: '' })
  const [leadEnviado, setLeadEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % FOTOS_HERO.length), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    supabase.from('imoveis').select('id, titulo, tipo, preco, finalidade, foto_url, cidade:cidades(nome,estado), bairro:bairros(nome)')
      .eq('status', 'Ativo').eq('destaque', true).limit(6)
      .then(r => setDestaques(r.data || []))
    Promise.all([
      supabase.from('imoveis').select('id', { count: 'exact' }).eq('status', 'Ativo'),
      supabase.from('cidades').select('id', { count: 'exact' }),
    ]).then(([im, ci]) => setStats({ imoveis: im.count || 0, cidades: ci.count || 0 }))
  }, [])

  function buscarImoveis() {
    window.location.href = \`/site/imoveis\`
  }

  async function enviarLead(e: React.FormEvent) {
    e.preventDefault()
    if (!leadForm.nome || !leadForm.telefone) return
    setEnviando(true)
    const msg = \`Olá! Tenho interesse em \${leadForm.tipo} um imóvel. Nome: \${leadForm.nome} | WhatsApp: \${leadForm.telefone} | Faixa: \${leadForm.preco || 'a combinar'}\`
    window.open(\`https://wa.me/\${WPP}?text=\${encodeURIComponent(msg)}\`, '_blank')
    setLeadEnviado(true)
    setEnviando(false)
  }

  const diferenciais = [
    { ico: '⚡', titulo: 'Atendimento rápido', desc: 'Fale com um corretor em minutos pelo WhatsApp, sem espera.' },
    { ico: '🛡️', titulo: 'Negociação segura', desc: 'Suporte jurídico completo do primeiro contato até a entrega das chaves.' },
    { ico: '🎯', titulo: 'Imóveis selecionados', desc: 'Curadoria rigorosa para você não perder tempo com opções ruins.' },
    { ico: '📍', titulo: 'Especialistas locais', desc: 'Conhecemos cada bairro da região para te dar a melhor orientação.' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="bg-[#0D2137] sticky top-0 z-50 shadow-lg" style={{ height: '64px', overflow: 'hidden' }}>
        <div className="h-full px-6 flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/site">
            <Image src="/logo.png?v=2" alt="Visionlar Consultoria Imobiliária" width={130} height={44} className="object-contain" />
          </Link>
          <div className="hidden md:flex gap-1">
            {([['Imóveis', '/site/imoveis'], ['Institucional', '/site/institucional'], ['Contato', '/site/contato']] as [string, string][]).map(([l, h]) => (
              <Link key={l} href={h} className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all">{l}</Link>
            ))}
          </div>
          <a href={\`https://wa.me/\${WPP}?text=\${encodeURIComponent('Olá! Vim pelo site da Visionlar Consultoria Imobiliária.')}\`} target="_blank" rel="noopener"
            className="bg-[#B8892A] text-[#0D2137] px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#D4A843] transition-colors">
            WhatsApp
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ height: 'min(90vh, 680px)' }}>
        {FOTOS_HERO.map((foto, idx) => (
          <div key={idx} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: idx === heroIdx ? 1 : 0 }}>
            <img src={foto} alt="Imóvel" className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D2137]/90 via-[#0D2137]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D2137]/70 via-transparent to-transparent" />
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#B8892A]/20 border border-[#B8892A]/40 rounded-full px-4 py-1.5 text-[#D4A843] text-xs font-semibold mb-5 tracking-wider uppercase">
                ✦ Visionlar Consultoria Imobiliária
              </div>
              <h1 className="text-white font-bold text-4xl md:text-6xl leading-tight mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                O imóvel certo,<br /><span className="text-[#D4A843]">sem perder tempo</span><br />procurando.
              </h1>
              <p className="text-white/75 text-lg mb-8 leading-relaxed max-w-xl">
                Encontramos as melhores oportunidades para você comprar, vender ou alugar com segurança e atendimento personalizado.
              </p>
              <div className="bg-white rounded-2xl p-3 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-xl mb-6">
                <div className="flex gap-1 shrink-0">
                  {(['Venda', 'Aluguel'] as const).map(f => (
                    <button key={f} onClick={() => setBusca(b => ({ ...b, finalidade: f }))}
                      className={\`px-4 py-2 rounded-xl text-sm font-bold transition-all \${busca.finalidade === f ? 'bg-[#0D2137] text-white' : 'text-gray-500 hover:bg-gray-100'}\`}>
                      {f === 'Venda' ? 'Comprar' : 'Alugar'}
                    </button>
                  ))}
                </div>
                <input type="text" placeholder="Bairro, cidade ou tipo..." value={busca.texto}
                  onChange={e => setBusca(b => ({ ...b, texto: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && buscarImoveis()}
                  className="flex-1 px-3 py-2 text-sm outline-none text-gray-700 placeholder-gray-400" />
                <button onClick={buscarImoveis}
                  className="bg-[#B8892A] hover:bg-[#D4A843] text-[#0D2137] font-bold px-6 py-2 rounded-xl text-sm transition-colors shrink-0">
                  Buscar
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={\`https://wa.me/\${WPP}?text=\${encodeURIComponent('Olá! Quero encontrar meu imóvel ideal com a Visionlar.')}\`} target="_blank" rel="noopener"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg">
                  📲 Falar com especialista
                </a>
                <Link href="/site/imoveis" className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors text-sm">
                  Ver todos os imóveis →
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {FOTOS_HERO.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)}
              className={\`rounded-full transition-all \${i === heroIdx ? 'w-6 h-2 bg-[#B8892A]' : 'w-2 h-2 bg-white/40'}\`} />
          ))}
        </div>
      </section>

      {/* NÚMEROS */}
      <section className="bg-[#0D2137] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { v: \`\${stats.imoveis}+\`, l: 'Imóveis disponíveis' },
              { v: \`\${stats.cidades}\`, l: 'Cidades atendidas' },
              { v: 'CRECI-RS', l: '44.627-F Certificado' },
              { v: '100%', l: 'Dedicação ao cliente' },
            ].map(n => (
              <div key={n.l}>
                <div className="text-[#D4A843] font-bold text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>{n.v}</div>
                <div className="text-white/50 text-xs mt-1 font-medium">{n.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      {destaques.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#B8892A] text-sm font-semibold uppercase tracking-wider mb-1">Selecionados para você</p>
                <h2 className="font-bold text-3xl text-[#0D2137]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Imóveis em <span className="text-[#B8892A]">destaque</span>
                </h2>
              </div>
              <Link href="/site/imoveis" className="hidden md:flex items-center gap-1.5 text-[#0D2137] font-semibold text-sm hover:text-[#B8892A] transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destaques.map(im => (
                <Link key={im.id} href={\`/site/imoveis/\${im.id}\`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
                    <img src={im.foto_url || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80'}
                      alt={im.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full \${im.finalidade === 'Venda' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}\`}>{im.finalidade}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-[#B8892A] text-white text-[10px] font-black px-2.5 py-1 rounded-full">★</div>
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-gray-900 truncate mb-1">{im.bairro?.nome || im.titulo}</div>
                    <div className="text-xs text-gray-500 mb-3">{im.cidade?.nome} - {im.cidade?.estado}</div>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xl text-[#0D2137]" style={{ fontFamily: 'Playfair Display, serif' }}>{fmtP(im.preco, im.finalidade)}</div>
                      <span className="text-xs text-[#B8892A] font-semibold">Ver imóvel →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/site/imoveis" className="inline-flex items-center gap-2 bg-[#0D2137] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#1A3558] transition-colors">
                Ver todos os {stats.imoveis}+ imóveis disponíveis →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CAPTURA DE LEAD */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#0D2137] to-[#1A3558] rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8892A]/10 rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-[#D4A843] text-sm font-semibold uppercase tracking-wider mb-3">Não encontrou o imóvel ideal?</p>
                <h2 className="font-bold text-3xl text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Receba opções que<br /><span className="text-[#D4A843]">combinam com você</span>
                </h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Deixe seus dados e nosso especialista vai te enviar imóveis exclusivos direto no WhatsApp.
                </p>
                {['Atendimento personalizado e rápido', 'Imóveis que não estão na busca pública', 'Suporte até a entrega das chaves'].map(b => (
                  <div key={b} className="flex items-center gap-2 text-white/70 text-sm mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#B8892A]/30 flex items-center justify-center shrink-0">
                      <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    {b}
                  </div>
                ))}
              </div>
              {leadEnviado ? (
                <div className="bg-white/10 rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-white font-bold text-xl mb-2">Ótimo! Te esperamos no WhatsApp</h3>
                  <p className="text-white/60 text-sm">Nosso especialista enviará as melhores opções em breve.</p>
                </div>
              ) : (
                <form onSubmit={enviarLead} className="bg-white rounded-2xl p-6 flex flex-col gap-4">
                  <h3 className="font-bold text-[#0D2137] text-lg">Quero receber oportunidades</h3>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Seu nome</label>
                    <input required value={leadForm.nome} onChange={e => setLeadForm(f => ({ ...f, nome: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B8892A]" placeholder="Como posso te chamar?" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">WhatsApp</label>
                    <input required value={leadForm.telefone} onChange={e => setLeadForm(f => ({ ...f, telefone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B8892A]" placeholder="(51) 9 9999-9999" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Interesse</label>
                      <select value={leadForm.tipo} onChange={e => setLeadForm(f => ({ ...f, tipo: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#B8892A] bg-white">
                        <option>Comprar</option><option>Alugar</option><option>Vender</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Faixa de preço</label>
                      <select value={leadForm.preco} onChange={e => setLeadForm(f => ({ ...f, preco: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#B8892A] bg-white">
                        <option value="">A combinar</option>
                        <option>Até R$ 200k</option><option>R$ 200k – 500k</option>
                        <option>R$ 500k – 1M</option><option>Acima de R$ 1M</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={enviando}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    📲 {enviando ? 'Enviando...' : 'Quero receber oportunidades'}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">Você será direcionado ao WhatsApp</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[#B8892A] text-sm font-semibold uppercase tracking-wider mb-2">Por que nos escolher</p>
            <h2 className="font-bold text-3xl text-[#0D2137]" style={{ fontFamily: 'Playfair Display, serif' }}>
              A visão certa para <span className="text-[#B8892A]">seu novo lar</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {diferenciais.map(d => (
              <div key={d.titulo} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[#B8892A] to-[#D4A843] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow">{d.ico}</div>
                <h3 className="font-bold text-[#0D2137] mb-2">{d.titulo}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[#B8892A] text-sm font-semibold uppercase tracking-wider mb-2">Como podemos ajudar</p>
            <h2 className="font-bold text-3xl text-[#0D2137]" style={{ fontFamily: 'Playfair Display, serif' }}>Nossos <span className="text-[#B8892A]">serviços</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { ico: '🏠', titulo: 'Comprar', desc: 'Encontre o imóvel ideal com nossa curadoria especializada e suporte completo na negociação.', cta: 'Quero comprar', href: '/site/imoveis' },
              { ico: '🔑', titulo: 'Alugar', desc: 'Imóveis residenciais e comerciais para locação com processo ágil e sem burocracia.', cta: 'Quero alugar', href: '/site/imoveis' },
              { ico: '📣', titulo: 'Vender', desc: 'Avaliação profissional e divulgação estratégica para vender seu imóvel pelo melhor preço.', cta: 'Quero vender', href: \`https://wa.me/\${WPP}?text=\${encodeURIComponent('Olá! Quero vender meu imóvel com a Visionlar.')}\` },
            ].map(s => (
              <div key={s.titulo} className="bg-gray-50 rounded-2xl p-8 hover:bg-[#0D2137] group transition-all duration-300 cursor-pointer" onClick={() => window.location.href = s.href}>
                <div className="w-16 h-16 bg-white group-hover:bg-[#B8892A]/20 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-sm transition-all">{s.ico}</div>
                <h3 className="font-bold text-xl text-[#0D2137] group-hover:text-white mb-3 transition-colors">{s.titulo}</h3>
                <p className="text-gray-500 group-hover:text-white/70 text-sm leading-relaxed mb-5 transition-colors">{s.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-[#B8892A] group-hover:text-[#D4A843] font-semibold text-sm transition-colors">{s.cta} →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 bg-[#0D2137]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-bold text-4xl text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Pronto para encontrar<br /><span className="text-[#D4A843]">seu imóvel ideal?</span>
          </h2>
          <p className="text-white/60 mb-8">Fale agora com nosso especialista e receba atendimento personalizado.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={\`https://wa.me/\${WPP}?text=\${encodeURIComponent('Olá! Quero falar com um especialista da Visionlar.')}\`} target="_blank" rel="noopener"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl transition-colors text-base">
              📲 Falar com especialista agora
            </a>
            <Link href="/site/imoveis" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-base">
              Ver todos os imóveis
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 flex flex-col md:flex-row items-center gap-2 md:justify-between">
        <span className="text-gray-400 text-[10px] text-center md:text-left">© {new Date().getFullYear()} Visionlar Consultoria Imobiliária — Corretor de Imóveis CRECI-RS 44.627-F</span>
        <span className="text-gray-400 text-[10px] italic">&ldquo;Seu imóvel, nossa visão.&rdquo;</span>
        <a href="https://midiavision.com.br" target="_blank" rel="noopener" className="text-gray-300 hover:text-gray-500 text-[10px] transition-colors">Desenvolvido por MidiaVision Digital</a>
      </footer>

      <FloatButtons />
    </div>
  )
}
