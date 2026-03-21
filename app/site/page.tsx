import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

async function getImoveis() {
  const { data } = await supabase
    .from('imoveis')
    .select('*, cidade:cidades(nome,estado), bairro:bairros(nome)')
    .eq('status', 'Ativo')
    .order('destaque', { ascending: false })
    .order('created_at', { ascending: false })
  return data || []
}

function fmtP(p: number) {
  if (p >= 1e6) return `R$ ${(p / 1e6).toFixed(1).replace('.', ',')}M`
  if (p >= 1e3) return `R$ ${(p / 1e3).toFixed(0)}k`
  return `R$ ${p.toLocaleString('pt-BR')}`
}

const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'

export default async function SitePage() {
  const imoveis = await getImoveis()

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

        {/* Busca hero */}
        <div className="bg-white rounded-2xl p-5 max-w-3xl mx-auto grid grid-cols-4 gap-3 items-end shadow-2xl">
          <div><label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">O que busca?</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none bg-gray-50"><option>Comprar ou Alugar</option><option>Comprar</option><option>Alugar</option></select></div>
          <div><label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Tipo</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none bg-gray-50"><option>Todos os tipos</option><option>Apartamento</option><option>Casa</option><option>Terreno</option><option>Comercial</option></select></div>
          <div><label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Cidade / Bairro</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none bg-gray-50" placeholder="Ex: Candelária, Centro..." /></div>
          <button className="btn-gold text-xs py-2.5 px-4 rounded-xl whitespace-nowrap">🔍 Buscar</button>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-16 mt-10 pt-8 border-t border-white/[0.08]">
          {[[imoveis.length.toString(), 'Imóveis Disponíveis'],['8+','Anos de Experiência'],['500+','Clientes Satisfeitos'],['98%','Índice de Aprovação']].map(([n,l]) => (
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

      {/* IMÓVEIS */}
      <section id="imóveis" className="py-14 px-10">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="font-playfair text-3xl text-[#0D2137]">Nossos <span className="text-[#B8892A]">Imóveis</span></h2>
            <p className="text-gray-400 text-sm mt-1">Encontre o imóvel ideal para você</p>
          </div>
        </div>
        {imoveis.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3">🏠</div><p>Nenhum imóvel disponível no momento.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {imoveis.map((i: any, idx: number) => (
              <div key={i.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img src={i.foto_url || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80'} alt={i.titulo} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i.finalidade === 'Venda' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>{i.finalidade}</span>
                  </div>
                  {i.destaque && <div className="absolute top-2 right-2 bg-[#B8892A] text-[#0D2137] text-[9px] font-black px-2 py-0.5 rounded-full">★ DESTAQUE</div>}
                </div>
                <div className="p-4">
                  <div className="font-playfair text-xl font-bold text-gray-900">{fmtP(i.preco)}{i.finalidade === 'Aluguel' && <small className="text-xs text-gray-400 font-normal font-poppins">/mês</small>}</div>
                  <div className="text-xs font-semibold text-gray-800 mt-1 truncate">{i.titulo}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">📍 {i.bairro?.nome ? `${i.bairro.nome}, ` : ''}{i.cidade?.nome}</div>
                  <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-gray-100 flex-wrap">
                    {i.area ? <span className="text-[10px] text-gray-500">📐 <b>{i.area}</b>m²</span> : null}
                    {i.dorms ? <span className="text-[10px] text-gray-500">🛏 <b>{i.dorms}</b></span> : null}
                    {i.banhs ? <span className="text-[10px] text-gray-500">🚿 <b>{i.banhs}</b></span> : null}
                    {i.vagas ? <span className="text-[10px] text-gray-500">🚗 <b>{i.vagas}</b></span> : null}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <a href={`https://wa.me/${WPP}?text=${encodeURIComponent(`Tenho interesse no imóvel: ${i.titulo} — ${i.cidade?.nome}`)}`} target="_blank" rel="noopener" className="flex-1 bg-green-500 text-white text-[10px] font-bold py-2 rounded-lg text-center hover:bg-green-600 transition-colors no-underline">📲 WhatsApp</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
      <section className="bg-gradient-to-r from-[#B8892A] to-[#A57820] py-16 px-10 text-center">
        <h2 className="font-playfair text-3xl text-[#0D2137] mb-3">Pronto para vender ou encontrar<br/>seu imóvel ideal?</h2>
        <p className="text-[#0D2137]/60 text-sm mb-7">Fale agora com nossa equipe e descubra como podemos ajudá-lo.</p>
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
        <div className="border-t border-white/[0.08] pt-4 flex justify-between text-white/20 text-[10px]">
          <span>© 2025 VisionLar Imóveis. Todos os direitos reservados.</span>
          <span>CRECI-RS 00000-J</span>
        </div>
      </footer>
    </div>
  )
}
