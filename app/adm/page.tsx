'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function AdmLoginPage() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function entrar() {
    if (!senha.trim()) { setErro('Digite a senha.'); return }
    setLoading(true)
    setErro('')

    try {
      // Busca a senha salva nas configurações do Supabase
      const { data, error } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'senha_adm')
        .single()

      let senhaCorreta = 'visionlar2025' // senha padrão se não configurada

      if (!error && data?.valor) {
        senhaCorreta = data.valor
      }

      if (senha === senhaCorreta) {
        // Salva no sessionStorage para manter logado na sessão
        sessionStorage.setItem('adm_auth', 'true')
        router.push('/dashboard')
      } else {
        setErro('Senha incorreta. Tente novamente.')
      }
    } catch (e) {
      // Se tabela não existir, usa senha padrão
      if (senha === 'visionlar2025') {
        sessionStorage.setItem('adm_auth', 'true')
        router.push('/dashboard')
      } else {
        setErro('Senha incorreta. Tente novamente.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0D2137] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#0D2137] px-8 py-8 text-center">
          <Image
            src="/logo.png"
            alt="VisionLar Imóveis"
            width={160}
            height={60}
            className="object-contain mx-auto"
          />
          <p className="text-white/40 text-xs mt-3 tracking-widest uppercase">Área Administrativa</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Acesso restrito</h2>
          <p className="text-xs text-gray-400 mb-6">Digite a senha para acessar o painel.</p>

          <div className="mb-4">
            <label className="text-[11px] font-bold text-gray-600 block mb-1.5">Senha</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B8892A] focus:ring-2 focus:ring-amber-100 transition-all"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && entrar()}
              autoFocus
            />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
              ⚠️ {erro}
            </div>
          )}

          <button
            onClick={entrar}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#B8892A] to-[#D4A843] text-[#0D2137] font-bold py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Verificando...
              </>
            ) : '🔐 Entrar'}
          </button>

          <div className="mt-5 text-center">
            <a href="/site" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
              ← Voltar ao site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
