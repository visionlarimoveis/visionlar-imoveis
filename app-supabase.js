/* VISIONLAR — SUPABASE INTEGRATION v2
   Edite as 3 linhas abaixo com suas credenciais */

const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'sua-anon-key-aqui';
const WHATSAPP_NUM = '5551997901012';

/* ---- cliente Supabase sem SDK ---- */
const sb = {
  _token: null,
  h(extra={}) {
    return { 'Content-Type':'application/json', 'apikey':SUPABASE_ANON_KEY,
      'Authorization':`Bearer ${this._token||SUPABASE_ANON_KEY}`, ...extra };
  },
  async get(table, qs='', prefer='') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`,
      { headers: this.h(prefer?{'Prefer':prefer}:{}) });
    if (!r.ok) throw new Error(await r.text());
    return { data: await r.json(), headers: r.headers };
  },
  async post(table, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`,
      { method:'POST', headers: this.h({'Prefer':'return=representation'}), body:JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async patch(table, match, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`,
      { method:'PATCH', headers: this.h({'Prefer':'return=representation'}), body:JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async del(table, match) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`,
      { method:'DELETE', headers: this.h() });
  },
  async login(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      { method:'POST', headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY},
        body:JSON.stringify({email,password}) });
    const d = await r.json();
    if (d.error) throw new Error(d.error_description||d.error);
    this._token = d.access_token;
    localStorage.setItem('vl_tk', d.access_token);
    return d;
  },
  async logout() {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`,
      { method:'POST', headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${this._token}`} });
    this._token = null;
    localStorage.removeItem('vl_tk');
  },
  restore() { const t=localStorage.getItem('vl_tk'); if(t) this._token=t; return !!t; },
  isAuth() { return !!this._token; },
  async upload(path, file) {
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/imoveis-fotos/${path}`,
      { method:'POST', headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${this._token}`,'Content-Type':file.type}, body:file });
    if (!r.ok) throw new Error('Erro upload');
    return `${SUPABASE_URL}/storage/v1/object/public/imoveis-fotos/${path}`;
  }
};

/* ---- STATE ---- */
const ST = {
  cidades:[], tipos:[], cfg:{}, filterNums:{quartos:0,vagas:0},
  listPage:1, perPage:9, total:0, heroFinalidade:'venda',
  currentImovel:null, galleryIdx:0
};

/* ---- UTILS ---- */
const fmt = (v,f) => {
  const n = parseFloat(v).toLocaleString('pt-BR');
  return f==='aluguel' ? `R$ ${n}<span>/mês</span>` : `R$ ${n}`;
};
const fmtC = (v,f) => {
  const n = parseFloat(v).toLocaleString('pt-BR');
  return f==='aluguel' ? `R$ ${n}/mês` : `R$ ${n}`;
};
function toast(msg, ok=true) {
  const t=document.getElementById('toast');
  t.textContent=(ok?'✅ ':'❌ ')+msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3500);
}
function loading(id) {
  const el=document.getElementById(id);
  if(el) el.innerHTML='<div class="loading"><div class="spinner"></div></div>';
}
const icon = i => i?.tipos_imovel?.icone || '🏠';
const foto = i => i?.imovel_fotos?.find(f=>f.capa)?.url || i?.imovel_fotos?.[0]?.url || null;

