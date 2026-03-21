import { supabase } from '@/lib/supabase'
import Link from 'next/link'

async function getStats() {
  const [imoveis, clientes, leads] = await Promise.all([
    supabase.from('imoveis').select('id, preco, finalidade', { count: 'exact' }),
    supabase.from('clientes').select('id', { count: 'exact' }),
    supabase.from('leads').select('id, status', { count: 'exact' }),
  ])
  const totalValor = (imoveis.data || [])
    .filter(i => i.finalidade === 'Venda')
    .reduce((s, i) => s + (i.preco || 0), 0)
  const leadsAbertos = (leads.data || []).filter(l => l.status === 'Lead' || l.status === 'Negociando').length
  return {
    imoveis: imoveis.count || 0,
    clientes: clientes.count || 0,
    leads: leadsAbertos,
    totalLeads: leads.count || 0,
    valor: totalValor,
  }
}

async function getRecentImoveis() {
  const { data } = await supabase
    .from('imoveis')
    .select('id, titulo, tipo, preco, finalidade, status, cidade:cidades(nome)')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

async function getRecentLeads() {
  const { data } = await supabase
    .from('leads')
    .select('id, interesse, status, data_contato, cliente:clientes(nome)')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

function fmtPreco(p: number) {
  if (p >= 1e6) return `R$ ${(p / 1e6).toFixed(1).replace('.', ',')}M`
  if (p >= 1e3) return `R$ ${(p / 1e3).toFixed(0)}k`
  return `R$ ${p.toLocaleString('pt-BR')}`
}

const statusBadge: Record<string, string> = {
  Ativo: 'bg-emerald-50 text-emerald-700',
  Inativo: 'bg-gray-100 text-gray-500',
  Lead: 'bg-amber-50 text-amber-700',
  Negociando: 'bg-yellow-50 text-yellow-800',
  Fechado: 'bg-emerald-50 text-emerald-700',
  Perdido: 'bg-red-50 text-red-700',
}

export default async function DashboardPage() {
  const [stats, imoveis, leads] = await Promise.all([
    getStats(),
    getRecentImoveis(),
    getRecentLeads(),
  ])

  const cards = [
    { label: 'Imóveis Cadastrados', value: stats.imoveis, icon: '🏠', color: 'bg-indigo-50 text-indigo-600', delta: `+${stats.imoveis}` },
    { label: 'Clientes Ativos', value: stats.clientes, icon: '👥', color: 'bg-amber-50 text-amber-600', delta: `+${stats.clientes}` },
    { label: 'Leads em Aberto', value: stats.leads, icon: '🎯', color: 'bg-emerald-50 text-emerald-600', delta: `${stats.totalLeads} total` },
    { label: 'Valor em Carteira', value: fmtPreco(stats.valor), icon: '💰', color: 'bg-orange-50 text-orange-600', delta: 'venda' },
  ]

  return (
    <>
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div>
          <div className="text-[15px] font-bold text-gray-900">Dashboard</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Visão geral do sistema</div>
        </div>
        <div className="flex gap-2">
          <Link href="/site" className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">🌐 Ver site</Link>
          <Link href="/imoveis" className="btn-gold text-xs px-4 py-1.5 rounded-lg">+ Novo Imóvel</Link>
        </div>
      </header>

      <main className="p-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${c.color}`}>{c.icon}</div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{c.delta}</span>
              </div>
              <div className="font-playfair text-3xl font-bold text-gray-900 leading-none">{c.value}</div>
              <div className="text-[11px] text-gray-400 mt-1 font-medium">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Tables */}
        <div className="grid grid-cols-2 gap-4">
          {/* Últimos imóveis */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Últimos Imóveis</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Recém cadastrados</p>
              </div>
              <Link href="/imoveis" className="text-[11px] border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors">Ver todos →</Link>
            </div>
            {imoveis.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">Nenhum imóvel cadastrado</div>
            ) : (
              <table className="w-full">
                <thead><tr className="bg-gray-50"><th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2">Imóvel</th><th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2">Preço</th><th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2">Status</th></tr></thead>
                <tbody>
                  {imoveis.map((i: any) => (
                    <tr key={i.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold text-gray-900 truncate max-w-[160px]">{i.titulo}</div>
                        <div className="text-[10px] text-gray-400">{i.tipo} · {i.cidade?.nome}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-900">{fmtPreco(i.preco)}{i.finalidade === 'Aluguel' && <span className="text-gray-400 font-normal">/mês</span>}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[i.status] || ''}`}>{i.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pipeline leads */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Pipeline de Leads</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Oportunidades ativas</p>
              </div>
              <Link href="/leads" className="text-[11px] border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors">Ver todos →</Link>
            </div>
            {leads.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">Nenhum lead cadastrado</div>
            ) : (
              <table className="w-full">
                <thead><tr className="bg-gray-50"><th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2">Cliente</th><th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2">Interesse</th><th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2">Status</th></tr></thead>
                <tbody>
                  {leads.map((l: any) => (
                    <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-xs font-semibold text-gray-900">{l.cliente?.nome}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{l.interesse}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[l.status] || ''}`}>{l.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
