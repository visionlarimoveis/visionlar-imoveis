import Image from 'next/image'
import Link from 'next/link'
import FloatButtonsCreci from '@/components/ui/FloatButtonsCreci'
import { supabase } from '@/lib/supabase'

export const revalidate = 0 // sempre busca dados frescos do Supabase
const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'

async function getConfig() {
  try {
    const { data } = await supabase.from('configuracoes').select('chave, valor')
    if (!data) return defaults()
    const cfg: Record<string, string> = {}
    data.forEach((r: any) => { cfg[r.chave] = r.valor })
    return {
      creci:       cfg.creci       || '',
      nome:        cfg.nome        || 'Visionlar Consultoria Imobiliária',
      sobre:       cfg.sobre       || '',
      cidade_sede: cfg.cidade_sede || '',
      whatsapp:    cfg.whatsapp    || WPP,
      email:       cfg.email       || '',
      telefone:    cfg.telefone    || '',
      endereco:    cfg.endereco    || '',
      instagram:   cfg.instagram   || '',
      facebook:    cfg.facebook    || '',
      ano_fundacao: cfg.ano_fundacao || '2020',
    }
  } catch { return defaults() }
}

function defaults() {
  return {
    creci: '', nome: 'Visionlar Consultoria Imobiliária', sobre: '', cidade_sede: '',
    whatsapp: WPP, email: '', telefone: '', endereco: '',
    instagram: '', facebook: '', ano_fundacao: '2020',
  }
}

async function getCorretores() {
  try {
    const { data } = await supabase
      .from('corretores')
      .select('id, nome, creci, telefone, foto_url, especialidade')
      .order('nome')
    return data || []
  } catch { return [] }
}

async function getStats() {
  try {
    const [imoveis, clientes] = await Promise.all([
      supabase.from('imoveis').select('id', { count: 'exact' }).eq('status', 'Ativo'),
      supabase.from('clientes').select('id', { count: 'exact' }),
    ])
    return {
      imoveis: imoveis.count || 0,
      clientes: clientes.count || 0,
    }
  } catch { return { imoveis: 0, clientes: 0 } }
}