/* ---- CARD HTML ---- */
function cardHTML(i) {
  const badges = [];
  badges.push(`<span class="badge badge-${i.finalidade}">${i.finalidade==='venda'?'Venda':'Aluguel'}</span>`);
  if(i.destaque) badges.push('<span class="badge badge-destaque">⭐ Destaque</span>');
  if(i.oportunidade) badges.push('<span class="badge badge-oportunidade">🔥 Oferta</span>');
  if(i.novo) badges.push('<span class="badge badge-novo">🆕 Novo</span>');
  const f = foto(i);
  const imgH = f
    ? `<img src="${f}" alt="${i.titulo}" style="width:100%;height:100%;object-fit:cover;">`
    : `<div class="card-img-inner"><div class="card-img-icon">${icon(i)}</div></div>`;
  const feats = [];
  if(i.quartos>0) feats.push(`<div class="feat"><span>🛏️</span><span>${i.quartos} qts</span></div>`);
  if(i.banheiros>0) feats.push(`<div class="feat"><span>🚿</span><span>${i.banheiros} ban</span></div>`);
  if(i.vagas>0) feats.push(`<div class="feat"><span>🚗</span><span>${i.vagas} vg</span></div>`);
  if(i.area_total>0) feats.push(`<div class="feat"><span>📐</span><span>${i.area_total}m²</span></div>`);
  const loc=[i.bairros?.nome,i.cidades?.nome,i.estados?.uf].filter(Boolean).join(', ');
  const wa=ST.cfg.whatsapp||WHATSAPP_NUM;
  const waMsg=encodeURIComponent(`Olá! Tenho interesse no imóvel ${i.codigo}`);
  return `
    <div class="imovel-card" onclick="showDetail('${i.id}')">
      <div class="card-img">${imgH}<div class="card-badges">${badges.join('')}</div></div>
      <div class="card-body">
        <div class="card-price">${fmt(i.preco,i.finalidade)}</div>
        <div class="card-title">${i.titulo}</div>
        <div class="card-location">📍 ${loc}</div>
        <div class="card-features">${feats.join('')}</div>
        <div class="card-footer">
          <button class="btn btn-primary" onclick="event.stopPropagation();showDetail('${i.id}')">Ver Detalhes</button>
          <a class="btn btn-whatsapp" href="https://wa.me/${wa}?text=${waMsg}" target="_blank" onclick="event.stopPropagation()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        </div>
      </div>
    </div>`;
}

/* ---- FETCH ---- */
async function getImoveis(f={}, page=1, per=9) {
  try {
    const qs=[];
    qs.push('ativo=eq.true');
    if(f.finalidade) qs.push(`finalidade=eq.${f.finalidade}`);
    if(f.tipo_id) qs.push(`tipo_id=eq.${f.tipo_id}`);
    if(f.cidade_id) qs.push(`cidade_id=eq.${f.cidade_id}`);
    if(f.bairro_id) qs.push(`bairro_id=eq.${f.bairro_id}`);
    if(f.precoMin) qs.push(`preco=gte.${f.precoMin}`);
    if(f.precoMax) qs.push(`preco=lte.${f.precoMax}`);
    if(f.quartos) qs.push(`quartos=gte.${f.quartos}`);
    if(f.vagas) qs.push(`vagas=gte.${f.vagas}`);
    if(f.destaque) qs.push('destaque=eq.true');
    if(f.oportunidade) qs.push('oportunidade=eq.true');
    if(f.novo) qs.push('novo=eq.true');
    let ord = f.sort==='preco-asc'?'preco.asc':f.sort==='preco-desc'?'preco.desc':'created_at.desc';
    const offset=(page-1)*per;
    const filter=qs.join('&');
    const sel='id,codigo,titulo,preco,finalidade,quartos,banheiros,vagas,area_total,destaque,oportunidade,novo,tipos_imovel(icone),bairros(nome),cidades(nome),estados(uf),imovel_fotos(url,capa)';
    const {data,headers} = await sb.get('imoveis',`${filter}&select=${sel}&order=${ord}&limit=${per}&offset=${offset}`,'count=exact');
    const total=parseInt(headers.get('Content-Range')?.split('/')[1]||'0');
    return {data,total};
  } catch(e){ console.error(e); return {data:[],total:0}; }
}

async function getImovelById(id) {
  try {
    const {data}=await sb.get('imoveis',`id=eq.${id}&ativo=eq.true&select=*,tipos_imovel(nome,icone),bairros(nome),cidades(nome),estados(uf,nome),imovel_fotos(url,legenda,ordem,capa)`);
    return data[0]||null;
  } catch(e){console.error(e);return null;}
}

