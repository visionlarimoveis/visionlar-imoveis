import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const WPP = process.env.NEXT_PUBLIC_WHATSAPP || '5551997901012'

async function getConfig() {
  try {
    const { data } = await supabase
      .from('configuracoes')
      .select('chave, valor')
    if (!data) return { telefone: '(51) 9 9790-1012', email: 'contato@visionlarimovies.com.br', cidade_sede: 'Candelária - RS', whatsapp: WPP }
    const cfg: Record<string, string> = {}
    data.forEach((r: any) => { cfg[r.chave] = r.valor })
    return {
      telefone: cfg.telefone || '(51) 9 9790-1012',
      email: cfg.email || 'contato@visionlarimovies.com.br',
      cidade_sede: cfg.cidade_sede || 'Candelária - RS',
      whatsapp: cfg.whatsapp || WPP,
      endereco: cfg.endereco || '',
    }
  } catch {
    return { telefone: '(51) 9 9790-1012', email: 'contato@visionlarimovies.com.br', cidade_sede: 'Candelária - RS', whatsapp: WPP, endereco: '' }
  }
}

// Componente de nav reutilizável
function Nav() {
  return (
    <nav className="bg-[#0D2137] sticky top-0 z-50 shadow-lg">
      <div className="px-6 flex items-center justify-between" style={{ height: "64px", overflow: "hidden" }}>
        <Link href="/site/imoveis" className="flex items-center">
          <Image src="/logo.png" alt="VisionLar" width={140} height={48} className="object-contain" style={{maxHeight:"52px", display:"block"}} />
        </Link>
        <div className="hidden md:flex gap-1">
          {[['Imóveis','/site/imoveis'],['Institucional','/site/institucional'],['Contato','/site/contato']].map(([l,h])=>(
            <Link key={l} href={h} className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all">{l}</Link>
          ))}
        </div>
        <a href={`https://wa.me/${WPP}`} target="_blank" rel="noopener"
          className="bg-[#B8892A] text-[#0D2137] px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#D4A843] transition-colors flex items-center gap-1.5">
          <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.867.486 3.622 1.338 5.147L2 22l4.975-1.302A10 10 0 0012 22c5.523 0 10-4.487 10-10C22 6.48 17.522 2 12 2z"/></svg>
          WhatsApp
        </a>
      </div>
    </nav>
  )
}

export default async function ContatoPage() {
  const cfg = await getConfig()

  const itens = [
    {
      ico: '📲',
      label: 'WHATSAPP',
      valor: cfg.telefone,
      link: `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de falar com a VisionLar Imóveis.')}`,
      btn: 'Enviar mensagem',
      color: 'bg-green-500 hover:bg-green-600 text-white',
    },
    {
      ico: '✉️',
      label: 'E-MAIL',
      valor: cfg.email,
      link: `mailto:${cfg.email}`,
      btn: 'Enviar e-mail',
      color: 'bg-[#0D2137] hover:bg-[#1A3558] text-white',
    },
    {
      ico: '📍',
      label: 'LOCALIZAÇÃO',
      valor: cfg.cidade_sede,
      extra: cfg.endereco || '',
      link: '',
      btn: '',
      color: '',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-bold text-3xl text-[#0D2137] mb-2" style={{fontFamily:'Playfair Display,serif'}}>
            Entre em <span className="text-[#B8892A]">Contato</span>
          </h1>
          <p className="text-gray-500 text-sm">Nossa equipe está pronta para te atender.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {itens.map(item => (
            <div key={item.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-gray-100">{item.ico}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{item.label}</div>
                <div className="font-bold text-gray-900 text-base">{item.valor}</div>
                {item.extra && <div className="text-xs text-gray-500 mt-0.5">{item.extra}</div>}
              </div>
              {item.btn && item.link && (
                <a href={item.link} target={item.link.startsWith('http') ? '_blank' : undefined} rel="noopener"
                  className={`${item.color} text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shrink-0`}>
                  {item.btn}
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#B8892A] to-[#A57820] rounded-2xl p-8 text-center">
          <h2 className="font-bold text-xl text-[#0D2137] mb-2" style={{fontFamily:'Playfair Display,serif'}}>
            Anuncie seu imóvel conosco
          </h2>
          <p className="text-[#0D2137]/70 text-sm mb-5">Avaliação gratuita e divulgação nos melhores canais.</p>
          <a href={`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de anunciar meu imóvel com a VisionLar.')}`}
            target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 bg-[#0D2137] text-white px-7 py-3 rounded-xl font-bold hover:bg-[#132844] transition-colors">
            📲 Solicitar avaliação gratuita
          </a>
        </div>
      </div>

      <footer className="bg-[#0D2137] py-4 px-6 flex items-center justify-between mt-8">
        <span className="text-white/25 text-[10px]">© 2025 VisionLar Imóveis</span>
        <a href="/adm" className="text-white/15 hover:text-white/50 text-[10px] border border-white/10 px-2.5 py-1 rounded-lg">🔐 Adm</a>
      </footer>
    </div>
  )
}
