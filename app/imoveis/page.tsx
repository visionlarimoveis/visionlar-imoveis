'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const FOTOS_DEFAULT = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80'
const emptyForm = {
  titulo:'', tipo:'', finalidade:'Venda' as 'Venda'|'Aluguel',
  preco:'', cidade_id:'', bairro_id:'', endereco:'',
  area:'', dorms:'', suites:'', banhs:'', vagas:'',
  condominio:'', descricao:'', foto_url:'',
  status:'Ativo' as any, destaque:false, corretor_id:'',
}

function fmtP(p:number,f:string){
  const v=p>=1e6?`R$ ${(p/1e6).toFixed(1).replace('.',',')}M`:p>=1e3?`R$ ${(p/1e3).toFixed(0)}k`:`R$ ${p.toLocaleString('pt-BR')}`
  return f==='Aluguel'?`${v}/mês`:v
}

export default function ImoveisPage(){
  const [imoveis,setImoveis]=useState<any[]>([])
  const [cidades,setCidades]=useState<any[]>([])
  const [bairros,setBairros]=useState<any[]>([])
  const [tipos,setTipos]=useState<any[]>([])
  const [corretores,setCorretores]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [modalOpen,setModalOpen]=useState(false)
  const [editId,setEditId]=useState<string|null>(null)
  const [verOpen,setVerOpen]=useState<any>(null)
  const [form,setForm]=useState(emptyForm)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState('')
  const [search,setSearch]=useState('')
  const [filtFin,setFiltFin]=useState('')
  const [filtTipo,setFiltTipo]=useState('')
  const [filtCid,setFiltCid]=useState('')
  const [filtSt,setFiltSt]=useState('')
  const [view,setView]=useState<'grid'|'lista'>('grid')

  const showToast=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),2800)}
  const inp=(k:keyof typeof emptyForm)=>(e:any)=>setForm(f=>({...f,[k]:e.target.value}))

  const load=useCallback(async()=>{
    setLoading(true)
    const {data}=await supabase.from('imoveis')
      .select('*, cidade:cidades(id,nome,estado), bairro:bairros(id,nome), corretor:corretores(id,nome)')
      .order('created_at',{ascending:false})
    setImoveis(data||[])
    setLoading(false)
  },[])

  useEffect(()=>{
    load()
    supabase.from('cidades').select('*').order('nome').then(r=>setCidades(r.data||[]))
    supabase.from('tipos_imovel').select('*').order('nome').then(r=>setTipos(r.data||[]))
    supabase.from('corretores').select('*').order('nome').then(r=>setCorretores(r.data||[]))
  },[load])

  useEffect(()=>{
    if(form.cidade_id){
      supabase.from('bairros').select('*').eq('cidade_id',form.cidade_id).order('nome')
        .then(r=>setBairros(r.data||[]))
    } else setBairros([])
  },[form.cidade_id])

  const filtered=imoveis.filter(i=>{
    const s=search.toLowerCase()
    if(s&&!i.titulo?.toLowerCase().includes(s)&&!i.cidade?.nome?.toLowerCase().includes(s))return false
    if(filtFin&&i.finalidade!==filtFin)return false
    if(filtTipo&&i.tipo!==filtTipo)return false
    if(filtCid&&i.cidade_id!==filtCid)return false
    if(filtSt&&i.status!==filtSt)return false
    return true
  })

  function abrirNovo(){
    setEditId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function abrirEditar(im:any){
    setEditId(im.id)
    setForm({
      titulo:im.titulo||'', tipo:im.tipo||'', finalidade:im.finalidade||'Venda',
      preco:String(im.preco||''), cidade_id:im.cidade_id||'', bairro_id:im.bairro_id||'',
      endereco:im.endereco||'', area:String(im.area||''), dorms:String(im.dorms||''),
      suites:String(im.suites||''), banhs:String(im.banhs||''), vagas:String(im.vagas||''),
      condominio:String(im.condominio||''), descricao:im.descricao||'', foto_url:im.foto_url||'',
      status:im.status||'Ativo', destaque:im.destaque||false, corretor_id:im.corretor_id||'',
    })
    setModalOpen(true)
  }

  async function salvar(){
    const titulo=form.titulo.trim()
    const preco=parseFloat(form.preco)
    const cidade_id=form.cidade_id
    if(!titulo||!preco||!cidade_id){showToast('⚠️ Preencha título, preço e cidade!');return}
    setSaving(true)
    const payload={
      titulo,preco,cidade_id,tipo:form.tipo||tipos[0]?.nome,
      finalidade:form.finalidade,bairro_id:form.bairro_id||null,
      endereco:form.endereco||null,area:form.area?parseFloat(form.area):null,
      dorms:form.dorms?parseInt(form.dorms):0,suites:form.suites?parseInt(form.suites):0,
      banhs:form.banhs?parseInt(form.banhs):0,vagas:form.vagas?parseInt(form.vagas):0,
      condominio:form.condominio?parseFloat(form.condominio):0,
      descricao:form.descricao||null,foto_url:form.foto_url||null,
      status:form.status,destaque:form.destaque,
      corretor_id:form.corretor_id||null,
    }
    let error
    if(editId){
      const res=await supabase.from('imoveis').update(payload).eq('id',editId)
      error=res.error
    } else {
      const res=await supabase.from('imoveis').insert(payload)
      error=res.error
    }
    if(error){showToast('❌ Erro: '+error.message)}
    else{showToast(editId?'✅ Imóvel atualizado!':'🏠 Imóvel cadastrado!');setModalOpen(false);load()}
    setSaving(false)
  }

  async function deletar(id:string){
    if(!confirm('Excluir este imóvel?'))return
    await supabase.from('imoveis').delete().eq('id',id)
    showToast('🗑 Excluído');load()
  }

  const badgeFin=(f:string)=>f==='Venda'?'bg-indigo-50 text-indigo-700':'bg-emerald-50 text-emerald-700'
  const badgeSt=(s:string)=>s==='Ativo'?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-500'

  return(
    <>
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div><div className="text-[15px] font-bold text-gray-900">Imóveis</div><div className="text-[11px] text-gray-400 mt-0.5">Carteira completa de imóveis</div></div>
        <div className="flex gap-2">
          <select className="text-xs border border-gray-200 px-2 py-1.5 rounded-lg bg-white outline-none" value={view} onChange={e=>setView(e.target.value as any)}>
            <option value="grid">Grid</option><option value="lista">Lista</option>
          </select>
          <button onClick={abrirNovo} className="btn-gold text-xs px-4 py-1.5 rounded-lg">+ Novo Imóvel</button>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 px-5 py-3 flex gap-2 flex-wrap">
        <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-amber-500 flex-1 min-w-[180px]" placeholder="🔍 Título, bairro, cidade..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtFin} onChange={e=>setFiltFin(e.target.value)}><option value="">Finalidade</option><option>Venda</option><option>Aluguel</option></select>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtTipo} onChange={e=>setFiltTipo(e.target.value)}><option value="">Tipo</option>{tipos.map(t=><option key={t.id}>{t.nome}</option>)}</select>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtCid} onChange={e=>setFiltCid(e.target.value)}><option value="">Cidade</option>{cidades.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtSt} onChange={e=>setFiltSt(e.target.value)}><option value="">Status</option><option>Ativo</option><option>Inativo</option></select>
      </div>

      <main className="p-5">
        {loading?<div className="text-center py-16 text-gray-400 text-sm">Carregando...</div>:
        filtered.length===0?<div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3 opacity-40">🏠</div><p className="text-sm">Nenhum imóvel encontrado</p></div>:
        view==='grid'?(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((i,idx)=>(
              <div key={i.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                <div className="relative h-44 overflow-hidden bg-gray-100 cursor-pointer" onClick={()=>setVerOpen(i)}>
                  <img src={i.foto_url||`https://images.unsplash.com/photo-157012947749${idx%3}2-45c003edd2be?w=400&q=70`} alt={i.titulo} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onError={e=>{(e.target as any).src=FOTOS_DEFAULT}}/>
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeFin(i.finalidade)}`}>{i.finalidade}</span>
                  </div>
                  {i.destaque&&<div className="absolute top-2 right-2 bg-[#B8892A] text-white text-[9px] font-black px-2 py-0.5 rounded-full">★</div>}
                </div>
                <div className="p-3">
                  <div className="font-bold text-lg text-gray-900" style={{fontFamily:'Playfair Display,serif'}}>{fmtP(i.preco,i.finalidade)}</div>
                  <div className="text-xs font-semibold text-gray-700 truncate mt-0.5">{i.titulo}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">📍 {i.bairro?.nome?`${i.bairro.nome}, `:''}{i.cidade?.nome}</div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {i.area?<span className="text-[9px] text-gray-400">📐{i.area}m²</span>:null}
                    {i.dorms?<span className="text-[9px] text-gray-400">🛏{i.dorms}</span>:null}
                    {i.banhs?<span className="text-[9px] text-gray-400">🚿{i.banhs}</span>:null}
                    {i.vagas?<span className="text-[9px] text-gray-400">🚗{i.vagas}</span>:null}
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    <button onClick={()=>setVerOpen(i)} className="flex-1 bg-gray-100 text-gray-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-gray-200 transition-colors">👁 Ver</button>
                    <button onClick={()=>abrirEditar(i)} className="flex-1 bg-amber-50 text-amber-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200">✏️ Editar</button>
                    <button onClick={()=>deletar(i.id)} className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1.5 rounded-lg hover:bg-red-100 border border-red-100">🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ):(
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-gray-50">{['Imóvel','Tipo','Finalidade','Preço','Local','Status','Ações'].map(h=><th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5">{h}</th>)}</tr></thead>
              <tbody>{filtered.map(i=>(
                <tr key={i.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3"><div className="text-xs font-semibold text-gray-900 max-w-[200px] truncate">{i.titulo}</div></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{i.tipo}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeFin(i.finalidade)}`}>{i.finalidade}</span></td>
                  <td className="px-4 py-3 text-xs font-bold">{fmtP(i.preco,i.finalidade)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{i.cidade?.nome}{i.bairro?.nome?` / ${i.bairro.nome}`:''}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeSt(i.status)}`}>{i.status}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-1.5">
                    <button onClick={()=>abrirEditar(i)} className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-lg hover:bg-amber-100 border border-amber-200 font-bold">✏️ Editar</button>
                    <button onClick={()=>deletar(i.id)} className="bg-red-50 text-red-600 text-[10px] px-2.5 py-1 rounded-lg hover:bg-red-100 border border-red-100 font-bold">🗑</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL NOVO/EDITAR */}
      {modalOpen&&(
        <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={e=>{if(e.target===e.currentTarget)setModalOpen(false)}}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-sm font-bold text-gray-900">{editId?'✏️ Editar Imóvel':'🏠 Novo Imóvel'}</h2>
              <button onClick={()=>setModalOpen(false)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-sm">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="text-[11px] font-bold text-gray-700 block mb-1">Título<span className="text-red-500">*</span></label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="Ex: Apartamento 3 dorms no Centro" value={form.titulo} onChange={inp('titulo')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Tipo<span className="text-red-500">*</span></label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.tipo} onChange={inp('tipo')}><option value="">Selecione</option>{tipos.map(t=><option key={t.id}>{t.nome}</option>)}</select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Finalidade<span className="text-red-500">*</span></label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.finalidade} onChange={inp('finalidade')}><option>Venda</option><option>Aluguel</option></select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Preço (R$)<span className="text-red-500">*</span></label><input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="350000" value={form.preco} onChange={inp('preco')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Cidade<span className="text-red-500">*</span></label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.cidade_id} onChange={inp('cidade_id')}><option value="">Selecione</option>{cidades.map(c=><option key={c.id} value={c.id}>{c.nome} - {c.estado}</option>)}</select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Bairro</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.bairro_id} onChange={inp('bairro_id')}><option value="">Selecione</option>{bairros.map(b=><option key={b.id} value={b.id}>{b.nome}</option>)}</select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Endereço</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="Rua X, 123" value={form.endereco} onChange={inp('endereco')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Área (m²)</label><input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.area} onChange={inp('area')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Dormitórios</label><input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.dorms} onChange={inp('dorms')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Suítes</label><input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.suites} onChange={inp('suites')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Banheiros</label><input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.banhs} onChange={inp('banhs')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Vagas Garagem</label><input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.vagas} onChange={inp('vagas')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Condomínio (R$/mês)</label><input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.condominio} onChange={inp('condominio')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Corretor</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.corretor_id} onChange={inp('corretor_id')}><option value="">Sem corretor</option>{corretores.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Status</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.status} onChange={inp('status')}><option>Ativo</option><option>Inativo</option><option>Vendido</option><option>Alugado</option></select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Destaque no site?</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.destaque?'1':'0'} onChange={e=>setForm(f=>({...f,destaque:e.target.value==='1'}))}><option value="0">Não</option><option value="1">Sim</option></select></div>
              <div className="col-span-2"><label className="text-[11px] font-bold text-gray-700 block mb-1">Descrição</label><textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 resize-y min-h-[70px]" value={form.descricao} onChange={inp('descricao')}/></div>
              <div className="col-span-2"><label className="text-[11px] font-bold text-gray-700 block mb-1">URL da Foto Principal</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="https://..." value={form.foto_url} onChange={inp('foto_url')}/></div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex gap-2 justify-end">
              <button onClick={()=>setModalOpen(false)} className="text-xs border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={salvar} disabled={saving} className="btn-gold text-xs px-5 py-2 rounded-lg disabled:opacity-60">{saving?'Salvando...':(editId?'💾 Salvar Alterações':'💾 Cadastrar Imóvel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER */}
      {verOpen&&(
        <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={e=>{if(e.target===e.currentTarget)setVerOpen(null)}}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <img src={verOpen.foto_url||FOTOS_DEFAULT} alt={verOpen.titulo} className="w-full h-52 object-cover rounded-t-2xl"/>
            <div className="p-5">
              <div className="font-bold text-2xl text-[#0D2137] mb-1" style={{fontFamily:'Playfair Display,serif'}}>{fmtP(verOpen.preco,verOpen.finalidade)}</div>
              <div className="text-sm font-semibold text-gray-800">{verOpen.titulo}</div>
              <div className="text-xs text-gray-400 mt-0.5 mb-3">📍 {verOpen.bairro?.nome?`${verOpen.bairro.nome}, `:''}{verOpen.cidade?.nome}</div>
              <div className="flex gap-4 py-3 border-t border-b border-gray-100 mb-3 flex-wrap text-center">
                {verOpen.area?<div><div className="font-bold text-sm">{verOpen.area}m²</div><div className="text-[9px] text-gray-400">Área</div></div>:null}
                {verOpen.dorms?<div><div className="font-bold text-sm">{verOpen.dorms}</div><div className="text-[9px] text-gray-400">Dorms</div></div>:null}
                {verOpen.suites?<div><div className="font-bold text-sm">{verOpen.suites}</div><div className="text-[9px] text-gray-400">Suítes</div></div>:null}
                {verOpen.banhs?<div><div className="font-bold text-sm">{verOpen.banhs}</div><div className="text-[9px] text-gray-400">Banhs</div></div>:null}
                {verOpen.vagas?<div><div className="font-bold text-sm">{verOpen.vagas}</div><div className="text-[9px] text-gray-400">Vagas</div></div>:null}
              </div>
              {verOpen.descricao&&<p className="text-xs text-gray-500 leading-relaxed mb-3">{verOpen.descricao}</p>}
              <div className="flex gap-2">
                <button onClick={()=>{setVerOpen(null);abrirEditar(verOpen)}} className="flex-1 bg-amber-50 text-amber-700 text-xs font-bold py-2.5 rounded-xl border border-amber-200 hover:bg-amber-100">✏️ Editar</button>
                <button onClick={()=>setVerOpen(null)} className="border border-gray-200 text-xs px-4 py-2.5 rounded-xl hover:bg-gray-50">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast&&<div className="fixed bottom-5 right-5 bg-[#0D2137] text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold z-[100]">{toast}</div>}
    </>
  )
}