async function getCidades() {
  try{ const {data}=await sb.get('cidades','ativo=eq.true&select=id,nome,estados(uf)&order=nome.asc'); return data; }catch{return [];}
}
async function getBairros(cid) {
  try{ const {data}=await sb.get('bairros',`cidade_id=eq.${cid}&ativo=eq.true&select=id,nome&order=nome.asc`); return data; }catch{return [];}
}
async function getTipos() {
  try{ const {data}=await sb.get('tipos_imovel','ativo=eq.true&select=id,nome,icone'); return data; }catch{return [];}
}
async function getCfg() {
  try{ const {data}=await sb.get('configuracoes','select=chave,valor'); const c={}; data.forEach(r=>c[r.chave]=r.valor); return c; }catch{return {};}
}

function renderGrid(id, items) {
  const el=document.getElementById(id);
  if(!el) return;
  el.innerHTML = items?.length
    ? items.map(i=>cardHTML(i)).join('')
    : '<div class="empty-state" style="grid-column:1/-1"><span>🔍</span><h3>Nenhum imóvel encontrado</h3></div>';
}

/* ---- ROUTING ---- */
async function showPage(page, params={}) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page)?.classList.add('active');
  if(params.finalidade) ST.filters_finalidade=params.finalidade;
  if(page==='home') await renderHome();
  else if(page==='list'){ST.listPage=1;await renderList(params);}
  else if(page==='admin'){
    if(!sb.isAuth()){showLoginModal();return;}
    await renderAdmin();
  }
  window.scrollTo({top:0,behavior:'smooth'});
  closeMenu();
}

async function showDetail(id) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-detail').classList.add('active');
  document.getElementById('detail-content').innerHTML='<div class="loading" style="min-height:400px"><div class="spinner"></div></div>';
  window.scrollTo({top:0,behavior:'smooth'});
  const im=await getImovelById(id);
  if(!im){document.getElementById('detail-content').innerHTML='<div class="empty-state"><span>😕</span><h3>Imóvel não encontrado</h3></div>';return;}
  ST.currentImovel=im; ST.galleryIdx=0;
  renderDetail(im);
}

/* ---- HOME ---- */
async function renderHome() {
  loading('grid-destaques'); loading('grid-novos'); loading('grid-oportunidades');
  const [d,n,o,cidades,tipos,cfg]=await Promise.all([
    getImoveis({destaque:true},1,3), getImoveis({novo:true},1,3), getImoveis({oportunidade:true},1,3),
    getCidades(), getTipos(), getCfg()
  ]);
  ST.cidades=cidades; ST.tipos=tipos; ST.cfg=cfg;
  renderGrid('grid-destaques',d.data);
  renderGrid('grid-novos',n.data);
  renderGrid('grid-oportunidades',o.data);
  populateHeroSelects();
}

function populateHeroSelects() {
  const st=document.getElementById('s-tipo');
  if(st) st.innerHTML='<option value="">Todos os tipos</option>'+ST.tipos.map(t=>`<option value="${t.id}">${t.nome}</option>`).join('');
  const sc=document.getElementById('s-cidade');
  if(sc) sc.innerHTML='<option value="">Qualquer cidade</option>'+ST.cidades.map(c=>`<option value="${c.id}">${c.nome} — ${c.estados?.uf||''}</option>`).join('');
}

