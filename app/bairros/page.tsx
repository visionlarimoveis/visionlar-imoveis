'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export default function BairrosPage(){
  const [bairros,setBairros]=useState<any[]>([])
  const [cidades,setCidades]=useState<any[]>([])
  const [editId,setEditId]=useState<string|null>(null)
  const [nome,setNome]=useState('')
  const [cidadeId,setCidadeId]=useState('')
  const [toast,setToast]=useState('')
  const showToast=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),2800)}

  const load=useCallback(async()=>{
    const {data}=await supabase.from('bairros').select('*, cidade:cidades(id,nome,estado)').order('nome')
    setBairros(data||[])
  },[])

  useEffect(()=>{
    load()
    supabase.from('cidades').select('*').order('nome').then(r=>{
      setCidades(r.data||[])
      if(r.data?.length&&!cidadeId)setCidadeId(r.data[0].id)
    })
  },[load])

  function abrirEditar(b:any){setEditId(b.id);setNome(b.nome);setCidadeId(b.cidade_id)}
  function cancelar(){setEditId(null);setNome('');if(cidades.length)setCidadeId(cidades[0].id)}

  async function salvar(){
    if(!nome.trim()||!cidadeId){showToast('⚠️ Preencha os campos!');return}
    let error
    if(editId){({error}=await supabase.from('bairros').update({nome:nome.trim(),cidade_id:cidadeId}).eq('id',editId))}
    else{({error}=await supabase.from('bairros').insert({nome:nome.trim(),cidade_id:cidadeId}))}
    if(error)showToast('❌ '+error.message)
    else{showToast(editId?'✅ Bairro atualizado!':'📍 Bairro adicionado!');cancelar();load()}
  }

  async function deletar(id:string){
    await supabase.from('bairros').delete().eq('id',id)
    showToast('🗑 Excluído');load()
  }

  const gc=(id:string)=>cidades.find(c=>c.id===id)||{nome:'—',estado:''}

  return(
    <>
      <header className="bg-white border-b border-gray-200 px-6 h-[58px] flex items-center sticky top-0 z-40 shadow-sm">
        <div><div className="text-[15px] font-bold text-gray-900">Bairros</div><div className="text-[11px] text-gray-400 mt-0.5">Bairros por cidade</div></div>
      </header>
      <main className="p-5 grid grid-cols-[340px,1fr] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-900">{editId?'✏️ Editar Bairro':'➕ Novo Bairro'}</h3></div>
          <div className="p-5 flex flex-col gap-3">
            <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Cidade<span className="text-red-500">*</span></label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white" value={cidadeId} onChange={e=>setCidadeId(e.target.value)}>{cidades.map(c=><option key={c.id} value={c.id}>{c.nome} - {c.estado}</option>)}</select></div>
            <div><label className="text-[11px] font-bold text-gray-700 block mb-1">Nome do Bairro<span className="text-red-500">*</span></label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" placeholder="Ex: Centro" value={nome} onChange={e=>setNome(e.target.value)}/></div>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            {editId&&<button onClick={cancelar} className="text-xs border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">Cancelar</button>}
            <button onClick={salvar} className="btn-gold flex-1 text-xs py-2 rounded-lg">{editId?'💾 Salvar Alterações':'+ Adicionar'}</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-900">Bairros Cadastrados</h3></div>
          <table className="w-full">
            <thead><tr className="bg-gray-50">{['Bairro','Cidade','Ações'].map(h=><th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5">{h}</th>)}</tr></thead>
            <tbody>{bairros.map(b=>(
              <tr key={b.id} className={`border-t border-gray-100 hover:bg-gray-50/50 ${editId===b.id?'bg-amber-50':''}`}>
                <td className="px-4 py-3 text-xs font-semibold text-gray-900">{b.nome}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{b.cidade?.nome} - {b.cidade?.estado}</td>
                <td className="px-4 py-3"><div className="flex gap-1.5">
                  <button onClick={()=>abrirEditar(b)} className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-lg hover:bg-amber-100 border border-amber-200 font-bold">✏️ Editar</button>
                  <button onClick={()=>deletar(b.id)} className="bg-red-50 text-red-600 text-[10px] px-2.5 py-1 rounded-lg hover:bg-red-100 border border-red-100 font-bold">🗑</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </main>
      {toast&&<div className="fixed bottom-5 right-5 bg-[#0D2137] text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold z-[100]">{toast}</div>}
    </>
  )
}
