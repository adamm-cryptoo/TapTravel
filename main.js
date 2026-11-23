// Black Friday settings: change the end date, code, or discount here.
const BF={end:new Date('2026-11-30T23:59:59'),code:'TAPFRIDAY',off:0.4};
const PLANS=[
{n:'Free',p:0,t:['3 teleports a month','Starter gates (Free tier)','Local Look preview, 10 minutes','Standard queue']},
{n:'Explorer',p:12,t:['15 teleports a month','Free and Explorer gates','Local Look for 4 hours','Priority queue']},
{n:'Premium',p:29,f:1,t:['Unlimited teleports','Every gate, including new launches','Local Look for 24 hours with custom styles','Instant arrival, no queue','Group teleport for up to 3']},
{n:'Family',p:49,t:['Premium for up to 5 people','Parent controls and arrival alerts','Junior accounts for ages 13 to 17','Shared teleport pool']}];
// World mask for the dotted map: 48 columns x 18 rows, each cell is 7.5 degrees. # = land.
const LAND=[
"....##########...####.........##############....",
"...#############.#####..#####################...",
"..###############.###.#######################...",
"...##############.....#######################...",
".....###########......#######################...",
"......##########.....#######################....",
".......#######.......####################.......",
"........######.......###########..#####.........",
"............######...##########...##.###........",
".............#######..#########......#######....",
".............#######....#######.......######.###",
"..............######....#######.........######..",
"..............######....#######........########.",
"..............######....#######.......#########.",
"...............####......#####........##########",
"...............###.......................###..##",
"..............####..............................",
"................##.............................."];
const $=(s,r=document)=>r.querySelector(s);
const bfOn=()=>Date.now()<BF.end;
const time=tz=>new Intl.DateTimeFormat([],{timeZone:tz,weekday:'short',hour:'2-digit',minute:'2-digit'}).format(new Date());
const card=d=>`<a class="dcard" style="--a:${d.c[0]};--b:${d.c[1]}" href="destination.html?id=${d.id}"><h3>${d.name}</h3><p>${d.tag}</p></a>`;

function layout(){
  const here=location.pathname.split('/').pop()||'index.html';
  const links=[['destinations.html','Destinations'],['plans.html','Plans'],['policies.html','Policies']];
  const cur=h=>h===here||(here==='destination.html'&&h==='destinations.html')?' aria-current="page"':'';
  document.body.insertAdjacentHTML('afterbegin',
    (bfOn()?`<div class="bf">Black Friday: ${BF.off*100}% off annual plans until Nov 30. Use code ${BF.code}. <a href="plans.html#black-friday">See offers</a></div>`:'')+
    `<header><div class="wrap nav"><a class="brand" href="index.html"><img src="assets/logo.jpeg" alt="">TapTravel</a><nav>${links.map(([h,t])=>`<a href="${h}"${cur(h)}>${t}</a>`).join('')}</nav></div></header>`);
  document.body.insertAdjacentHTML('beforeend',
    `<footer><div class="wrap"><div><strong>TapTravel</strong><br>Tap the map. Arrive.<br>© 2026 TapTravel</div><div>${links.map(([h,t])=>`<a href="${h}">${t}</a>`).join('')}</div><div><a href="policies.html#ages">Legal ages</a><a href="policies.html#look">Local Look rules</a><a href="policies.html#refunds">Billing and refunds</a></div></div></footer>`);
  if(!bfOn())document.querySelectorAll('[data-bf]').forEach(e=>e.remove());
}

function initMap(){
  const map=$('#map');if(!map)return;
  const cv=$('canvas',map),ctx=cv.getContext('2d');
  const draw=()=>{const r=map.getBoundingClientRect(),k=devicePixelRatio||1;cv.width=r.width*k;cv.height=r.height*k;ctx.setTransform(k,0,0,k,0,0);
    const cw=r.width/48,ch=r.height/18;ctx.fillStyle='rgba(150,190,255,.55)';
    LAND.forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='#')for(let i=0;i<2;i++)for(let j=0;j<2;j++){ctx.beginPath();ctx.arc((x+.25+i*.5)*cw,(y+.25+j*.5)*ch,Math.max(1,cw*.14),0,6.3);ctx.fill()}}))};
  draw();addEventListener('resize',draw);
  let sel=null;
  const pick=d=>{sel=d;DEST.forEach(x=>x.el.setAttribute('aria-pressed',x===d));
    $('#pname').textContent=d.name+', '+d.country;$('#pinfo').textContent=d.tag+' Local time: '+time(d.tz);$('#go').disabled=false};
  DEST.forEach(d=>{const b=document.createElement('button');b.className='pin';b.style.left=(d.lon+180)/3.6+'%';b.style.top=(75-d.lat)/1.35+'%';
    b.setAttribute('aria-pressed','false');b.setAttribute('aria-label',d.name);b.innerHTML=`<span>${d.name}</span>`;
    b.onclick=e=>{e.stopPropagation();pick(d)};map.append(b);d.el=b});
  map.onclick=e=>{const r=map.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    const t=document.createElement('span');t.className='tap';t.style.left=x*100+'%';t.style.top=y*100+'%';map.append(t);setTimeout(()=>t.remove(),700);
    let best,bd=9;DEST.forEach(d=>{const dd=Math.hypot(((d.lon+180)/360-x)*8,((75-d.lat)/135-y)*3);if(dd<bd){bd=dd;best=d}});
    if(bd<.9)pick(best);else{sel=null;DEST.forEach(o=>o.el.setAttribute('aria-pressed','false'));$('#go').disabled=true;
      $('#pname').textContent='No gate here yet';$('#pinfo').textContent='Nearest gate: '+best.name+'. Tap its pin to select it.'}};
  $('#go').onclick=()=>{if(!sel)return;$('#wtxt').textContent='Teleporting to '+sel.name;$('#warp').classList.add('on');
    setTimeout(()=>location.href='destination.html?id='+sel.id+'&arrived=1',matchMedia('(prefers-reduced-motion:reduce)').matches?200:1300)};
}