export default async function InstitucionalPage() {
  const [cfg, corretores, stats] = await Promise.all([getConfig(), getCorretores(), getStats()])
  const anoAtual = new Date().getFullYear()
  const anosExperiencia = anoAtual - parseInt(cfg.ano_fundacao || '2020')

  const numeros = [
    { valor: '100%',          label: 'Dedicação ao cliente'    },
    { valor: 'Atendimento',   label: 'Personalizado'           },
    { valor: 'Foco Total',    label: 'em Resultados'           },
    { valor: 'Transparência', label: 'em cada negociação'      },
  ]

  const valores = [
    { ico: '🤝', titulo: 'Transparência',    desc: 'Comunicação clara e honesta em todas as etapas da negociação, sem surpresas.' },
    { ico: '🎯', titulo: 'Comprometimento',  desc: 'Dedicação total para encontrar o imóvel certo no menor tempo possível.' },
    { ico: '🛡️', titulo: 'Segurança',        desc: 'Processos documentais rigorosos para proteger compradores e vendedores.' },
    { ico: '💡', titulo: 'Inovação',         desc: 'Tecnologia e estratégias modernas para maximizar a visibilidade dos imóveis.' },
    { ico: '❤️', titulo: 'Humanização',      desc: 'Atendimento personalizado que respeita a história e o sonho de cada cliente.' },
    { ico: '📈', titulo: 'Resultado',        desc: 'Foco em gerar o melhor negócio para todas as partes envolvidas.' },
  ]

  const servicos = [
    { ico: '🏠', titulo: 'Compra e Venda',     desc: 'Intermediamos a negociação de imóveis residenciais e comerciais com toda a segurança jurídica.' },
    { ico: '🔑', titulo: 'Locação',            desc: 'Gestão completa do processo de aluguel: anúncio, seleção de inquilinos e contratos.' },
    { ico: '📊', titulo: 'Avaliação',          desc: 'Laudo técnico de avaliação imobiliária com base em metodologia de mercado.' },
    { ico: '📣', titulo: 'Divulgação',         desc: 'Seu imóvel nos principais portais e redes sociais com fotos e descrições profissionais.' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAV ── */}
      <nav className="bg-[#0D2137] sticky top-0 z-50 shadow-lg" style={{ height: '64px', overflow: 'hidden' }}>
        <div className="h-full px-6 flex items-center justify-between">
          <Link href="/site/imoveis">
            <Image src="/logo.png?v=2" alt="Visionlar Consultoria Imobiliária" width={130} height={44} className="object-contain" />
          </Link>
          <div className="hidden md:flex gap-1">
            {([['Imóveis', '/site/imoveis'], ['Institucional', '/site/institucional'], ['Contato', '/site/contato']] as [string, string][]).map(([l, h]) => (
              <Link key={l} href={h} className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all">{l}</Link>
            ))}
          </div>
          <a href={`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site da Visionlar Consultoria Imobiliária.')}`}
            target="_blank" rel="noopener"
            className="bg-[#B8892A] text-[#0D2137] px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#D4A843] transition-colors flex items-center gap-1.5">
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z" /></svg>
            WhatsApp
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-[#0D2137] relative overflow-hidden">
        {/* Fundo decorativo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B8892A] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#B8892A] rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-5xl mx-auto px-6 py-20 relative">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/60 text-xs font-semibold mb-6 tracking-wider uppercase">
                📍 {cfg.cidade_sede || 'Rio Grande do Sul'}
              </div>
              <h1 className="font-bold text-4xl md:text-5xl text-white mb-5 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Realizando sonhos<br />
                <span className="text-[#D4A843]">a visão certa para seu novo lar</span>
              </h1>
              <p className="text-white/65 leading-relaxed text-base max-w-xl">
                {cfg.sobre || 'A Visionlar Consultoria Imobiliária é uma empresa especializada em intermediação imobiliária, com foco em proporcionar uma experiência segura, transparente e eficiente para quem deseja comprar ou vender imóveis.'}
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <a href={`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de falar com um especialista da Visionlar Consultoria Imobiliária.')}`}
                  target="_blank" rel="noopener"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg text-sm">
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z" /></svg>
                  Falar agora
                </a>
                <Link href="/site/imoveis"
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors text-sm">
                  Ver imóveis →
                </Link>
              </div>
              {/* CRECI abaixo dos botões — linha horizontal */}
              {cfg.creci && (
                <p className="mt-4 text-white/50 text-xs font-semibold">
                  Corretor de Imóveis CRECI-RS {cfg.creci}
                </p>
              )}
            </div>
            {/* Badge logo */}
            <div className="shrink-0 flex flex-col items-center gap-4">
              <div className="bg-[#0D2137] rounded-2xl p-5 shadow-2xl text-center w-56">
                <Image src="/logo.png?v=2" alt="Visionlar" width={200} height={75} className="object-contain mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NÚMEROS ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {numeros.map((n) => (
              <div key={n.label} className="text-center">
                <div className="font-bold text-4xl text-[#0D2137]" style={{ fontFamily: 'Playfair Display, serif' }}>{n.valor}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">{n.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-14">

        {/* ── MISSÃO / VISÃO / VALORES ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="font-bold text-3xl text-[#0D2137]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Nossa <span className="text-[#B8892A]">essência</span>
            </h2>
            <p className="text-gray-500 text-sm mt-2">O que nos guia em cada negociação</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              {
                ico: '🎯', cor: 'bg-indigo-50 border-indigo-100',
                titulo: 'Missão',
                desc: 'Conectar pessoas ao imóvel ideal com atendimento personalizado, comprometimento com resultados e total transparência em cada etapa da negociação.',
              },
              {
                ico: '🔭', cor: 'bg-amber-50 border-amber-100',
                titulo: 'Visão',
                desc: 'Ser a Consultoria Imobiliária de referência na região, reconhecida pela excelência no atendimento e pela confiança construída com cada cliente.',
              },
              {
                ico: '💎', cor: 'bg-emerald-50 border-emerald-100',
                titulo: 'Propósito',
                desc: 'Realizar o sonho do imóvel próprio tornando o processo simples, seguro e inesquecível para cada família que atendemos.',
              },
            ].map((item) => (
              <div key={item.titulo} className={`rounded-2xl border p-6 ${item.cor}`}>
                <div className="text-3xl mb-3">{item.ico}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.titulo}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Grid de valores */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {valores.map((v) => (
              <div key={v.titulo} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                <div className="w-11 h-11 bg-gradient-to-br from-[#B8892A] to-[#D4A843] rounded-xl flex items-center justify-center text-lg shrink-0 shadow">
                  {v.ico}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{v.titulo}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SERVIÇOS ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="font-bold text-3xl text-[#0D2137]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Nossos <span className="text-[#B8892A]">serviços</span>
            </h2>
            <p className="text-gray-500 text-sm mt-2">Tudo que você precisa em um só lugar</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {servicos.map((s) => (
              <div key={s.titulo} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex gap-5">
                <div className="w-14 h-14 bg-[#0D2137] rounded-2xl flex items-center justify-center text-2xl shrink-0">{s.ico}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{s.titulo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EQUIPE ── */}
        {corretores.length > 0 && (
          <section>
            <div className="text-center mb-10">
              <h2 className="font-bold text-3xl text-[#0D2137]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Nossa <span className="text-[#B8892A]">equipe</span>
              </h2>
              <p className="text-gray-500 text-sm mt-2">Profissionais prontos para te atender</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {corretores.map((c: any) => {
                const iniciais = c.nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('')
                const wppCorretor = c.telefone
                  ? `https://wa.me/55${c.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${c.nome}! Vi seu perfil no site da Visionlar Consultoria Imobiliária.`)}`
                  : `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(`Olá! Quero falar com o corretor ${c.nome}.`)}`
                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-center">
                    {/* Foto ou avatar */}
                    <div className="bg-gradient-to-br from-[#0D2137] to-[#1a3a5c] h-32 flex items-center justify-center relative">
                      {c.foto_url ? (
                        <img src={c.foto_url} alt={c.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center font-bold text-white text-2xl">
                          {iniciais}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-bold text-gray-900 text-sm">{c.nome}</div>
                      {c.especialidade && <div className="text-[10px] text-[#B8892A] font-semibold mt-0.5">{c.especialidade}</div>}
                      {c.creci && <div className="text-[10px] text-gray-400 mt-0.5">CRECI: {c.creci}</div>}
                      <a href={wppCorretor} target="_blank" rel="noopener"
                        className="mt-3 w-full bg-green-500 text-white text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-green-600 transition-colors">
                        <svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z" /></svg>
                        Falar com {c.nome.split(' ')[0]}
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── CTA FINAL ── */}
        <section className="bg-[#0D2137] rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8892A] rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative">
            <h2 className="font-bold text-3xl text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Pronto para encontrar<br />
              <span className="text-[#D4A843]">seu próximo imóvel?</span>
            </h2>
            <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
              Nossa equipe está disponível para te ajudar a encontrar o imóvel ideal ou a vender o seu pelo melhor preço.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de falar com um especialista da Visionlar Consultoria Imobiliária.')}`}
                target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg">
                📲 Falar no WhatsApp
              </a>
              <Link href="/site/imoveis"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/20 transition-colors">
                🏠 Ver imóveis
              </Link>
            </div>
            {/* Contatos extras */}
            {(cfg.email || cfg.telefone) && (
              <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-white/10">
                {cfg.email && (
                  <a href={`mailto:${cfg.email}`} className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors">
                    <span>✉️</span> {cfg.email}
                  </a>
                )}
                {cfg.telefone && (
                  <a href={`tel:${cfg.telefone}`} className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors">
                    <span>📞</span> {cfg.telefone}
                  </a>
                )}
                {cfg.instagram && (
                  <a href={`https://instagram.com/${cfg.instagram.replace('@', '')}`} target="_blank" rel="noopener"
                    className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors">
                    <span>📸</span> @{cfg.instagram.replace('@', '')}
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 flex items-center justify-between mt-4">
        <span className="text-gray-400 text-[10px]">
          © {anoAtual} Visionlar Consultoria Imobiliária{cfg.creci ? ` — Corretor de Imóveis CRECI-RS ${cfg.creci}` : ''}
        </span>
        <div className="flex items-center gap-3">
          <a href="https://midiavision.com.br" target="_blank" rel="noopener" className="text-gray-300 hover:text-gray-500 text-[10px] transition-colors">Desenvolvido por MidiaVision Digital</a>
          <a href="/adm" className="text-gray-200 hover:text-gray-400 text-[10px] border border-gray-200 px-2.5 py-1 rounded-lg">🔐 Adm</a>
        </div>
      </footer>

      <FloatButtonsCreci />
    </div>
  )
}
