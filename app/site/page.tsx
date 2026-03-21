import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'

async function getImoveisCount() {
  try {
    const { count } = await supabase
      .from('imoveis')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Ativo')
    return count || 0
  } catch {
    return 0
  }
}

async function getCreci() {
  try {
    const { data } = await supabase.from('configuracoes').select('valor').eq('chave', 'creci').single()
    return data?.valor || ''
  } catch {
    return ''
  }
}

export default async function SitePage() {
  const imoveisCount = await getImoveisCount()
  const creci = await getCreci()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="bg-[#0D2137] h-16 px-10 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="VisionLar" width={140} height={50} className="object-contain" />
        </div>
        <ul className="hidden md:flex gap-7 list-none">
          {[['Início','#início'],['Imóveis','/site/imoveis'],['Sobre','#sobre'],['Contato','#contato']].map(([l,h]) => (
            <li key={l}><a href={h} className="text-white/60 hover:text-[#D4A843] text-[13px] font-medium transition-colors no-underline">{l}</a></li>
          ))}
        </ul>
        <a href={`https://wa.me/${WPP}?text=${encodeURIComponent('Olá! Vim pelo site da VisionLar Imóveis.')}`} target="_blank" rel="noopener" className="bg-[#B8892A] text-[#0D2137] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#D4A843] transition-colors no-underline flex items-center gap-1.5">
          📲 Falar no WhatsApp
        </a>
      </nav>

      {/* HERO */}
      <section id="início" className="bg-gradient-to-br from-[#0D2137] via-[#132844] to-[#1A3558] py-24 px-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8892A' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='8'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="inline-block text-[#D4A843] text-[10px] tracking-[3px] uppercase border border-[#B8892A]/30 px-4 py-1.5 rounded-full mb-5">✦ Especialistas em intermediação imobiliária</div>
        <h1 className="font-playfair text-4xl md:text-5xl text-white font-bold leading-tight mb-4 max-w-2xl mx-auto">
          Venda ou encontre seu imóvel com{' '}
          <em className="text-[#D4A843] not-italic">segurança, rapidez</em>{' '}
          e confiança
        </h1>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-10">Especialistas em intermediação imobiliária com atendimento personalizado e resultados reais.</p>

                {/* Botão ver imóveis */}
        <a
          href="/site/imoveis"
          className="inline-flex items-center gap-3 bg-white text-[#0D2137] px-10 py-4 rounded-2xl text-base font-bold hover:bg-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl shadow-lg mb-2"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          Ver todos os imóveis
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>

        {/* Stats */}
        <div className="flex justify-center gap-16 mt-10 pt-8 border-t border-white/[0.08]">
          {[[imoveisCount.toString(), 'Imóveis Disponíveis'],['100%','Dedicação Total'],['✓','Negociação Transparente'],['🤝','Atendimento Personalizado']].map(([n,l]) => (
            <div key={l} className="text-center">
              <div className="font-playfair text-3xl font-bold text-white">{n}</div>
              <div className="text-white/40 text-[10px] mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* POR QUE ESCOLHER */}
      <section className="py-14 px-10 bg-white">
        <div className="text-center mb-8">
          <h2 className="font-playfair text-3xl text-[#0D2137]">Por que escolher a <span className="text-[#B8892A]">VisionLar</span>?</h2>
          <p className="text-gray-400 text-sm mt-2">Compromisso, transparência e resultado em cada negociação</p>
        </div>
        <div className="grid grid-cols-4 gap-5 max-w-5xl mx-auto">
          {[['🤝','Atendimento personalizado','Cada cliente é único. Suporte dedicado em todas as etapas.'],['📊','Avaliação profissional','Análise precisa do valor de mercado com metodologia comprovada.'],['📣','Divulgação estratégica','Seu imóvel nos melhores canais para alcançar o comprador ideal.'],['📋','Segurança no processo','Documentação e processos legais por profissionais qualificados.']].map(([ico,titulo,desc]) => (
            <div key={titulo} className="bg-gray-50 rounded-xl p-5 text-center border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-[#B8892A] to-[#D4A843] rounded-xl flex items-center justify-center text-xl mx-auto mb-3 shadow-md">{ico}</div>
              <h4 className="text-sm font-bold text-[#0D2137] mb-1.5">{titulo}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA VER TODOS IMÓVEIS */}
      <section className="py-12 px-10 bg-white text-center">
        <h2 className="font-playfair text-3xl text-[#0D2137] mb-3">
          Nossos <span className="text-[#B8892A]">Imóveis</span>
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Explore nossa carteira completa com filtros avançados, mapa interativo e busca por cidade e bairro.
        </p>
        <a
          href="/site/imoveis"
          className="inline-flex items-center gap-3 bg-[#0D2137] text-white px-10 py-4 rounded-2xl text-sm font-bold hover:bg-[#1A3558] transition-all hover:-translate-y-1 hover:shadow-xl shadow-lg"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          Ver todos os imóveis
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
        <div className="flex justify-center gap-8 mt-8">
          <div className="text-center">
            <div className="font-playfair text-2xl font-bold text-[#0D2137]">🏠</div>
            <div className="text-xs text-gray-400 mt-1">Comprar</div>
          </div>
          <div className="text-center">
            <div className="font-playfair text-2xl font-bold text-[#0D2137]">🔑</div>
            <div className="text-xs text-gray-400 mt-1">Alugar</div>
          </div>
          <div className="text-center">
            <div className="font-playfair text-2xl font-bold text-[#0D2137]">🗺️</div>
            <div className="text-xs text-gray-400 mt-1">Ver no Mapa</div>
          </div>
          <div className="text-center">
            <div className="font-playfair text-2xl font-bold text-[#0D2137]">⚡</div>
            <div className="text-xs text-gray-400 mt-1">Filtros avançados</div>
          </div>
        </div>
      </section>

            {/* SOBRE */}
      <section id="sobre" className="bg-[#0D2137] py-16 px-10">
        <div className="max-w-2xl">
          <h2 className="font-playfair text-3xl text-white mb-1">Sobre a <span className="text-[#D4A843]">VisionLar Imóveis</span></h2>
          <div className="w-12 h-0.5 bg-[#B8892A] mt-3 mb-5 rounded" />
          <p className="text-white/50 text-sm leading-relaxed">A VisionLar Imóveis é uma empresa especializada em intermediação imobiliária, com foco em proporcionar uma experiência segura, transparente e eficiente para quem deseja comprar ou vender imóveis. Nossa missão é conectar pessoas ao imóvel ideal com atendimento personalizado e comprometimento com resultados.</p>
          <p className="text-white/50 text-sm leading-relaxed mt-4">Com uma equipe de profissionais dedicados e amplo conhecimento do mercado, oferecemos consultoria completa, desde a avaliação até o fechamento do negócio.</p>
          <div className="mt-6 space-y-2">
            {['Profissionais qualificados e experientes','Transparência em todas as negociações','Resultados comprovados no mercado imobiliário','Atendimento humanizado e dedicado'].map(item => (
              <div key={item} className="flex items-center gap-2 text-white/65 text-sm">
                <div className="w-4 h-4 rounded-full bg-[#B8892A] text-[#0D2137] text-[9px] font-black flex items-center justify-center shrink-0">✓</div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16 px-10 text-center border-t border-gray-100">
        <h2 className="font-playfair text-3xl text-[#0D2137] mb-3">Pronto para vender ou encontrar<br/>seu imóvel ideal?</h2>
        <p className="text-gray-500 text-sm mb-7">Fale agora com nossa equipe e descubra como podemos ajudá-lo.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href={`https://wa.me/${WPP}?text=${encodeURIComponent('Olá! Quero falar com um especialista da VisionLar.')}`} target="_blank" rel="noopener" className="bg-[#0D2137] text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-[#132844] transition-colors no-underline flex items-center gap-2">📲 Falar no WhatsApp agora</a>
          <a href={`https://wa.me/${WPP}?text=${encodeURIComponent('Olá! Gostaria de uma avaliação gratuita do meu imóvel.')}`} target="_blank" rel="noopener" className="border-2 border-[#0D2137] text-[#0D2137] px-7 py-3 rounded-xl text-sm font-bold hover:bg-[#0D2137] hover:text-white transition-colors no-underline">Solicitar avaliação gratuita</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contato" className="bg-[#0D2137] py-12 px-10">
        <div className="grid grid-cols-3 gap-12 mb-8">
          <div>
            <Image src="/logo.png" alt="VisionLar" width={140} height={50} className="object-contain mb-3" />
            <p className="text-white/35 text-xs leading-relaxed">Sua parceira de confiança no mercado imobiliário. Experiência, segurança e resultados comprovados.</p>
          </div>
          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">Navegação</h4>
            <ul className="space-y-2 list-none">{['Início','Sobre','Imóveis','Contato'].map(l => <li key={l}><a href="#" className="text-white/35 text-xs hover:text-[#D4A843] transition-colors no-underline">{l}</a></li>)}</ul>
          </div>
          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">Contato</h4>
            <ul className="space-y-2 list-none">
              <li><a href={`https://wa.me/${WPP}`} className="text-white/35 text-xs hover:text-[#D4A843] no-underline">📱 WhatsApp</a></li>
              <li><a href="mailto:contato@visionlarimovies.com.br" className="text-white/35 text-xs hover:text-[#D4A843] no-underline">✉️ contato@visionlarimovies.com.br</a></li>
              <li><span className="text-white/35 text-xs">📞 (51) 9 9790-1012</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.08] pt-4 flex justify-between items-center text-white/20 text-[10px]">
          <span>© 2025 VisionLar Imóveis. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <span>CRECI-RS {creci || '00000-J'}</span>
            <a
              href="/adm"
              className="text-white/15 hover:text-white/50 transition-colors text-[10px] border border-white/10 px-2.5 py-1 rounded-lg hover:border-white/25"
              title="Área administrativa"
            >
              🔐 Adm
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
