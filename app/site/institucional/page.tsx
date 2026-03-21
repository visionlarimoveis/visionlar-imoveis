import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'

async function getConfig() {
  try {
    const { data } = await supabase.from('configuracoes').select('chave, valor')
    if (!data) return { creci: '', nome: 'VisionLar Imóveis', sobre: '', cidade_sede: '', whatsapp: WPP }
    const cfg: Record<string, string> = {}
    data.forEach((r: any) => { cfg[r.chave] = r.valor })
    return {
      creci: cfg.creci || '',
      nome: cfg.nome || 'VisionLar Imóveis',
      sobre: cfg.sobre || 'A VisionLar Imóveis é uma empresa especializada em intermediação imobiliária, com foco em proporcionar uma experiência segura, transparente e eficiente para quem deseja comprar, vender ou alugar imóveis.',
      cidade_sede: cfg.cidade_sede || '',
      whatsapp: cfg.whatsapp || WPP,
    }
  } catch {
    return { creci: '', nome: 'VisionLar Imóveis', sobre: '', cidade_sede: '', whatsapp: WPP }
  }
}

export default async function InstitucionalPage() {
  const cfg = await getConfig()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="bg-[#0D2137] sticky top-0 z-50 shadow-lg" style={{height:"64px", overflow:"hidden"}}>
        <div className="h-full px-6 flex items-center justify-between">
          <Link href="/site/imoveis" className="flex items-center">
            <Image src="/logo.png" alt="VisionLar" width={130} height={44} className="object-contain"  />
          </Link>
          <div className="hidden md:flex gap-1">
            {[['Imóveis','/site/imoveis'],['Institucional','/site/institucional'],['Contato','/site/contato']].map(([l,h])=>(
              <Link key={l} href={h} className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all">{l}</Link>
            ))}
          </div>
          <a href={`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site da VisionLar Imóveis.')}`} target="_blank" rel="noopener"
            className="bg-[#B8892A] text-[#0D2137] px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#D4A843] transition-colors flex items-center gap-1.5">
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z"/></svg>
            WhatsApp
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header institucional com logo + CRECI */}
        <div className="bg-[#0D2137] rounded-3xl p-10 text-white mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <Image src="/logo.png" alt="VisionLar" width={160} height={60} className="object-contain mb-6"/>
              <h1 className="font-bold text-3xl mb-4" style={{fontFamily:'Playfair Display,serif'}}>
                Sobre a <span className="text-[#D4A843]">{cfg.nome}</span>
              </h1>
              <p className="text-white/70 leading-relaxed text-sm max-w-2xl">
                {cfg.sobre || 'A VisionLar Imóveis é uma empresa especializada em intermediação imobiliária, com foco em proporcionar uma experiência segura, transparente e eficiente para quem deseja comprar, vender ou alugar imóveis.'}
              </p>
              <p className="text-white/70 leading-relaxed text-sm mt-3 max-w-2xl">
                Nossa missão é conectar pessoas ao imóvel ideal com atendimento personalizado, comprometimento com resultados e total transparência em cada negociação.
              </p>
            </div>
            {/* Badge CRECI */}
            {cfg.creci && (
              <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-5 text-center shrink-0">
                <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">CRECI-RS</div>
                <div className="text-[#D4A843] font-bold text-2xl" style={{fontFamily:'Playfair Display,serif'}}>{cfg.creci}</div>
              </div>
            )}
          </div>
          {cfg.cidade_sede && (
            <div className="mt-5 pt-5 border-t border-white/10 flex items-center gap-2 text-white/50 text-sm">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {cfg.cidade_sede}
            </div>
          )}
        </div>

        {/* Diferenciais */}
        <div className="grid grid-cols-2 gap-5 mb-8">
          {[
            ['🤝','Atendimento personalizado','Cada cliente é único. Suporte dedicado em todas as etapas do processo.'],
            ['📊','Avaliação profissional','Análise precisa do valor de mercado com metodologia comprovada.'],
            ['📣','Divulgação estratégica','Seu imóvel nos melhores canais para alcançar o comprador ideal.'],
            ['📋','Segurança no processo','Documentação e processos legais por profissionais qualificados.'],
          ].map(([ico,titulo,desc])=>(
            <div key={titulo} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-[#B8892A] to-[#D4A843] rounded-xl flex items-center justify-center text-xl mb-4 shadow">{ico}</div>
              <h4 className="font-bold text-gray-900 mb-1.5 text-sm">{titulo}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <h2 className="font-bold text-xl text-[#0D2137] mb-2" style={{fontFamily:'Playfair Display,serif'}}>Pronto para negociar?</h2>
          <p className="text-gray-500 text-sm mb-6">Fale agora com nossa equipe pelo WhatsApp.</p>
          <a href={`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de falar com um especialista da VisionLar.')}`}
            target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-md">
            📲 Falar no WhatsApp agora
          </a>
        </div>
      </div>

      <footer className="bg-[#0D2137] py-4 px-6 flex items-center justify-between mt-4">
        <span className="text-white/25 text-[10px]">© 2025 VisionLar Imóveis{cfg.creci ? ` — CRECI-RS ${cfg.creci}` : ''}</span>
        <a href="/adm" className="text-white/15 hover:text-white/50 text-[10px] border border-white/10 px-2.5 py-1 rounded-lg">🔐 Adm</a>
      </footer>
    </div>
  )
}
