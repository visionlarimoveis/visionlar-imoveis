import Image from 'next/image'
import Link from 'next/link'

const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'

export default function InstitucionalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#0D2137] h-16 px-6 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <Link href="/site/imoveis"><Image src="/logo.png" alt="VisionLar" width={130} height={48} className="object-contain"/></Link>
        <div className="hidden md:flex gap-1">
          {[['Imóveis','/site/imoveis'],['Institucional','/site/institucional'],['Contato','/site/contato']].map(([l,h])=>(
            <Link key={l} href={h} className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all">{l}</Link>
          ))}
        </div>
        <a href={`https://wa.me/${WPP}`} target="_blank" rel="noopener" className="bg-[#B8892A] text-[#0D2137] px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#D4A843] transition-colors">📲 WhatsApp</a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-[#0D2137] rounded-3xl p-10 text-white mb-8">
          <Image src="/logo.png" alt="VisionLar" width={160} height={60} className="object-contain mb-6"/>
          <h1 className="font-bold text-3xl mb-4" style={{fontFamily:'Playfair Display,serif'}}>Sobre a <span className="text-[#D4A843]">VisionLar Imóveis</span></h1>
          <p className="text-white/70 leading-relaxed text-sm">A VisionLar Imóveis é uma empresa especializada em intermediação imobiliária, com foco em proporcionar uma experiência segura, transparente e eficiente para quem deseja comprar, vender ou alugar imóveis.</p>
          <p className="text-white/70 leading-relaxed text-sm mt-3">Nossa missão é conectar pessoas ao imóvel ideal com atendimento personalizado, comprometimento com resultados e total transparência em cada negociação.</p>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-8">
          {[['🤝','Atendimento personalizado','Cada cliente é único. Suporte dedicado em todas as etapas do processo.'],
            ['📊','Avaliação profissional','Análise precisa do valor de mercado com metodologia comprovada.'],
            ['📣','Divulgação estratégica','Seu imóvel nos melhores canais para alcançar o comprador ideal.'],
            ['📋','Segurança no processo','Documentação e processos legais por profissionais qualificados.']
          ].map(([ico,titulo,desc])=>(
            <div key={titulo} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-[#B8892A] to-[#D4A843] rounded-xl flex items-center justify-center text-xl mb-4 shadow">{ico}</div>
              <h4 className="font-bold text-gray-900 mb-1.5">{titulo}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <h2 className="font-bold text-xl text-[#0D2137] mb-2" style={{fontFamily:'Playfair Display,serif'}}>Pronto para negociar?</h2>
          <p className="text-gray-500 text-sm mb-6">Fale agora com nossa equipe pelo WhatsApp.</p>
          <a href={`https://wa.me/${WPP}?text=${encodeURIComponent('Olá! Gostaria de falar com um especialista da VisionLar.')}`}
            target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-md">
            📲 Falar no WhatsApp agora
          </a>
        </div>
      </div>

      <footer className="bg-[#0D2137] py-4 px-6 flex items-center justify-between">
        <span className="text-white/25 text-[10px]">© 2025 VisionLar Imóveis</span>
        <a href="/adm" className="text-white/15 hover:text-white/50 transition-colors text-[10px] border border-white/10 px-2.5 py-1 rounded-lg">🔐 Adm</a>
      </footer>
    </div>
  )
}