function setFinalidade(f,btn){
  ST.heroFinalidade=f;
  document.querySelectorAll('.search-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
}

async function doSearch() {
  await showPage('list',{finalidade:ST.heroFinalidade});
  const t=document.getElementById('s-tipo')?.value;
  const c=document.getElementById('s-cidade')?.value;
  if(t){const el=document.getElementById('f-tipo');if(el)el.value=t;}
  if(c){const el=document.getElementById('f-cidade');if(el)el.value=c;}
  document.querySelector(`input[name="f-finalidade"][value="${ST.heroFinalidade}"]`).checked=true;
  await applyFilters();
}

/* ---- LIST ---- */
async function renderList(params={}) {
  updateListTitle(params);
  if(!ST.cidades.length){const [c,t]=await Promise.all([getCidades(),getTipos()]);ST.cidades=c;ST.tipos=t;}
  populateListFilters();
  if(params.finalidade){
    const r=document.querySelector(`input[name="f-finalidade"][value="${params.finalidade}"]`);
    if(r) r.checked=true;
  }
  await applyFilters();
}

function updateListTitle(p) {
  const t=document.getElementById('list-title'), s=document.getElementById('list-sub');
  if(!t)return;
  if(p.finalidade==='aluguel'){t.textContent='Imóveis para Alugar';s.textContent='Encontre o lar ideal para alugar';}
  else if(p.finalidade==='venda'){t.textContent='Imóveis à Venda';s.textContent='Encontre o imóvel dos seus sonhos';}
  else{t.textContent='Todos os Imóveis';s.textContent='Encontre o imóvel ideal';}
}

function populateListFilters() {
  const ft=document.getElementById('f-tipo');
  if(ft) ft.innerHTML='<option value="">Todos</option>'+ST.tipos.map(t=>`<option value="${t.id}">${t.nome}</option>`).join('');
  const fc=document.getElementById('f-cidade');
  if(fc) fc.innerHTML='<option value="">Qualquer cidade</option>'+ST.cidades.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
}

async function applyFilters() {
  loading('grid-list');
  document.getElementById('result-count').textContent='Buscando...';
  const fin=document.querySelector('input[name="f-finalidade"]:checked')?.value||'venda';
  const tid=document.getElementById('f-tipo')?.value||'';
  const cid=document.getElementById('f-cidade')?.value||'';
  const bid=document.getElementById('f-bairro-filter')?.value||'';
  const pMin=document.getElementById('f-preco-min')?.value||'';
  const pMax=document.getElementById('f-preco-max')?.value||'';
  const srt=document.getElementById('f-sort')?.value||'recente';
  const f={finalidade:fin,sort:srt,...(tid&&{tipo_id:tid}),...(cid&&{cidade_id:cid}),...(bid&&{bairro_id:bid}),
    ...(pMin&&{precoMin:pMin}),...(pMax&&{precoMax:pMax}),
    ...(ST.filterNums.quartos>0&&{quartos:ST.filterNums.quartos}),
    ...(ST.filterNums.vagas>0&&{vagas:ST.filterNums.vagas})};
  const {data,total}=await getImoveis(f,ST.listPage,ST.perPage);
  ST.total=total;
  document.getElementById('result-count').textContent=`${total} imóvel${total!==1?'s':''} encontrado${total!==1?'s':''}`;
  renderGrid('grid-list',data);
  renderPagination(Math.ceil(total/ST.perPage));
  // carrega bairros ao selecionar cidade
  if(cid){
    const bairros=await getBairros(cid);
    const fb=document.getElementById('f-bairro-filter');
    if(fb) fb.innerHTML='<option value="">Qualquer bairro</option>'+bairros.map(b=>`<option value="${b.id}">${b.nome}</option>`).join('');
  }
}

function renderPagination(pages) {
  const pg=document.getElementById('pagination');
  if(!pg||pages<=1){if(pg)pg.innerHTML='';return;}
  let h='';
  if(ST.listPage>1) h+=`<button class="page-btn" onclick="goPage(${ST.listPage-1})">‹</button>`;
  for(let i=Math.max(1,ST.listPage-2);i<=Math.min(pages,ST.listPage+2);i++)
    h+=`<button class="page-btn ${i===ST.listPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
  if(ST.listPage<pages) h+=`<button class="page-btn" onclick="goPage(${ST.listPage+1})">›</button>`;
  pg.innerHTML=h;
}

async function goPage(n){ST.listPage=n;await applyFilters();document.querySelector('.list-results')?.scrollIntoView({behavior:'smooth'});}

function clearFilters(){
  ['f-tipo','f-cidade','f-bairro-filter'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  ['f-preco-min','f-preco-max'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  ST.filterNums={quartos:0,vagas:0};
  document.querySelectorAll('.btn-num').forEach(b=>b.classList.toggle('active',b.textContent==='Qualquer'));
  applyFilters();
}

function setFilterNum(field,val,btn){
  ST.filterNums[field]=val;
  btn.closest('.btn-group').querySelectorAll('.btn-num').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}
function toggleFilters(){document.getElementById('filtersSidebar').classList.toggle('open');}

/* ---- DETAIL ---- */
function renderDetail(im) {
  const fotos=(im.imovel_fotos||[]).sort((a,b)=>a.ordem-b.ordem);
  const wa=ST.cfg.whatsapp||WHATSAPP_NUM;
  const waMsg=encodeURIComponent(`Olá! Tenho interesse no imóvel ${im.codigo} — ${im.titulo}`);
  const loc=[im.bairros?.nome,im.cidades?.nome,im.estados?.uf].filter(Boolean).join(', ');
  const feats=[];
  if(im.quartos>0) feats.push({e:'🛏️',v:im.quartos,l:'Quartos'});
  if(im.suites>0) feats.push({e:'🛏️',v:im.suites,l:'Suítes'});
  if(im.banheiros>0) feats.push({e:'🚿',v:im.banheiros,l:'Banheiros'});
  if(im.vagas>0) feats.push({e:'🚗',v:im.vagas,l:'Vagas'});
  if(im.area_total>0) feats.push({e:'📐',v:im.area_total+'m²',l:'Área Total'});
  const badges=[];
  if(im.destaque) badges.push('<span class="badge badge-destaque">⭐ Destaque</span>');
  if(im.oportunidade) badges.push('<span class="badge badge-oportunidade">🔥 Oportunidade</span>');
  const galMain=fotos.length?`<img id="gal-main-img" src="${fotos[0].url}" alt="" style="width:100%;height:100%;object-fit:cover">`
    :`<div class="gallery-main-inner"><div class="gallery-icon">${im.tipos_imovel?.icone||'🏠'}</div></div>`;
  const thumbs=fotos.map((f,i)=>`<div class="gallery-thumb ${i===0?'active':''}" onclick="chGal(${i})" id="th-${i}"><img src="${f.url}" style="width:100%;height:100%;object-fit:cover"></div>`).join('');
  document.getElementById('detail-content').innerHTML=`
    <div class="detail-hero"><div class="container">
      <div class="detail-breadcrumb">
        <a onclick="showPage('home')">Início</a> ›
        <a onclick="showPage('list',{finalidade:'${im.finalidade}'})">Imóveis</a> ›
        <span>${im.titulo}</span>
      </div>
      <div class="detail-header">
        <div class="detail-header-left">
          <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">${badges.join('')}</div>
          <h1>${im.titulo}</h1>
          <div class="detail-location">📍 ${loc}</div>
          <div class="detail-code">Código: ${im.codigo}</div>
        </div>
        <div class="detail-price-box">
          <div class="detail-price">${fmtC(im.preco,im.finalidade)}</div>
          <div class="detail-price-label">${im.finalidade==='aluguel'?'Aluguel mensal':'Valor de venda'}</div>
        </div>
      </div>
    </div></div>
    <div class="gallery-section"><div class="container">
      <div class="gallery-main"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center" id="gal-display">${galMain}</div>
        ${fotos.length>1?'<div class="gallery-nav"><button onclick="galPrev()">‹</button><button onclick="galNext()">›</button></div>':''}
        <div class="gallery-counter" id="gal-cnt">1 / ${Math.max(fotos.length,1)}</div>
      </div>
      <div class="gallery-thumbs">${thumbs}</div>
    </div></div>
    <div class="detail-body"><div class="container"><div class="detail-layout">
      <div class="detail-main">
        <div class="detail-features">${feats.map(f=>`<div class="detail-feat"><div class="detail-feat-icon">${f.e}</div><div class="detail-feat-val">${f.v}</div><div class="detail-feat-label">${f.l}</div></div>`).join('')}</div>
        ${im.descricao?`<div class="detail-desc"><h2>Descrição do Imóvel</h2><p>${im.descricao}</p></div>`:''}
        <div class="map-section"><h2>Localização</h2>
          <div class="map-placeholder"><span>🗺️</span><p>${loc}</p>
            <a href="https://maps.google.com/?q=${encodeURIComponent(loc)}" target="_blank" class="btn btn-outline" style="margin-top:8px">Ver no Google Maps</a>
          </div>
        </div>
      </div>
      <div class="detail-sidebar"><div class="contact-card">
        <h3>Interessado neste imóvel?</h3>
        <p>Fale agora com nosso corretor</p>
        <a href="https://wa.me/${wa}?text=${waMsg}" target="_blank" class="btn btn-whatsapp-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Chamar no WhatsApp
        </a>
        <div class="mini-form"><h4>Ou envie uma mensagem</h4>
          <form onsubmit="miniLead(event,'${im.id}','${im.codigo}')">
            <input name="nome" placeholder="Seu nome *" required>
            <input name="telefone" type="tel" placeholder="WhatsApp *" required>
            <input name="email" type="email" placeholder="E-mail *" required>
            <textarea name="mensagem" rows="3" placeholder="Tenho interesse neste imóvel..."></textarea>
            <button type="submit" class="btn btn-primary w-full">Enviar Mensagem</button>
          </form>
        </div>
      </div></div>
    </div></div></div>`;
}

function chGal(idx) {
  const f=(ST.currentImovel?.imovel_fotos||[]).sort((a,b)=>a.ordem-b.ordem);
  ST.galleryIdx=idx;
  const d=document.getElementById('gal-display');
  if(f[idx]) d.innerHTML=`<img src="${f[idx].url}" style="width:100%;height:100%;object-fit:cover">`;
  document.getElementById('gal-cnt').textContent=`${idx+1} / ${f.length}`;
  document.querySelectorAll('.gallery-thumb').forEach((t,i)=>t.classList.toggle('active',i===idx));
}
function galNext(){const l=ST.currentImovel?.imovel_fotos?.length||1;chGal((ST.galleryIdx+1)%l);}
function galPrev(){const l=ST.currentImovel?.imovel_fotos?.length||1;chGal((ST.galleryIdx-1+l)%l);}

/* ---- LEADS ---- */
async function submitLead(e) {
  e.preventDefault();
  const btn=e.target.querySelector('[type=submit]');
  btn.textContent='Enviando...';btn.disabled=true;
  try {
    await sb.post('leads',{...Object.fromEntries(new FormData(e.target)),origem:'contato'});
    e.target.reset(); toast('Mensagem enviada! Entraremos em contato em breve. 🏡');
  } catch { toast('Erro ao enviar. Tente pelo WhatsApp.',false); }
  btn.textContent='Enviar Mensagem';btn.disabled=false;
}
async function miniLead(e,iid,cod) {
  e.preventDefault();
  const btn=e.target.querySelector('[type=submit]');
  btn.textContent='Enviando...';btn.disabled=true;
  try {
    await sb.post('leads',{...Object.fromEntries(new FormData(e.target)),imovel_id:iid,imovel_codigo:cod,origem:'detalhe'});
    e.target.reset(); toast('Interesse registrado! Entraremos em contato. 🏡');
  } catch { toast('Erro ao enviar. Tente pelo WhatsApp.',false); }
  btn.textContent='Enviar Mensagem';btn.disabled=false;
}

/* ---- LOGIN ---- */
function showLoginModal(){document.getElementById('login-modal').style.display='flex';}
function hideLoginModal(){document.getElementById('login-modal').style.display='none';}
async function doLogin(e){
  e.preventDefault();
  const btn=e.target.querySelector('[type=submit]');
  btn.textContent='Entrando...';btn.disabled=true;
  try{
    await sb.login(document.getElementById('login-email').value,document.getElementById('login-pass').value);
    hideLoginModal();
    document.getElementById('page-admin').classList.add('active');
    document.querySelectorAll('.page').forEach(p=>{if(p.id!=='page-admin')p.classList.remove('active');});
    await renderAdmin();
  }catch{toast('Usuário ou senha incorretos.',false);}
  btn.textContent='Entrar';btn.disabled=false;
}
async function doLogout(){await sb.logout();toast('Sessão encerrada.');showPage('home');}

/* ---- ADMIN ---- */
async function renderAdmin(){await Promise.all([renderAdminList(),renderLeads()]);}

async function renderAdminList(){
  const q=document.getElementById('admin-search')?.value||'';
  loading('admin-list');
  try {
    const qs=q?`or=(titulo.ilike.*${q}*,codigo.ilike.*${q}*)`:'' ;
    const {data}=await sb.get('imoveis',`${qs}&select=id,codigo,titulo,finalidade,preco,destaque,oportunidade,novo,ativo,tipos_imovel(nome)&order=created_at.desc&limit=100`);
    if(!data.length){document.getElementById('admin-list').innerHTML='<div class="empty-state"><span>🏠</span><h3>Nenhum imóvel cadastrado</h3></div>';return;}
    document.getElementById('admin-list').innerHTML=`
      <table class="admin-table">
        <thead><tr><th>Código</th><th>Título</th><th>Tipo</th><th>Finalidade</th><th>Preço</th><th>Flags</th><th>Ações</th></tr></thead>
        <tbody>${data.map(i=>`<tr>
          <td><strong>${i.codigo}</strong></td>
          <td>${i.titulo.slice(0,38)}…</td>
          <td>${i.tipos_imovel?.nome||'—'}</td>
          <td style="text-transform:capitalize">${i.finalidade}</td>
          <td>${fmtC(i.preco,i.finalidade)}</td>
          <td>${i.destaque?'⭐':''}${i.oportunidade?'🔥':''}${i.novo?'🆕':''}${!i.ativo?'❌':''}</td>
          <td><div class="admin-actions">
            <button class="btn-edit" onclick="editImovel('${i.id}')">Editar</button>
            <button class="btn-del" onclick="delImovel('${i.id}')">Desativar</button>
          </div></td>
        </tr>`).join('')}</tbody>
      </table>`;
  }catch(e){document.getElementById('admin-list').innerHTML='<div class="empty-state"><span>❌</span><h3>Erro ao carregar</h3><p>'+e.message+'</p></div>';}
}

async function renderLeads(){
  loading('leads-list');
  try {
    const {data}=await sb.get('leads','select=id,nome,telefone,email,imovel_codigo,status,created_at&order=created_at.desc&limit=200');
    if(!data.length){document.getElementById('leads-list').innerHTML='<div class="empty-state"><span>📥</span><h3>Nenhum lead ainda</h3></div>';return;}
    const sc={novo:'#2E7D32',em_contato:'#1565C0',visitou:'#6A1B9A',negociando:'#E65100',fechado:'#1B5E20',perdido:'#B71C1C'};
    document.getElementById('leads-list').innerHTML=`
      <table class="admin-table">
        <thead><tr><th>Data</th><th>Nome</th><th>Telefone</th><th>E-mail</th><th>Imóvel</th><th>Status</th><th>Ação</th></tr></thead>
        <tbody>${data.map(l=>`<tr>
          <td>${new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
          <td>${l.nome}</td><td>${l.telefone}</td><td>${l.email||'—'}</td>
          <td>${l.imovel_codigo||'Geral'}</td>
          <td><select onchange="updLead('${l.id}',this.value)" style="font-size:12px;padding:3px 6px;border:1px solid #ddd;border-radius:4px;background:${sc[l.status]||'#666'};color:#fff">
            ${['novo','em_contato','visitou','negociando','fechado','perdido'].map(s=>`<option value="${s}" ${l.status===s?'selected':''} style="background:#333">${s.replace('_',' ')}</option>`).join('')}
          </select></td>
          <td><a href="https://wa.me/55${l.telefone.replace(/\D/g,'')}" target="_blank" class="btn-edit">WhatsApp</a></td>
        </tr>`).join('')}</tbody>
      </table>`;
  }catch{document.getElementById('leads-list').innerHTML='<div class="empty-state"><span>❌</span><h3>Erro ao carregar leads</h3></div>';}
}

async function updLead(id,status){try{await sb.patch('leads',`id=eq.${id}`,{status});}catch{toast('Erro ao atualizar.',false);}}

async function editImovel(id){
  if(!ST.tipos.length) ST.tipos=await getTipos();
  if(!ST.cidades.length) ST.cidades=await getCidades();
  const {data}=await sb.get('imoveis',`id=eq.${id}&select=*`);
  const im=data[0]; if(!im) return;
  document.getElementById('edit-id').value=id;
  document.getElementById('f-titulo').value=im.titulo;
  document.getElementById('f-codigo').value=im.codigo;
  document.getElementById('f-preco-form').value=im.preco;
  document.getElementById('f-finalidade-form').value=im.finalidade;
  document.getElementById('f-quartos-form').value=im.quartos||0;
  document.getElementById('f-banheiros').value=im.banheiros||0;
  document.getElementById('f-vagas-form').value=im.vagas||0;
  document.getElementById('f-area').value=im.area_total||0;
  document.getElementById('f-descricao').value=im.descricao||'';
  document.getElementById('f-destaque').checked=im.destaque;
  document.getElementById('f-oportunidade').checked=im.oportunidade;
  const ft=document.getElementById('f-tipo-form');
  ft.innerHTML=ST.tipos.map(t=>`<option value="${t.id}" ${im.tipo_id===t.id?'selected':''}>${t.nome}</option>`).join('');
  const fc=document.getElementById('f-cidade-form');
  fc.innerHTML='<option value="">Selecione</option>'+ST.cidades.map(c=>`<option value="${c.id}" ${im.cidade_id===c.id?'selected':''}>${c.nome}</option>`).join('');
  showAdminTab('novo',document.querySelectorAll('.admin-tab')[2]);
}

async function delImovel(id){
  if(!confirm('Desativar este imóvel?')) return;
  try{await sb.patch('imoveis',`id=eq.${id}`,{ativo:false});toast('Imóvel desativado.');renderAdminList();}
  catch{toast('Erro.',false);}
}

async function saveImovel(e){
  e.preventDefault();
  const btn=e.target.querySelector('[type=submit]');
  btn.textContent='Salvando...';btn.disabled=true;
  const eid=document.getElementById('edit-id').value;
  const d={
    titulo:document.getElementById('f-titulo').value,
    codigo:document.getElementById('f-codigo').value,
    tipo_id:parseInt(document.getElementById('f-tipo-form').value)||null,
    finalidade:document.getElementById('f-finalidade-form').value,
    preco:parseFloat(document.getElementById('f-preco-form').value),
    cidade_id:parseInt(document.getElementById('f-cidade-form').value)||null,
    quartos:parseInt(document.getElementById('f-quartos-form').value)||0,
    banheiros:parseInt(document.getElementById('f-banheiros').value)||0,
    vagas:parseInt(document.getElementById('f-vagas-form').value)||0,
    area_total:parseFloat(document.getElementById('f-area').value)||0,
    descricao:document.getElementById('f-descricao').value,
    destaque:document.getElementById('f-destaque').checked,
    oportunidade:document.getElementById('f-oportunidade').checked,
    novo:true,ativo:true
  };
  try{
    if(eid) await sb.patch('imoveis',`id=eq.${eid}`,d);
    else await sb.post('imoveis',d);
    toast(eid?'Imóvel atualizado!':'Imóvel cadastrado!');
    resetForm();
    showAdminTab('imoveis',document.querySelectorAll('.admin-tab')[0]);
  }catch(err){toast('Erro: '+err.message,false);}
  btn.textContent='Salvar Imóvel';btn.disabled=false;
}

function resetForm(){
  document.getElementById('edit-id').value='';
  document.querySelector('.imovel-form')?.reset();
}

async function showAdminTab(tab,btn){
  document.querySelectorAll('.admin-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('admin-'+tab)?.classList.add('active');
  btn?.classList.add('active');
  if(tab==='imoveis') renderAdminList();
  else if(tab==='leads') renderLeads();
  else if(tab==='novo'){
    if(!ST.tipos.length) ST.tipos=await getTipos();
    if(!ST.cidades.length) ST.cidades=await getCidades();
    const ft=document.getElementById('f-tipo-form');
    if(ft) ft.innerHTML=ST.tipos.map(t=>`<option value="${t.id}">${t.nome}</option>`).join('');
    const fc=document.getElementById('f-cidade-form');
    if(fc) fc.innerHTML='<option value="">Selecione a cidade</option>'+ST.cidades.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
  }
}

/* ---- MENU / SCROLL ---- */
function toggleMenu(){document.getElementById('nav').classList.toggle('open');}
function closeMenu(){document.getElementById('nav').classList.remove('open');}
window.addEventListener('scroll',()=>document.getElementById('header').classList.toggle('scrolled',scrollY>20));

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded',async()=>{
  sb.restore();
  await renderHome();
});
