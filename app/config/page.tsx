'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type Config = {
  nome: string
  creci: string
  whatsapp: string
  email: string
  telefone: string
  cidade_sede: string
  endereco: string
  sobre: string
}

const defaults: Config = {
  nome: 'VisionLar Imóveis',
  creci: '',
  whatsapp: '5551997901012',
  email: 'contato@visionlarimovies.com.br',
  telefone: '(51) 9 9790-1012',
  cidade_sede: 'Candelária - RS',
  endereco: '',
  sobre: 'A VisionLar Imóveis é uma empresa especializada em intermediação imobiliária.',
}

export default function ConfigPage() {
  const [config, setConfig] = useState<Config>(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success'|'error'>('success')

  const showToast = (m: string, type: 'success'|'error' = 'success') => {
    setToast(m)
    setToastType(type)
    setTimeout(() => setToast(''), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('configuracoes')
      .select('chave, valor')

    if (error) {
      // Tabela ainda não existe — usa defaults
      setConfig(defaults)
      setLoading(false)
      return
    }

    if (data && data.length > 0) {
      const cfg = { ...defaults }
      data.forEach((row: any) => {
        if (row.chave in cfg) {
          (cfg as any)[row.chave] = row.valor || ''
        }
      })
      setConfig(cfg)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const inp = (k: keyof Config) => (e: any) =>
    setConfig(c => ({ ...c, [k]: e.target.value }))

  async function salvar() {
    setSaving(true)
    try {
      // Upsert cada chave individualmente
      const entries = Object.entries(config).map(([chave, valor]) => ({
        chave,
        valor: valor || '',
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('configuracoes')
        .upsert(entries, { onConflict: 'chave' })

      if (error) {
        // Tenta criar a tabela via SQL se não existir
        if (error.message.includes('does not exist') || error.code === '42P01') {
          showToast('⚠️ Execute o SQL 002_configuracoes.sql no Supabase primeiro!', 'error')
        } else {
          showToast('❌ Erro ao salvar: ' + error.message, 'error')
        }
      } else {
        showToast('✅ Configurações salvas com sucesso!')
      }
    } catch (e: any) {
      showToast('❌ Erro: ' + e.message, 'error')
    }
    setSaving(false)
  }

  const fields: { key: keyof Config; label: string; placeholder: string; type?: string }[] = [
    { key: 'nome', label: 'Nome da Imobiliária', placeholder: 'VisionLar Imóveis' },
    { key: 'creci', label: 'CRECI', placeholder: 'Ex: 12345-J' },
    { key: 'whatsapp', label: 'WhatsApp (com DDI+DDD)', placeholder: '5551997901012' },
    { key: 'email', label: 'Email', placeholder: 'contato@visionlarimovies.com.br', type: 'email' },
    { key: 'telefone', label: 'Telefone', placeholder: '(51) 9 9790-1012' },
    { key: 'cidade_sede', label: 'Cidade Sede', placeholder: 'Candelária - RS' },
  ]

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center sticky top-0 z-40 shadow-sm">
        <div>
          <div className="text-[15px] font-bold text-gray-900">Configurações</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Dados gerais da imobiliária</div>
        </div>
      </header>

      <main className="p-5 max-w-3xl">
        {/* AVISO SQL */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <span className="text-amber-500 text-lg shrink-0">⚠️</span>
          <div>
            <div className="text-xs font-bold text-amber-800 mb-0.5">Execute o SQL no Supabase (só uma vez)</div>
            <div className="text-xs text-amber-700">
              Vá em <strong>Supabase → SQL Editor</strong> e execute o arquivo{' '}
              <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[10px]">supabase/migrations/002_configuracoes.sql</code>{' '}
              para habilitar o salvamento das configurações.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Dados da Imobiliária</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Estas informações aparecem no site público</p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Carregando...</div>
          ) : (
            <>
              <div className="p-5 grid grid-cols-2 gap-4">
                {fields.map(f => (
                  <div key={f.key}>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                      placeholder={f.placeholder}
                      value={config[f.key]}
                      onChange={inp(f.key)}
                    />
                  </div>
                ))}

                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Endereço Completo</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                    placeholder="Rua X, 123 - Centro - Candelária/RS"
                    value={config.endereco}
                    onChange={inp('endereco')}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Sobre a Empresa
                    <span className="text-gray-400 font-normal ml-1">(aparece no site)</span>
                  </label>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all resize-y min-h-[90px]"
                    value={config.sobre}
                    onChange={inp('sobre')}
                  />
                </div>
              </div>

              <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
                <button onClick={load} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  🔄 Recarregar
                </button>
                <button
                  onClick={salvar}
                  disabled={saving}
                  className="btn-gold text-xs px-6 py-2 rounded-lg disabled:opacity-60 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Salvando...
                    </>
                  ) : '💾 Salvar Configurações'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Variáveis Vercel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">🔑 Variáveis de Ambiente — Vercel</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Settings → Environment Variables no painel do Vercel</p>
          </div>
          <div className="p-5 space-y-2">
            {[
              ['NEXT_PUBLIC_SUPABASE_URL', 'https://sgrsjmizmwbsotamfsbw.supabase.co'],
              ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'sb_publishable_K-1zVIoMQ0GTbi...'],
              ['NEXT_PUBLIC_WHATSAPP', '5551997901012'],
            ].map(([key, val]) => (
              <div key={key} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5">
                <code className="text-[10px] font-bold text-[#B8892A] min-w-[260px]">{key}</code>
                <code className="text-[10px] text-gray-400 truncate">{val}</code>
              </div>
            ))}
          </div>
        </div>
      </main>

      {toast && (
        <div className={`fixed bottom-5 right-5 text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold z-[100] flex items-center gap-2 ${
          toastType === 'error' ? 'bg-red-600' : 'bg-[#0D2137]'
        }`}>
          {toast}
        </div>
      )}
    </>
  )
}