function initDest(){
  const el=$('#dest');if(!el)return;
  const p=new URLSearchParams(location.search),i=Math.max(0,DEST.findIndex(d=>d.id===p.get('id'))),d=DEST[i],
    n=DEST[(i+1)%DEST.length],pv=DEST[(i+DEST.length-1)%DEST.length];
  document.title=d.name+' | TapTravel';
  el.innerHTML=`<section class="dhero" style="--a:${d.c[0]};--b:${d.c[1]}"><div class="wrap"><p>${d.country}</p><h1>${d.name}</h1><p>${d.tag}</p>${p.get('arrived')?'<p><b>You have arrived. Your Local Look is on.</b></p>':''}<a class="btn" href="plans.html">Get teleports</a></div></section>
  <section><div class="wrap split"><div><h2>About ${d.name}</h2><p>${d.about}</p><h3 style="margin-top:24px">Highlights</h3><ul class="tick">${d.hl.map(h=>`<li>${h}</li>`).join('')}</ul></div>
  <div class="card"><h3>Gate details</h3><table><tr><th>Arrival gate</th><td>${d.gate}</td></tr><tr><th>Local time</th><td>${time(d.tz)}</td></tr><tr><th>Language</th><td>${d.lang}</td></tr><tr><th>Best for</th><td>${d.best}</td></tr><tr><th>Gate access</th><td>${d.tier} plan and up</td></tr></table></div></div></section>
  <section><div class="wrap"><div class="card"><h2>Your Local Look in ${d.name}</h2><p>${d.look}</p><p>Your face, age, gender, skin tone, and body stay yours. <a href="policies.html#look">Read the Local Look rules</a>.</p></div></div></section>
  <section><div class="wrap" style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap"><a href="destination.html?id=${pv.id}">Previous: ${pv.name}</a><a href="destination.html?id=${n.id}">Next: ${n.name}</a></div></section>`;
}

function initPlans(){
  const el=$('#plans');if(!el)return;let yr=false;
  const draw=()=>{el.innerHTML=PLANS.map(x=>{const base=yr?x.p*10/12:x.p,bf=yr&&bfOn()&&x.p?base*(1-BF.off):base;
    return `<div class="card plan${x.f?' feat':''}"><h3>${x.n}</h3><div class="price">$${bf.toFixed(x.p?2:0)}<small> /month</small></div><div class="old">${bf<base?'$'+base.toFixed(2):''}</div><ul class="tick">${x.t.map(t=>`<li>${t}</li>`).join('')}</ul><a class="btn${x.f?' city':' ghost'}" href="#">Choose ${x.n}</a></div>`}).join('')};
  document.querySelectorAll('.toggle button').forEach(b=>b.onclick=()=>{yr=b.dataset.y==='1';document.querySelectorAll('.toggle button').forEach(o=>o.setAttribute('aria-pressed',o===b));draw()});
  draw();
}

function initCount(){
  document.querySelectorAll('.count').forEach(c=>{
    const tick=()=>{const s=Math.max(0,Math.floor((BF.end-Date.now())/1000)),v=[Math.floor(s/86400),Math.floor(s/3600)%24,Math.floor(s/60)%60,s%60];
      c.innerHTML=['days','hours','min','sec'].map((l,i)=>`<div><b>${String(v[i]).padStart(2,'0')}</b>${l}</div>`).join('')};
    tick();setInterval(tick,1000)});
}

layout();initMap();initDest();initPlans();initCount();
if($('#grid'))$('#grid').innerHTML=DEST.map(card).join('');
if($('#featured'))$('#featured').innerHTML=DEST.slice(0,4).map(card).join('');
