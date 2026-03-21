'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const empty={nome:'',cpf_cnpj:'',tipo:'Comprador' as any,telefone:'',email:'',cidade_id:'',bairro:'',observacoes:''}

export default function ClientesPage(){
  const [clientes,setClientes]=useState<any[]>([])
  const [cidades,setCidades]=useState<any[]>([])
  const [modalOpen,setModalOpen]=useState(false)
  const [editId,setEditId]=useState<string|null>(null)
  const [form,setForm]=useState(empty)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState('')
  const [search,setSearch]=useState('')
  const [filtTipo,setFiltTipo]=useState('')

  const showToast=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),2800)}
  const inp=(k:keyof typeof empty)=>(e:any)=>setForm(f=>({...f,[k]:e.target.value}))

  const load=useCallback(async()=>{
    const {data}=await supabase.from('clientes').select('*, cidade:cidades(id,nome,estado)').order('created_at',{ascending:false})
    setClientes(data||[])
  },[])

  useEffect(()=>{load();supabase.from('cidades').select('*').order('nome').then(r=>setCidades(r.data||[]))},[load])

  const filtered=clientes.filter(c=>{
    const s=search.toLowerCase()
    if(s&&!c.nome?.toLowerCase().includes(s)&&!c.email?.toLowerCase().includes(s)&&!c.cpf_cnpj?.includes(s))return false
    if(filtTipo&&c.tipo!==filtTipo)return false
    return true
  })

  function abrirNovo(){setEditId(null);setForm(empty);setModalOpen(true)}
  function abrirEditar(c:any){
    setEditId(c.id)
    setForm({nome:c.nome||'',cpf_cnpj:c.cpf_cnpj||'',tipo:c.tipo||'Comprador',telefone:c.telefone||'',email:c.email||'',cidade_id:c.cidade_id||'',bairro:c.bairro||'',observacoes:c.observacoes||''})
    setModalOpen(true)
  }

  async function salvar(){
    if(!form.nome.trim()||!form.telefone.trim()){showToast('⚠️ Preencha nome e telefone!');return}
    setSaving(true)
    const payload={nome:form.nome,cpf_cnpj:form.cpf_cnpj||null,tipo:form.tipo,telefone:form.telefone,email:form.email||null,cidade_id:form.cidade_id||null,bairro:form.bairro||null,observacoes:form.observacoes||null}
    let error
    if(editId){({error}=await supabase.from('clientes').update(payload).eq('id',editId))}
    else{({error}=await supabase.from('clientes').insert(payload))}
    if(error)showToast('❌ '+error.message)
    else{showToast(editId?'✅ Cliente atualizado!':'👤 Cliente cadastrado!');setModalOpen(false);load()}
    setSaving(false)
  }

  async function deletar(id:string){
    if(!confirm('Excluir cliente?'))return
    await supabase.from('clientes').delete().eq('id',id)
    showToast('🗑 Excluído');load()
  }

  const ini=(n:string)=>n.split(' ').slice(0,2).map((p:string)=>p[0]).join('').toUpperCase()
  const avc=(id:string)=>['#0D2137','#1D4F82','#B8892A','#10B981','#9B51E0'][id.charCodeAt(0)%5]

  return(
    <>
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div><div className="text-[15px] font-bold text-gray-900">Clientes</div><div className="text-[11px] text-gray-400 mt-0.5">Base completa de clientes</div></div>
        <button onClick={abrirNovo} className="btn-gold text-xs px-4 py-1.5 rounded-lg">+ Novo Cliente</button>
      </header>

      <div className="bg-white border-b border-gray-200 px-5 py-3 flex gap-2 flex-wrap">
        <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-amber-500 flex-1 min-w-[180px]" placeholder="🔍 Nome, email, CPF..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white" value={filtTipo} onChange={e=>setFiltTipo(e.target.value)}><option value="">Todos os tipos</option><option>Comprador</option><option>Vendedor</option><option>Locador</option><option>Locatário</option></select>
      </div>

      <main className="p-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {filtered.length===0?<div className="text-center py-12 text-gray-400"><div className="text-3xl mb-2 opacity-40">👥</div><p className="text-sm">Nenhum cliente</p></div>:(
            <table className="w-full">
              <thead><tr className="bg-gray-50">{['Cliente','Telefone','Email','Tipo','Cidade','Observações','Ações'].map(h=><th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5">{h}</th>)}</tr></thead>
              <tbody>{filtered.map(c=>(
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{background:avc(c.id)}}>{ini(c.nome)}</div>
                    <div><div className="text-xs font-semibold text-gray-900">{c.nome}</div><div className="text-[10px] text-gray-400">{c.cpf_cnpj||''}</div></div>
                  </div></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{c.telefone}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{c.email||'—'}</td>
                  <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">{c.tipo}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{c.cidade?.nome||'—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[140px] truncate">{c.observacoes||'—'}</td>
                  <td className="px-4 py-3"><div className="flex gap-1.5">
                    <button onClick={()=>abrirEditar(c)} className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-lg hover:bg-amber-100 border border-amber-200 font-bold">✏️ Editar</button>
                    <button onClick={()=>deletar(c.id)} className="bg-red-50 text-red-600 text-[10px] px-2.5 py-1 rounded-lg hover:bg-red-100 border border-red-100 font-bold">🗑</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </main>

      {modalOpen&&(
        <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={e=>{if(e.target===e.currentTarget)setModalOpen(false)}}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-sm font-bold text-gray-900">{editId?'✏️ Editar Cliente':'👤 Novo Cliente'}</h2>
              <button onClick={()=>setModalOpen(false)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-sm">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="text-[11px] font-bold text-gray-700 block mb-1">Nome Completo<span className="text-red-500">*</span></label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.nome} onChange={inp('nome')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">CPF / CNPJ</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.cpf_cnpj} onChange={inp('cpf_cnpj')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Tipo</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.tipo} onChange={inp('tipo')}><option>Comprador</option><option>Vendedor</option><option>Locador</option><option>Locatário</option></select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">WhatsApp / Tel<span className="text-red-500">*</span></label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.telefone} onChange={inp('telefone')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Email</label><input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.email} onChange={inp('email')}/></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Cidade</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={form.cidade_id} onChange={inp('cidade_id')}><option value="">Selecione</option>{cidades.map(c=><option key={c.id} value={c.id}>{c.nome} - {c.estado}</option>)}</select></div>
              <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Bairro</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" value={form.bairro} onChange={inp('bairro')}/></div>
              <div className="col-span-2"><label className="text-[11px] font-bold text-gray-700 block mb-1">Observações</label><textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 resize-y min-h-[65px]" value={form.observacoes} onChange={inp('observacoes')}/></div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex gap-2 justify-end">
              <button onClick={()=>setModalOpen(false)} className="text-xs border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={salvar} disabled={saving} className="btn-gold text-xs px-5 py-2 rounded-lg disabled:opacity-60">{saving?'Salvando...':(editId?'💾 Salvar Alterações':'💾 Cadastrar')}</button>
            </div>
          </div>
        </div>
      )}
      {toast&&<div className="fixed bottom-5 right-5 bg-[#0D2137] text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold z-[100]">{toast}</div>}
    </>
  )
}
