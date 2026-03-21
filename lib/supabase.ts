import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sgrsjmizmwbsotamfsbw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_K-1zVIoMQ0GTbiAAqzLYeA_fLn3qwP9'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============ TYPES ============
export type Cidade = {
  id: string
  nome: string
  estado: string
  created_at?: string
}

export type Bairro = {
  id: string
  nome: string
  cidade_id: string
  cidade?: Cidade
  created_at?: string
}

export type TipoImovel = {
  id: string
  nome: string
  icone: string
}

export type Corretor = {
  id: string
  nome: string
  creci?: string
  telefone?: string
  email?: string
  status: 'Ativo' | 'Inativo'
}

export type Imovel = {
  id: string
  codigo?: string
  titulo: string
  tipo: string
  finalidade: 'Venda' | 'Aluguel'
  preco: number
  cidade_id: string
  bairro_id?: string
  endereco?: string
  area?: number
  dorms?: number
  suites?: number
  banhs?: number
  vagas?: number
  condominio?: number
  descricao?: string
  foto_url?: string
  fotos?: string[]
  comodidades?: string[]
  status: 'Ativo' | 'Inativo' | 'Vendido' | 'Alugado'
  destaque: boolean
  corretor_id?: string
  cidade?: Cidade
  bairro?: Bairro
  corretor?: Corretor
  created_at?: string
}

export type Cliente = {
  id: string
  nome: string
  cpf_cnpj?: string
  tipo: 'Comprador' | 'Vendedor' | 'Locador' | 'Locatário'
  telefone: string
  email?: string
  cidade_id?: string
  bairro?: string
  observacoes?: string
  cidade?: Cidade
  created_at?: string
}

export type Lead = {
  id: string
  cliente_id: string
  imovel_id?: string
  corretor_id?: string
  interesse: 'Compra' | 'Aluguel' | 'Venda'
  status: 'Lead' | 'Negociando' | 'Fechado' | 'Perdido'
  orcamento?: number
  observacoes?: string
  data_contato?: string
  cliente?: Cliente
  imovel?: Imovel
  corretor?: Corretor
  created_at?: string
}

// ============ QUERIES ============
export const db = {
  // IMÓVEIS
  imoveis: {
    list: (filters?: { finalidade?: string; tipo?: string; cidade_id?: string; status?: string }) =>
      supabase
        .from('imoveis')
        .select('*, cidade:cidades(id,nome,estado), bairro:bairros(id,nome), corretor:corretores(id,nome,creci)')
        .match(filters || {})
        .order('created_at', { ascending: false }),

    listPublic: () =>
      supabase
        .from('imoveis')
        .select('*, cidade:cidades(id,nome,estado), bairro:bairros(id,nome)')
        .eq('status', 'Ativo')
        .order('destaque', { ascending: false })
        .order('created_at', { ascending: false }),

    insert: (data: Omit<Imovel, 'id' | 'created_at'>) =>
      supabase.from('imoveis').insert(data).select().single(),

    update: (id: string, data: Partial<Imovel>) =>
      supabase.from('imoveis').update(data).eq('id', id).select().single(),

    delete: (id: string) =>
      supabase.from('imoveis').delete().eq('id', id),
  },

  // CLIENTES
  clientes: {
    list: () =>
      supabase
        .from('clientes')
        .select('*, cidade:cidades(id,nome,estado)')
        .order('created_at', { ascending: false }),

    insert: (data: Omit<Cliente, 'id' | 'created_at'>) =>
      supabase.from('clientes').insert(data).select().single(),

    update: (id: string, data: Partial<Cliente>) =>
      supabase.from('clientes').update(data).eq('id', id).select().single(),

    delete: (id: string) =>
      supabase.from('clientes').delete().eq('id', id),
  },

  // LEADS
  leads: {
    list: (status?: string) => {
      let q = supabase
        .from('leads')
        .select('*, cliente:clientes(id,nome,telefone), imovel:imoveis(id,titulo), corretor:corretores(id,nome)')
        .order('created_at', { ascending: false })
      if (status) q = q.eq('status', status)
      return q
    },

    insert: (data: Omit<Lead, 'id' | 'created_at'>) =>
      supabase.from('leads').insert(data).select().single(),

    update: (id: string, data: Partial<Lead>) =>
      supabase.from('leads').update(data).eq('id', id).select().single(),

    delete: (id: string) =>
      supabase.from('leads').delete().eq('id', id),
  },

  // CIDADES
  cidades: {
    list: () => supabase.from('cidades').select('*').order('nome'),
    insert: (data: { nome: string; estado: string }) =>
      supabase.from('cidades').insert(data).select().single(),
    delete: (id: string) => supabase.from('cidades').delete().eq('id', id),
  },

  // BAIRROS
  bairros: {
    list: () =>
      supabase
        .from('bairros')
        .select('*, cidade:cidades(id,nome,estado)')
        .order('nome'),
    byCidade: (cidadeId: string) =>
      supabase.from('bairros').select('*').eq('cidade_id', cidadeId).order('nome'),
    insert: (data: { nome: string; cidade_id: string }) =>
      supabase.from('bairros').insert(data).select().single(),
    delete: (id: string) => supabase.from('bairros').delete().eq('id', id),
  },

  // TIPOS
  tipos: {
    list: () => supabase.from('tipos_imovel').select('*').order('nome'),
    insert: (data: { nome: string; icone: string }) =>
      supabase.from('tipos_imovel').insert(data).select().single(),
    delete: (id: string) => supabase.from('tipos_imovel').delete().eq('id', id),
  },

  // CORRETORES
  corretores: {
    list: () => supabase.from('corretores').select('*').order('nome'),
    insert: (data: Omit<Corretor, 'id'>) =>
      supabase.from('corretores').insert(data).select().single(),
    update: (id: string, data: Partial<Corretor>) =>
      supabase.from('corretores').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('corretores').delete().eq('id', id),
  },
}
