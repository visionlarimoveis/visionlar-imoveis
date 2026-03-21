import Image from 'next/image'
import Link from 'next/link'

const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'

export default function ContatoPage() {
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

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-bold text-3xl text-[#0D2137] mb-2" style={{fontFamily:'Playfair Display,serif'}}>Entre em <span className="text-[#B8892A]">Contato</span></h1>
          <p className="text-gray-500 text-sm">Nossa equipe está pronta para te atender.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {[
            {ico:'📲', label:'WhatsApp', valor:'(51) 9 9790-1012', link:`https://wa.me/${WPP}?text=${encodeURIComponent('Olá! Gostaria de falar com a VisionLar Imóveis.')}`, btn:'Enviar mensagem', color:'bg-green-500 hover:bg-green-600'},
            {ico:'✉️', label:'E-mail', valor:'contato@visionlarimovies.com.br', link:'mailto:contato@visionlarimovies.com.br', btn:'Enviar e-mail', color:'bg-[#0D2137] hover:bg-[#1A3558]'},
            {ico:'📍', label:'Localização', valor:'Candelária - RS', link:'#', btn:'', color:''},
          ].map(item=>(
            <div key={item.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-gray-100">{item.ico}</div>
              <div className="flex-1">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{item.label}</div>
                <div className="font-bold text-gray-900">{item.valor}</div>
              </div>
              {item.btn && (
                <a href={item.link} target="_blank" rel="noopener"
                  className={`${item.color} text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0`}>
                  {item.btn}
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#B8892A] to-[#A57820] rounded-2xl p-8 text-center">
          <h2 className="font-bold text-xl text-[#0D2137] mb-2" style={{fontFamily:'Playfair Display,serif'}}>Anuncie seu imóvel conosco</h2>
          <p className="text-[#0D2137]/70 text-sm mb-5">Avaliação gratuita e divulgação nos melhores canais.</p>
          <a href={`https://wa.me/${WPP}?text=${encodeURIComponent('Olá! Gostaria de anunciar meu imóvel com a VisionLar.')}`}
            target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 bg-[#0D2137] text-white px-7 py-3 rounded-xl font-bold hover:bg-[#132844] transition-colors">
            📲 Solicitar avaliação gratuita
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
