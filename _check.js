
(function(){
'use strict';

/* ==================== 靜態資料 ==================== */
const FACTIONS = {
  cao:  {id:'cao',  name:'曹操', seat:'許昌', color:'#2f6fb3', diff:'易',   diffColor:'#2f6b47'},
  sun:  {id:'sun',  name:'孫權', seat:'建業', color:'#b23a3a', diff:'普通', diffColor:'#a8802a'},
  yuan: {id:'yuan', name:'袁紹', seat:'鄴',   color:'#7d5aa6', diff:'普通', diffColor:'#a8802a'},
  liu:  {id:'liu',  name:'劉備', seat:'成都', color:'#2f7d55', diff:'難',   diffColor:'#9e2f2a'},
  ma:   {id:'ma',   name:'馬騰', seat:'西涼', color:'#b8862b', diff:'極難', diffColor:'#8a3b2a'},
  none: {id:'none', name:'在野', seat:'—',    color:'#8d8d8d', diff:'',     diffColor:'#8d8d8d'}
};

const CITY_DEFS = [
 {id:'beiping',  name:'北平', region:'幽州', x:718, y:78,  f:'yuan', agri:55,comm:42,def:55,loy:72, troops:6000,  adj:['ye']},
 {id:'ye',       name:'鄴',   region:'冀州', x:636, y:158, f:'yuan', agri:70,comm:65,def:72,loy:82, troops:14000, adj:['beiping','jinyang','pingyuan','luoyang','xuchang']},
 {id:'jinyang',  name:'晉陽', region:'并州', x:536, y:132, f:'yuan', agri:52,comm:45,def:62,loy:70, troops:7000,  adj:['ye','luoyang','changan']},
 {id:'pingyuan', name:'平原', region:'青州', x:762, y:172, f:'yuan', agri:62,comm:52,def:55,loy:74, troops:7000,  adj:['ye','xuzhou','chenliu']},
 {id:'luoyang',  name:'洛陽', region:'司隸', x:600, y:248, f:'cao',  agri:66,comm:72,def:70,loy:66, troops:10000, adj:['ye','jinyang','changan','xuchang','chenliu','wan']},
 {id:'changan',  name:'長安', region:'司隸', x:478, y:248, f:'ma',   agri:60,comm:58,def:68,loy:62, troops:10000, adj:['jinyang','luoyang','tianshui','hanzhong']},
 {id:'tianshui', name:'天水', region:'雍州', x:378, y:228, f:'ma',   agri:45,comm:38,def:52,loy:68, troops:7000,  adj:['changan','xiliang','hanzhong']},
 {id:'xiliang',  name:'西涼', region:'涼州', x:278, y:178, f:'ma',   agri:40,comm:35,def:48,loy:75, troops:9000,  adj:['tianshui']},
 {id:'xuchang',  name:'許昌', region:'豫州', x:642, y:302, f:'cao',  agri:72,comm:70,def:75,loy:86, troops:15000, adj:['ye','luoyang','chenliu','runan','wan']},
 {id:'chenliu',  name:'陳留', region:'兗州', x:702, y:264, f:'cao',  agri:68,comm:62,def:62,loy:78, troops:9000,  adj:['pingyuan','luoyang','xuchang','xuzhou']},
 {id:'runan',    name:'汝南', region:'豫州', x:662, y:360, f:'cao',  agri:65,comm:55,def:58,loy:72, troops:7000,  adj:['xuchang','shouchun','wan']},
 {id:'xuzhou',   name:'徐州', region:'徐州', x:800, y:268, f:'none', agri:60,comm:60,def:58,loy:55, troops:5000,  adj:['pingyuan','chenliu','shouchun']},
 {id:'shouchun', name:'壽春', region:'揚州', x:782, y:338, f:'sun',  agri:62,comm:58,def:60,loy:70, troops:8000,  adj:['xuzhou','runan','jianye','chaisang']},
 {id:'wan',      name:'宛',   region:'荊州', x:590, y:350, f:'cao',  agri:58,comm:52,def:60,loy:68, troops:8000,  adj:['luoyang','xuchang','runan','xiangyang']},
 {id:'xiangyang',name:'襄陽', region:'荊州', x:588, y:412, f:'none', agri:64,comm:60,def:65,loy:62, troops:6000,  adj:['wan','jiangling','chaisang']},
 {id:'jiangling',name:'江陵', region:'荊州', x:568, y:472, f:'liu',  agri:62,comm:55,def:58,loy:72, troops:8000,  adj:['xiangyang','changsha','yongan','chaisang']},
 {id:'changsha', name:'長沙', region:'荊州', x:620, y:546, f:'none', agri:60,comm:48,def:50,loy:66, troops:5000,  adj:['jiangling','chaisang','kuaiji']},
 {id:'chaisang', name:'柴桑', region:'揚州', x:718, y:450, f:'sun',  agri:55,comm:52,def:55,loy:68, troops:9000,  adj:['shouchun','xiangyang','jiangling','changsha','jianye']},
 {id:'jianye',   name:'建業', region:'揚州', x:808, y:418, f:'sun',  agri:58,comm:68,def:66,loy:84, troops:13000, adj:['shouchun','chaisang','wu']},
 {id:'wu',       name:'吳',   region:'揚州', x:848, y:488, f:'sun',  agri:60,comm:62,def:50,loy:78, troops:7000,  adj:['jianye','kuaiji']},
 {id:'kuaiji',   name:'會稽', region:'揚州', x:858, y:550, f:'sun',  agri:55,comm:55,def:48,loy:72, troops:6000,  adj:['wu','changsha']},
 {id:'hanzhong', name:'漢中', region:'益州', x:448, y:320, f:'liu',  agri:60,comm:42,def:72,loy:78, troops:8000,  adj:['changan','tianshui','chengdu','yongan']},
 {id:'chengdu',  name:'成都', region:'益州', x:348, y:390, f:'liu',  agri:74,comm:58,def:66,loy:88, troops:12000, adj:['hanzhong','yongan']},
 {id:'yongan',   name:'永安', region:'益州', x:448, y:452, f:'liu',  agri:52,comm:38,def:60,loy:74, troops:6000,  adj:['chengdu','hanzhong','jiangling']}
];

const GENERAL_DEFS = [
 {id:'caocao',    name:'曹操',   f:'cao',  lead:96, might:72, int:91,  pol:94, loy:100},
 {id:'xiahoudun', name:'夏侯惇', f:'cao',  lead:90, might:89, int:59,  pol:70, loy:96},
 {id:'zhangliao', name:'張遼',   f:'cao',  lead:95, might:92, int:78,  pol:60, loy:88},
 {id:'caoren',    name:'曹仁',   f:'cao',  lead:88, might:85, int:62,  pol:70, loy:94},
 {id:'xuchu',     name:'許褚',   f:'cao',  lead:65, might:96, int:32,  pol:28, loy:97},
 {id:'guojia',    name:'郭嘉',   f:'cao',  lead:68, might:35, int:98,  pol:80, loy:92},
 {id:'xunyu',     name:'荀彧',   f:'cao',  lead:70, might:40, int:95,  pol:98, loy:90},

 {id:'sunquan',   name:'孫權',   f:'sun',  lead:80, might:68, int:78,  pol:85, loy:100},
 {id:'zhouyu',    name:'周瑜',   f:'sun',  lead:94, might:72, int:96,  pol:86, loy:96},
 {id:'lvmeng',    name:'呂蒙',   f:'sun',  lead:90, might:78, int:88,  pol:75, loy:93},
 {id:'ganning',   name:'甘寧',   f:'sun',  lead:85, might:94, int:58,  pol:40, loy:82},
 {id:'taishici',  name:'太史慈', f:'sun',  lead:84, might:90, int:60,  pol:55, loy:88},
 {id:'lusu',      name:'魯肅',   f:'sun',  lead:78, might:45, int:90,  pol:92, loy:90},

 {id:'yuanshao',  name:'袁紹',   f:'yuan', lead:78, might:65, int:70,  pol:80, loy:100},
 {id:'yanliang',  name:'顏良',   f:'yuan', lead:82, might:94, int:40,  pol:35, loy:88},
 {id:'wenchou',   name:'文醜',   f:'yuan', lead:80, might:92, int:38,  pol:30, loy:88},
 {id:'zhanghe',   name:'張郃',   f:'yuan', lead:90, might:88, int:75,  pol:62, loy:76},
 {id:'tianfeng',  name:'田豐',   f:'yuan', lead:60, might:30, int:96,  pol:85, loy:80},
 {id:'shenpei',   name:'審配',   f:'yuan', lead:72, might:55, int:80,  pol:82, loy:90},

 {id:'liubei',    name:'劉備',   f:'liu',  lead:82, might:75, int:80,  pol:88, loy:100},
 {id:'guanyu',    name:'關羽',   f:'liu',  lead:97, might:97, int:80,  pol:70, loy:100},
 {id:'zhangfei',  name:'張飛',   f:'liu',  lead:92, might:98, int:45,  pol:32, loy:100},
 {id:'zhaoyun',   name:'趙雲',   f:'liu',  lead:93, might:96, int:78,  pol:65, loy:98},
 {id:'zhugeliang',name:'諸葛亮', f:'liu',  lead:92, might:38, int:100, pol:96, loy:100},
 {id:'huangzhong',name:'黃忠',   f:'liu',  lead:86, might:92, int:58,  pol:50, loy:90},

 {id:'mateng',    name:'馬騰',   f:'ma',   lead:82, might:86, int:62,  pol:70, loy:100},
 {id:'machao',    name:'馬超',   f:'ma',   lead:94, might:97, int:55,  pol:45, loy:97},
 {id:'pangde',    name:'龐德',   f:'ma',   lead:86, might:91, int:58,  pol:52, loy:88},
 {id:'hansui',    name:'韓遂',   f:'ma',   lead:72, might:70, int:75,  pol:68, loy:60}
];

/* ==================== 工具 ==================== */
const rnd  = (a,b)=> a + Math.random()*(b-a);
const rint = (a,b)=> Math.floor(a + Math.random()*(b-a+1));
const clamp= (v,a,b)=> Math.max(a, Math.min(b, v));
const fmtT = n => n >= 10000 ? (n/10000).toFixed(1)+'萬' : String(Math.round(n));
const CITY_BY_ID = {};
CITY_DEFS.forEach(c=> CITY_BY_ID[c.id] = c);

let state = null;
let sel = null;
let tab = 'city';

/* ==================== 建立對局 ==================== */
function buildState(playerFaction){
  const cities = {};
  CITY_DEFS.forEach(d=>{
    cities[d.id] = {
      id:d.id, owner:d.f, troops:d.troops,
      agri:d.agri, comm:d.comm, def:d.def, loy:d.loy,
      acted:false, moved:false, governor:null
    };
  });

  const generals = {};
  GENERAL_DEFS.forEach(g=>{ generals[g.id] = Object.assign({}, g, {city:null}); });

  const byFaction = {};
  GENERAL_DEFS.forEach(g=>{ (byFaction[g.f] = byFaction[g.f] || []).push(g.id); });

  Object.keys(byFaction).forEach(f=>{
    const cap = FACTIONS[f].seat;
    const list = CITY_DEFS.filter(d=> d.f === f).map(d=> d.id);
    list.sort((a,b)=>{
      const ca = CITY_BY_ID[a].name === cap ? -1 : 0;
      const cb = CITY_BY_ID[b].name === cap ? -1 : 0;
      return ca - cb;
    });
    byFaction[f].forEach((gid, i)=>{
      const cid = list[i % list.length];
      generals[gid].city = cid;
      if (!cities[cid].governor) cities[cid].governor = gid;
    });
  });

  const treasury = {};
  Object.keys(FACTIONS).forEach(f=>{
    if (f === 'none') return;
    treasury[f] = {gold: 600, food: 1200};
  });

  const rel = {};
  Object.keys(FACTIONS).forEach(a=>{
    if (a === 'none') return;
    rel[a] = {};
    Object.keys(FACTIONS).forEach(b=>{
      if (b === 'none') return;
      rel[a][b] = a === b ? 100 : 50;
    });
  });

  return {
    turn: 1, player: playerFaction, cities, generals, treasury, rel,
    log: [], over: false
  };
}

/* ==================== 查詢 ==================== */
function factionCities(f){
  return CITY_DEFS.filter(d=> state.cities[d.id].owner === f).map(d=> d.id);
}
function factionTroops(f){
  return factionCities(f).reduce((s,id)=> s + state.cities[id].troops, 0);
}
function isDead(f){
  return factionCities(f).length === 0;
}
function generalsIn(cityId){
  return Object.values(state.generals).filter(g=> g.city === cityId);
}
function bestGeneralIn(cityId){
  const list = generalsIn(cityId);
  if (!list.length) return null;
  return list.slice().sort((a,b)=> b.lead - a.lead)[0];
}
function ownerName(cityId){
  return FACTIONS[state.cities[cityId].owner].name;
}
function addLog(text, cls){
  state.log.push({t: state.turn, text, cls: cls || ''});
  if (state.log.length > 400) state.log.shift();
}

/* ==================== 渲染：頂欄 ==================== */
function renderTop(){
  const p = state.player;
  document.getElementById('cTurn').textContent = state.turn;
  document.getElementById('cGold').textContent = Math.floor(state.treasury[p].gold);
  document.getElementById('cFood').textContent = Math.floor(state.treasury[p].food);
  document.getElementById('cCities').textContent = factionCities(p).length;
  document.getElementById('cTroops').textContent = fmtT(factionTroops(p));
}

/* ==================== 渲染：地圖 ==================== */
function renderMap(){
  const svg = document.getElementById('map');
  let s = '';

  const seen = {};
  CITY_DEFS.forEach(c=>{
    c.adj.forEach(a=>{
      const key = [c.id,a].sort().join('|');
      if (seen[key]) return;
      seen[key] = 1;
      const t = CITY_BY_ID[a];
      s += '<line class="road" x1="'+c.x+'" y1="'+c.y+'" x2="'+t.x+'" y2="'+t.y+'"/>';
    });
  });

  CITY_DEFS.forEach(c=>{
    const st = state.cities[c.id];
    const fac = FACTIONS[st.owner];
    const isSel = sel === c.id;
    const cap = st.owner !== 'none' && FACTIONS[st.owner].seat === c.name;
    s += '<g class="city'+(isSel?' sel':'')+'" data-act="pick" data-id="'+c.id+'">';
    if (cap) s += '<circle class="capital-ring" cx="'+c.x+'" cy="'+c.y+'" r="30"/>';
    s += '<circle class="node" cx="'+c.x+'" cy="'+c.y+'" r="23" fill="'+fac.color+'"/>';
    s += '<text class="cname" x="'+c.x+'" y="'+(c.y+4)+'">'+c.name+'</text>';
    s += '<text class="ctroops" x="'+c.x+'" y="'+(c.y+40)+'">'+fmtT(st.troops)+'</text>';
    s += '</g>';
  });

  svg.innerHTML = s;
}

/* ==================== 渲染：側欄 ==================== */
function renderSide(){
  const panel = document.getElementById('panel');
  if (tab === 'city') panel.innerHTML = renderCityPanel();
  else if (tab === 'general') panel.innerHTML = renderGeneralPanel();
  else panel.innerHTML = renderDiploPanel();
}

function bar(label, val, cls){
  return '<div class="stat-row"><span class="lbl">'+label+'</span>'+
    '<div class="bar '+(cls||'')+'"><i style="width:'+clamp(val,0,100)+'%"></i></div>'+
    '<span class="val">'+Math.round(val)+'</span></div>';
}

function renderCityPanel(){
  if (!sel) return '<div class="card">請在地圖上選擇城池</div>';
  const c = state.cities[sel];
  const def = CITY_BY_ID[sel];
  const fac = FACTIONS[c.owner];
  const mine = c.owner === state.player;
  const gov = c.governor ? state.generals[c.governor] : null;
  let h = '';

  h += '<div class="card">';
  h += '<div class="city-head"><div><span class="city-name-lg">'+def.name+'</span>'+
       '<span class="region-tag">'+def.region+'</span></div>'+
       '<div class="owner-tag" style="color:'+fac.color+'">'+fac.name+'</div></div>';
  h += bar('農業', c.agri, '');
  h += bar('商業', c.comm, 'b2');
  h += bar('城防', c.def, 'b3');
  h += bar('民忠', c.loy, 'b4');
  h += '<div class="meta-line"><span>駐軍 <b>'+fmtT(c.troops)+'</b></span>'+
       '<span>太守 <b>'+(gov? gov.name : '—')+'</b></span></div>';
  if (gov) {
    h += '<div class="meta-line" style="border-top:none;padding-top:4px;margin-top:4px">'+
         '<span>統'+gov.lead+' 武'+gov.might+' 智'+gov.int+' 政'+gov.pol+'</span>'+
         '<span>忠誠 <b>'+gov.loy+'</b></span></div>';
  }
  h += '</div>';

  if (mine) {
    const acts = [
      ['develop','開發','農+4~7　金80'],
      ['commerce','興商','商+4~7　金80'],
      ['fortify','修城','防+3~6　金100'],
      ['recruit','徵兵','+2500兵　金120'],
      ['appease','撫民','民忠+5~9　金60'],
      ['drill','練兵','士氣+　金50']
    ];
    h += '<div class="card"><div class="card-title">內政</div><div class="btn-grid">';
    acts.forEach(a=>{
      h += '<button class="act-btn" data-act="'+a[0]+'" '+(c.acted?'disabled':'')+'>'+
           '<span class="an">'+a[1]+'</span><span class="ac">'+a[2]+'</span></button>';
    });
    h += '</div>';
    if (c.acted) h += '<div class="hint" style="margin-top:9px">本季此城已下過內政令。</div>';
    h += '</div>';

    h += '<div class="card"><div class="card-title">軍事</div>';
    const targets = def.adj.filter(id=> state.cities[id].owner !== state.player);
    const friends = def.adj.filter(id=> state.cities[id].owner === state.player);
    h += '<button class="btn-wide" data-act="attack" '+(c.moved||targets.length===0?'disabled':'')+'>出　征</button>';
    h += '<button class="btn-wide" style="margin-top:7px" data-act="transfer" '+
         (c.moved||friends.length===0||c.troops<=1500?'disabled':'')+'>調　兵</button>';
    if (c.moved) h += '<div class="hint" style="margin-top:9px">本季此城已出兵。</div>';
    else if (targets.length === 0) h += '<div class="hint" style="margin-top:9px">四周皆為我方城池。</div>';
    h += '</div>';

    h += '<div class="card"><div class="card-title">任命太守</div>';
    const list = generalsIn(sel);
    if (!list.length) h += '<div class="hint">此城無駐守武將。</div>';
    else {
      h += '<select id="govSel" style="width:100%">';
      list.forEach(g=>{
        h += '<option value="'+g.id+'" '+(c.governor===g.id?'selected':'')+'>'+g.name+
             '（統'+g.lead+' 政'+g.pol+'）</option>';
      });
      h += '</select>';
      h += '<button class="btn-wide" style="margin-top:9px" data-act="setgov">確　認</button>';
    }
    h += '</div>';
  } else {
    const adjMine = def.adj.filter(id=> state.cities[id].owner === state.player && !state.cities[id].moved);
    h += '<div class="card"><div class="card-title">敵情</div>'+
         '<div class="hint">城防 '+Math.round(c.def)+'　守軍 '+fmtT(c.troops)+
         (gov? '　守將 '+gov.name : '　無守將')+'</div>';
    if (adjMine.length) {
      h += '<button class="btn-wide" style="margin-top:10px" data-act="attack-from-adj">'+
           '自鄰城出兵（'+adjMine.length+' 城可用）</button>';
    } else {
      h += '<div class="hint" style="margin-top:10px">我方無鄰接城池可出兵。</div>';
    }
    h += '</div>';
  }
  return h;
}

function renderGeneralPanel(){
  const p = state.player;
  let h = '';
  const mine = Object.values(state.generals).filter(g=> g.f === p);
  h += '<div class="card"><div class="card-title">我方武將 · '+mine.length+' 人</div>';
  mine.forEach(g=>{
    const loc = g.city ? CITY_BY_ID[g.city].name : '—';
    h += '<div class="gen-row"><span class="gen-name">'+g.name+'</span>'+
         '<span class="gen-stats"><span>統<b>'+g.lead+'</b></span><span>武<b>'+g.might+'</b></span>'+
         '<span>智<b>'+g.int+'</b></span><span>政<b>'+g.pol+'</b></span></span>'+
         '<span class="gen-loc">'+loc+'</span></div>';
  });
  h += '</div>';

  const others = {};
  Object.values(state.generals).forEach(g=>{
    if (g.f === p) return;
    (others[g.f] = others[g.f] || []).push(g);
  });
  h += '<div class="card"><div class="card-title">他方武將</div>';
  Object.keys(others).forEach(f=>{
    h += '<div class="grp-title" style="color:'+FACTIONS[f].color+'">'+FACTIONS[f].name+
         '（'+others[f].length+'）</div>';
    h += '<div style="font-size:12px;color:var(--ink-2);line-height:1.9">'+
         others[f].map(g=> g.name).join('、')+'</div>';
  });
  h += '</div>';
  return h;
}

function renderDiploPanel(){
  const p = state.player;
  let h = '<div class="card"><div class="card-title">諸侯關係</div>';
  Object.keys(FACTIONS).forEach(f=>{
    if (f === 'none' || f === p) return;
    const r = state.rel[p][f];
    const dead = isDead(f);
    h += '<div class="dip-row"><span class="dn" style="color:'+FACTIONS[f].color+'">'+
         FACTIONS[f].name+'</span><div class="dbar"><i style="width:'+r+'%"></i></div>'+
         '<span class="dstat">'+(dead?'已亡':(r>=75?'同盟':(r>=55?'友好':(r>=35?'中立':'敵對'))))+'</span></div>';
  });
  h += '</div>';

  h += '<div class="card"><div class="card-title">外交手段</div>';
  h += '<div class="hint">遣使贈金 200，可改善關係 +12；關係達 75 可結盟，盟友不會主動來犯。</div>';
  const others = Object.keys(FACTIONS).filter(f=> f !== 'none' && f !== p && !isDead(f));
  others.forEach(f=>{
    const r = state.rel[p][f];
    h += '<div class="dip-row"><span class="dn" style="color:'+FACTIONS[f].color+'">'+FACTIONS[f].name+'</span>'+
         '<button style="flex:1" data-act="gift" data-f="'+f+'">贈金 200</button>'+
         '<button style="flex:1" data-act="ally" data-f="'+f+'" '+(r<75?'disabled':'')+'>結盟</button></div>';
  });
  h += '</div>';
  return h;
}

/* ==================== 渲染：日誌 ==================== */
function renderLog(){
  const el = document.getElementById('logbar');
  const items = state.log.slice(-40);
  el.innerHTML = items.map(l=>{
    if (l.cls === 'turn') return '<div class="log-line turn">第 '+l.t+' 季</div>';
    return '<div class="log-line '+l.cls+'"><span class="t">第'+l.t+'季</span>'+l.text+'</div>';
  }).join('');
  el.scrollTop = el.scrollHeight;
}

function refresh(){
  renderTop(); renderMap(); renderSide(); renderLog();
}

/* ==================== 內政 ==================== */
function doAction(kind){
  const c = state.cities[sel];
  const t = state.treasury[state.player];
  if (c.acted) return;
  const gov = c.governor ? state.generals[c.governor] : null;
  const polBonus = gov ? (gov.pol - 60) / 8 : -2;
  const name = CITY_BY_ID[sel].name;

  if (kind === 'develop'){
    if (t.gold < 80) return toast('金不足');
    t.gold -= 80;
    const g = rint(4,7) + Math.max(0, Math.round(polBonus));
    c.agri = clamp(c.agri + g, 0, 100);
    addLog(name + ' 開墾農田，農業 +' + g, 'good');
  } else if (kind === 'commerce'){
    if (t.gold < 80) return toast('金不足');
    t.gold -= 80;
    const g = rint(4,7) + Math.max(0, Math.round(polBonus));
    c.comm = clamp(c.comm + g, 0, 100);
    addLog(name + ' 招徠商賈，商業 +' + g, 'good');
  } else if (kind === 'fortify'){
    if (t.gold < 100) return toast('金不足');
    t.gold -= 100;
    const g = rint(3,6) + Math.max(0, Math.round(polBonus / 2));
    c.def = clamp(c.def + g, 0, 100);
    addLog(name + ' 加固城防，城防 +' + g, 'good');
  } else if (kind === 'recruit'){
    if (t.gold < 120) return toast('金不足');
    if (c.loy < 35) return toast('民忠過低，無法徵兵');
    t.gold -= 120;
    const add = Math.round(2500 * (0.6 + c.loy/200) * (gov ? 1 + (gov.lead-60)/300 : 1));
    c.troops += add;
    c.loy = clamp(c.loy - 4, 0, 100);
    addLog(name + ' 徵兵 ' + fmtT(add) + '，民忠 -4', '');
  } else if (kind === 'appease'){
    if (t.gold < 60) return toast('金不足');
    t.gold -= 60;
    const g = rint(5,9) + Math.max(0, Math.round(polBonus / 2));
    c.loy = clamp(c.loy + g, 0, 100);
    addLog(name + ' 賑濟百姓，民忠 +' + g, 'good');
  } else if (kind === 'drill'){
    if (t.gold < 50) return toast('金不足');
    t.gold -= 50;
    addLog(name + ' 操練兵馬，士氣提振', '');
  }

  c.acted = true;
  refresh();
}

/* ==================== 戰鬥 ==================== */
function resolveBattle(fromId, toId, genId, sendTroops){
  const from = state.cities[fromId];
  const to = state.cities[toId];
  const ag = state.generals[genId];
  const dgId = to.governor || (bestGeneralIn(toId) ? bestGeneralIn(toId).id : null);
  const dg = dgId ? state.generals[dgId] : null;

  const dStart = to.troops;
  let aT = sendTroops, dT = to.troops;
  const lines = [];
  let aMorale = 1, dMorale = 1;

  // 單挑
  if (dg && Math.random() < 0.28){
    const as = ag.might + rint(0, 22);
    const ds = dg.might + rint(0, 22);
    if (as > ds){
      aMorale = 1.12; dMorale = 0.9;
      lines.push({t:'單挑：' + ag.name + ' 力克 ' + dg.name + '，我軍士氣大振。', hl:true});
    } else {
      aMorale = 0.9; dMorale = 1.12;
      lines.push({t:'單挑：' + ag.name + ' 不敵 ' + dg.name + '，軍心動搖。', hl:true});
    }
  }

  // 計略
  if (ag.int > (dg ? dg.int : 50) + 8 && Math.random() < 0.55){
    const dmg = Math.round(dT * rnd(0.05, 0.10));
    dT -= dmg;
    lines.push({t:'計略：' + ag.name + ' 智謀過人，火計焚營，敵軍折損 ' + dmg + '。', hl:true});
  }

  const defBonus = 1 + to.def / 260;

  for (let r = 1; r <= 4 && aT > 0 && dT > 0; r++){
    const aPow = aT * (0.55 + ag.lead / 220) * aMorale;
    const dPow = dT * (0.55 + (dg ? dg.lead : 55) / 220) * dMorale;
    const aLoss = Math.round(dPow * 0.15 * rnd(0.9, 1.1));
    const dLoss = Math.round(aPow * 0.18 / defBonus * rnd(0.9, 1.1));
    aT = Math.max(0, aT - aLoss);
    dT = Math.max(0, dT - dLoss);
    lines.push({t:'第 ' + r + ' 陣：我軍折 ' + aLoss + '，敵軍折 ' + dLoss +
                  '（我 ' + Math.round(aT) + ' / 敵 ' + Math.round(dT) + '）'});
  }

  let win;
  if (dT <= 0 || dT < dStart * 0.15) win = true;
  else if (aT <= 0) win = false;
  else win = false;

  return {win, lines, aLeft: Math.round(aT), dLeft: Math.round(dT),
          fromId, toId, genId, dgId, sent: sendTroops};
}

function applyBattle(res){
  const from = state.cities[res.fromId];
  const to = state.cities[res.toId];
  const atkFac = from.owner;

  from.troops = Math.max(0, from.troops - res.sent);

  if (res.win){
    const oldOwner = to.owner;
    to.owner = atkFac;
    to.troops = Math.max(1000, res.aLeft);
    to.def = Math.round(to.def * 0.4);
    to.loy = clamp(to.loy - 25, 10, 100);
    to.acted = false; to.moved = false;
    to.governor = res.genId;
    if (state.generals[res.genId]) state.generals[res.genId].city = res.toId;

    // 守將撤回或成擒
    const defGens = generalsIn(res.toId);
    defGens.forEach(g=>{
      if (g.id === res.genId) return;
      const refuge = factionCities(oldOwner).filter(id=> id !== res.toId);
      if (refuge.length){
        g.city = refuge[0];
      } else {
        g.city = res.toId;
        g.f = atkFac;
        g.loy = 40;
      }
    });

    addLog(FACTIONS[atkFac].name + ' 攻克 ' + CITY_BY_ID[res.toId].name +
           '（守軍 ' + fmtT(res.dLeft) + ' 潰）', 'war');
    if (isDead(oldOwner)) addLog(FACTIONS[oldOwner].name + ' 勢力滅亡！', 'turn');
  } else {
    to.troops = Math.max(0, res.dLeft);
    from.troops += res.aLeft;
    addLog(FACTIONS[atkFac].name + ' 攻 ' + CITY_BY_ID[res.toId].name + ' 未克，退兵', 'bad');
  }
}

/* ==================== 出征 UI ==================== */
function openAttackModal(fromId, presetTarget){
  const from = state.cities[fromId];
  const fromDef = CITY_BY_ID[fromId];
  const targets = fromDef.adj.filter(id=> state.cities[id].owner !== state.player);
  if (!targets.length) return;
  const gens = generalsIn(fromId);
  if (!gens.length) return toast('此城無武將可領兵');

  const defTarget = presetTarget && targets.indexOf(presetTarget) >= 0 ? presetTarget : targets[0];
  const maxTroops = Math.max(0, from.troops - 500);

  let h = '<div class="mask" data-act="closemask"><div class="modal" onclick="event.stopPropagation()">';
  h += '<div class="modal-head"><span>出　征</span><button class="x" data-act="closemask">×</button></div>';
  h += '<div class="modal-body">';
  h += '<div class="field"><label>自城</label><div style="flex:1;font-size:15px;letter-spacing:2px">'+
       fromDef.name+'（駐軍 '+fmtT(from.troops)+'）</div></div>';
  h += '<div class="field"><label>目標</label><select id="atkTarget">';
  targets.forEach(id=>{
    const c = state.cities[id];
    h += '<option value="'+id+'" '+(id===defTarget?'selected':'')+'>'+
         CITY_BY_ID[id].name+'（'+FACTIONS[c.owner].name+'　守軍 '+fmtT(c.troops)+
         '　城防 '+Math.round(c.def)+'）</option>';
  });
  h += '</select></div>';
  h += '<div class="field"><label>主將</label><select id="atkGen">';
  gens.forEach(g=>{
    h += '<option value="'+g.id+'" '+(g.id===from.governor?'selected':'')+'>'+g.name+
         '（統'+g.lead+' 武'+g.might+' 智'+g.int+'）</option>';
  });
  h += '</select></div>';
  h += '<div class="field"><label>兵力</label><input type="range" id="atkTroops" min="2000" max="'+
       Math.max(2000, maxTroops)+'" step="500" value="'+Math.max(2000, Math.round(maxTroops*0.8))+'">'+
       '<span class="rngval" id="atkTroopsVal"></span></div>';
  h += '<div class="hint" id="atkHint"></div>';
  h += '</div>';
  h += '<div class="modal-foot"><button data-act="closemask">取　消</button>'+
       '<button data-act="confirmattack" data-from="'+fromId+'" '+
       (maxTroops < 2000 ? 'disabled' : '')+
       ' style="background:var(--accent);color:#fff8ee;border-color:var(--accent)">出　擊</button></div>';
  h += '</div></div>';

  document.getElementById('modalRoot').innerHTML = h;

  const range = document.getElementById('atkTroops');
  const update = ()=>{
    const tgt = document.getElementById('atkTarget').value;
    const tv = Number(range.value);
    document.getElementById('atkTroopsVal').textContent = fmtT(tv);
    const tc = state.cities[tgt];
    const ratio = tv / Math.max(1, tc.troops);
    const def = tc.def;
    let verdict;
    if (ratio >= 1.8) verdict = '兵力優勢明顯，勝算甚高。';
    else if (ratio >= 1.3) verdict = '兵力略優，勝負取決於將才。';
    else if (ratio >= 0.9) verdict = '勢均力敵，恐成苦戰。';
    else verdict = '兵力不足，強攻凶多吉少。';
    document.getElementById('atkHint').textContent =
      '敵城防 ' + Math.round(def) + '　我軍 ' + fmtT(tv) + ' vs 守軍 ' + fmtT(tc.troops) +
      '（' + ratio.toFixed(2) + ' 倍）　—　' + verdict;
  };
  range.addEventListener('input', update);
  document.getElementById('atkTarget').addEventListener('change', update);
  update();
}

function openAttackFromAdjacent(targetId){
  const def = CITY_BY_ID[targetId];
  const adj = def.adj.filter(id=> state.cities[id].owner === state.player && !state.cities[id].moved);
  if (!adj.length) return toast('無可用鄰城');
  if (adj.length === 1) return openAttackModal(adj[0], targetId);
  // 多城可選：先選出兵城
  let h = '<div class="mask" data-act="closemask"><div class="modal" onclick="event.stopPropagation()" style="max-width:400px">';
  h += '<div class="modal-head"><span>選擇出兵城池</span><button class="x" data-act="closemask">×</button></div>';
  h += '<div class="modal-body"><div class="btn-grid">';
  adj.forEach(id=>{
    h += '<button class="act-btn" data-act="choosefrom" data-from="'+id+'" data-to="'+targetId+'">'+
         '<span class="an">'+CITY_BY_ID[id].name+'</span>'+
         '<span class="ac">駐軍 '+fmtT(state.cities[id].troops)+'</span></button>';
  });
  h += '</div></div></div></div>';
  document.getElementById('modalRoot').innerHTML = h;
}

function openTransferModal(fromId){
  const from = state.cities[fromId];
  const fromDef = CITY_BY_ID[fromId];
  const friends = fromDef.adj.filter(id=> state.cities[id].owner === state.player);
  if (!friends.length) return toast('無鄰接我方城池');
  const maxT = Math.max(0, from.troops - 1000);
  if (maxT < 500) return toast('兵力不足，無法調動');

  let h = '<div class="mask" data-act="closemask"><div class="modal" onclick="event.stopPropagation()">';
  h += '<div class="modal-head"><span>調　兵</span><button class="x" data-act="closemask">×</button></div>';
  h += '<div class="modal-body">';
  h += '<div class="field"><label>自城</label><div style="flex:1;font-size:15px;letter-spacing:2px">'+
       fromDef.name+'（駐軍 '+fmtT(from.troops)+'）</div></div>';
  h += '<div class="field"><label>移往</label><select id="trTarget">';
  friends.forEach(id=>{
    h += '<option value="'+id+'">'+CITY_BY_ID[id].name+'（駐軍 '+fmtT(state.cities[id].troops)+'）</option>';
  });
  h += '</select></div>';
  h += '<div class="field"><label>兵力</label><input type="range" id="trTroops" min="500" max="'+
       maxT+'" step="500" value="'+Math.round(maxT*0.7)+'"><span class="rngval" id="trVal"></span></div>';
  h += '<div class="hint">調兵耗去此城本季出兵機會；移防途中若遇敵軍，仍以移入城之守軍計算。</div>';
  h += '</div>';
  h += '<div class="modal-foot"><button data-act="closemask">取　消</button>'+
       '<button data-act="confirmtransfer" data-from="'+fromId+'" '+
       'style="background:var(--accent);color:#fff8ee;border-color:var(--accent)">調　撥</button></div>';
  h += '</div></div>';

  document.getElementById('modalRoot').innerHTML = h;
  const r = document.getElementById('trTroops');
  const upd = ()=>{ document.getElementById('trVal').textContent = fmtT(Number(r.value)); };
  r.addEventListener('input', upd);
  upd();
}

function showBattleResult(res){
  const toName = CITY_BY_ID[res.toId].name;
  let h = '<div class="mask"><div class="modal" style="max-width:520px">';
  h += '<div class="modal-head"><span>戰　報</span><button class="x" data-act="closemask">×</button></div>';
  h += '<div class="modal-body">';
  h += '<div class="result-banner '+(res.win?'win':'lose')+'">'+(res.win?'城　破':'退　兵')+'</div>';
  h += res.lines.map(l=> '<div class="battle-line'+(l.hl?' hl':'')+'">'+l.t+'</div>').join('');
  h += '<div class="hint" style="margin-top:12px">'+(res.win
      ? toName+' 已入我手，殘兵 '+fmtT(res.aLeft)+' 留守。'
      : '我軍餘 ' + fmtT(res.aLeft) + ' 退回，敵城尚存 '+fmtT(res.dLeft)+' 守軍。')+'</div>';
  h += '</div><div class="modal-foot"><button data-act="closemask">閱　畢</button></div></div></div>';
  document.getElementById('modalRoot').innerHTML = h;
}

function toast(msg){
  addLog(msg, 'bad');
  renderLog();
}

/* ==================== 回合流程 ==================== */
function endTurn(){
  if (state.over) return;

  // 1. 收入結算
  Object.keys(FACTIONS).forEach(f=>{
    if (f === 'none' || isDead(f)) return;
    const inc = incomeFor(f);
    const t = state.treasury[f];
    t.gold = Math.max(0, t.gold + inc.gold);
    t.food = Math.max(0, t.food + inc.food);
  });
  const inc = incomeFor(state.player);
  addLog('歲入：金 +' + inc.gold + '　糧 ' + (inc.food>=0?'+':'') + inc.food, '');

  // 2. 隨機事件
  randomEvent();

  // 3. AI 行動
  aiTurn();

  // 4. 新回合
  state.turn++;
  CITY_DEFS.forEach(d=>{
    const c = state.cities[d.id];
    c.acted = false; c.moved = false;
  });
  addLog('', 'turn');

  checkGameOver();
  refresh();
}

function incomeFor(f){
  let gold = 0, food = 0, troops = 0;
  factionCities(f).forEach(id=>{
    const c = state.cities[id];
    const loyMul = 0.6 + c.loy / 250;
    gold += c.comm * 1.5 * loyMul;
    food += c.agri * 1.2 * loyMul;
    troops += c.troops;
  });
  food -= troops / 200;
  return {gold: Math.round(gold), food: Math.round(food)};
}

function randomEvent(){
  if (Math.random() > 0.38) return;
  const myCities = factionCities(state.player);
  if (!myCities.length) return;
  const cid = myCities[rint(0, myCities.length - 1)];
  const c = state.cities[cid];
  const name = CITY_BY_ID[cid].name;
  const roll = rint(1, 6);

  if (roll === 1){
    const g = rint(120, 260);
    state.treasury[state.player].food += g;
    addLog(name + ' 五穀豐登，糧 +' + g, 'good');
  } else if (roll === 2){
    const g = rint(100, 220);
    state.treasury[state.player].food = Math.max(0, state.treasury[state.player].food - g);
    addLog(name + ' 蝗災為患，糧 -' + g, 'bad');
  } else if (roll === 3){
    c.loy = clamp(c.loy - rint(6, 12), 0, 100);
    addLog(name + ' 民變四起，民忠下降', 'bad');
  } else if (roll === 4){
    const g = rint(100, 200);
    state.treasury[state.player].gold += g;
    addLog(name + ' 商賈雲集，金 +' + g, 'good');
  } else if (roll === 5){
    const loss = Math.round(c.troops * rnd(0.04, 0.09));
    c.troops = Math.max(0, c.troops - loss);
    addLog(name + ' 軍中疫病，折兵 ' + loss, 'bad');
  } else {
    c.loy = clamp(c.loy + rint(4, 8), 0, 100);
    addLog(name + ' 風調雨順，民心歸附', 'good');
  }
}

/* ==================== AI ==================== */
function aiTurn(){
  Object.keys(FACTIONS).forEach(f=>{
    if (f === 'none' || f === state.player || isDead(f)) return;

    // 內政
    factionCities(f).forEach(cid=>{
      if (Math.random() < 0.7) aiDevelop(cid, f);
    });

    // 出征
    let guard = 0;
    while (guard++ < 2){
      const mv = findAiAttack(f);
      if (!mv) break;
      const res = resolveBattle(mv.from, mv.to, mv.gen, mv.troops);
      applyBattle(res);
      state.cities[mv.from].moved = true;
    }
  });
}

function aiDevelop(cid, f){
  const c = state.cities[cid];
  const t = state.treasury[f];
  if (c.acted) return;
  const opts = [];
  if (t.gold >= 120 && c.troops < 28000){ opts.push('recruit'); opts.push('recruit'); opts.push('recruit'); }
  if (t.gold >= 100 && c.def < 85) opts.push('fortify');
  if (t.gold >= 80) { opts.push('develop'); opts.push('commerce'); }
  if (t.gold >= 60 && c.loy < 70) opts.push('appease');
  if (!opts.length) return;

  const pick = opts[rint(0, opts.length - 1)];
  if (pick === 'recruit'){
    t.gold -= 120;
    c.troops += 2500;
    c.loy = clamp(c.loy - 4, 0, 100);
  } else if (pick === 'fortify'){
    t.gold -= 100; c.def = clamp(c.def + rint(3,6), 0, 100);
  } else if (pick === 'develop'){
    t.gold -= 80; c.agri = clamp(c.agri + rint(4,7), 0, 100);
  } else if (pick === 'commerce'){
    t.gold -= 80; c.comm = clamp(c.comm + rint(4,7), 0, 100);
  } else {
    t.gold -= 60; c.loy = clamp(c.loy + rint(5,9), 0, 100);
  }
  c.acted = true;
}

function findAiAttack(f){
  let best = null;
  factionCities(f).forEach(fromId=>{
    const from = state.cities[fromId];
    if (from.moved || from.troops < 6000) return;
    const adj = CITY_BY_ID[fromId].adj;
    adj.forEach(toId=>{
      const to = state.cities[toId];
      if (to.owner === f) return;
      if (state.rel[f][to.owner] >= 75) return; // 盟友不攻
      if (to.owner === state.player && state.rel[f][state.player] >= 75) return;
      const avail = from.troops - 1500;
      if (avail < 4000) return;
      const need = to.troops * (1.65 + to.def / 320);
      if (avail < need) return;
      const gen = bestGeneralIn(fromId);
      if (!gen) return;
      const score = avail - need;
      if (!best || score > best.score){
        best = {from: fromId, to: toId, gen: gen.id,
                troops: Math.round(avail * 0.9), score};
      }
    });
  });
  return best;
}

/* ==================== 勝負 ==================== */
function checkGameOver(){
  const p = state.player;
  if (isDead(p)){
    state.over = true;
    showEnd('失　勢', '城池盡失，霸業成空。', false);
    return;
  }
  const alive = Object.keys(FACTIONS).filter(f=> f !== 'none' && !isDead(f));
  const notMine = CITY_DEFS.filter(d=> state.cities[d.id].owner !== p).length;
  if (notMine === 0){
    state.over = true;
    showEnd('天　下', '四海歸一，霸業已成。', true);
  } else if (alive.length === 1 && alive[0] === p){
    state.over = true;
    showEnd('天　下', '群雄盡滅，天下已定。', true);
  }
}

function showEnd(title, desc, win){
  let h = '<div class="mask"><div class="modal" style="max-width:420px">';
  h += '<div class="modal-head"><span>終　局</span></div>';
  h += '<div class="modal-body" style="text-align:center;padding:34px 20px">';
  h += '<div class="result-banner '+(win?'win':'lose')+'" style="font-size:32px">'+title+'</div>';
  h += '<div style="color:var(--ink-2);margin-top:10px">'+desc+'</div>';
  h += '<div style="color:var(--ink-3);font-size:12px;margin-top:16px">共歷 '+state.turn+' 季</div>';
  h += '</div><div class="modal-foot" style="justify-content:center">'+
       '<button data-act="restart">重　開</button></div></div></div>';
  document.getElementById('modalRoot').innerHTML = h;
}

/* ==================== 事件綁定 ==================== */
document.addEventListener('click', function(e){
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.getAttribute('data-act');

  if (act === 'pick'){
    sel = el.getAttribute('data-id');
    tab = 'city';
    document.querySelectorAll('.tabs button').forEach(b=> b.classList.remove('on'));
    document.querySelector('.tabs button[data-tab="city"]').classList.add('on');
    refresh();
    return;
  }

  if (act === 'start'){
    startGame(el.getAttribute('data-f'));
    return;
  }

  if (act === 'tab'){
    tab = el.getAttribute('data-tab');
    document.querySelectorAll('.tabs button').forEach(b=> b.classList.remove('on'));
    el.classList.add('on');
    renderSide();
    return;
  }

  if (act === 'endturn'){ endTurn(); return; }

  if (['develop','commerce','fortify','recruit','appease','drill'].indexOf(act) >= 0){
    doAction(act);
    return;
  }

  if (act === 'attack'){ openAttackModal(sel); return; }
  if (act === 'attack-from-adj'){ openAttackFromAdjacent(sel); return; }
  if (act === 'transfer'){ openTransferModal(sel); return; }
  if (act === 'confirmtransfer'){
    const fromId = el.getAttribute('data-from');
    const toId = document.getElementById('trTarget').value;
    const n = Number(document.getElementById('trTroops').value);
    document.getElementById('modalRoot').innerHTML = '';
    const from = state.cities[fromId];
    if (n > from.troops - 1000) return toast('兵力不足');
    from.troops -= n;
    state.cities[toId].troops += n;
    from.moved = true;
    addLog('自 ' + CITY_BY_ID[fromId].name + ' 調兵 ' + fmtT(n) + ' 至 ' + CITY_BY_ID[toId].name, '');
    refresh();
    return;
  }
  if (act === 'choosefrom'){
    openAttackModal(el.getAttribute('data-from'), el.getAttribute('data-to'));
    return;
  }

  if (act === 'confirmattack'){
    const fromId = el.getAttribute('data-from');
    const toId = document.getElementById('atkTarget').value;
    const genId = document.getElementById('atkGen').value;
    const troops = Number(document.getElementById('atkTroops').value);
    document.getElementById('modalRoot').innerHTML = '';
    const res = resolveBattle(fromId, toId, genId, troops);
    applyBattle(res);
    state.cities[fromId].moved = true;
    showBattleResult(res);
    checkGameOver();
    refresh();
    return;
  }

  if (act === 'closemask'){
    document.getElementById('modalRoot').innerHTML = '';
    return;
  }

  if (act === 'setgov'){
    const v = document.getElementById('govSel').value;
    state.cities[sel].governor = v;
    addLog(CITY_BY_ID[sel].name + ' 任命 ' + state.generals[v].name + ' 為太守', '');
    refresh();
    return;
  }

  if (act === 'gift'){
    const f = el.getAttribute('data-f');
    const t = state.treasury[state.player];
    if (t.gold < 200) return toast('金不足');
    t.gold -= 200;
    state.rel[state.player][f] = clamp(state.rel[state.player][f] + 12, 0, 100);
    state.rel[f][state.player] = clamp(state.rel[f][state.player] + 10, 0, 100);
    addLog('遣使贈金於 ' + FACTIONS[f].name + '，關係改善', 'good');
    refresh();
    return;
  }

  if (act === 'ally'){
    const f = el.getAttribute('data-f');
    state.rel[state.player][f] = 100;
    state.rel[f][state.player] = 100;
    addLog('與 ' + FACTIONS[f].name + ' 結為同盟', 'good');
    refresh();
    return;
  }

  if (act === 'help'){ showHelp(); return; }
  if (act === 'restart'){ location.reload(); return; }
});

function showHelp(){
  let h = '<div class="mask" data-act="closemask"><div class="modal" onclick="event.stopPropagation()" style="max-width:540px">';
  h += '<div class="modal-head"><span>兵法說明</span><button class="x" data-act="closemask">×</button></div>';
  h += '<div class="modal-body">';
  h += '<div class="grp-title">每季流程</div>';
  h += '<div style="line-height:2;color:var(--ink-2);font-size:12.5px">'+
       '下內政令 → 出兵 → 結束回合（歲入結算 → 隨機事件 → 諸侯行動）→ 新一季</div>';
  h += '<div class="grp-title">每城每季</div>';
  h += '<div style="line-height:2;color:var(--ink-2);font-size:12.5px">'+
       '1 道內政令（開發／興商／修城／徵兵／撫民／練兵）＋ 1 次軍事行動（出征或調兵）</div>';
  h += '<div class="grp-title">戰鬥</div>';
  h += '<div style="line-height:2;color:var(--ink-2);font-size:12.5px">'+
       '最多四陣交鋒。兵力、統率、城防、士氣共同決定傷亡。<br>'+
       '智力高者可施火計；猛將有機會單挑，勝者提振全軍。<br>'+
       '守軍降至開戰時一成半以下，城即破。</div>';
  h += '<div class="grp-title">經濟</div>';
  h += '<div style="line-height:2;color:var(--ink-2);font-size:12.5px">'+
       '金來自商業，糧來自農業，皆受民忠影響。<br>駐軍每 200 人每季耗糧 1。</div>';
  h += '<div class="grp-title">勝負</div>';
  h += '<div style="line-height:2;color:var(--ink-2);font-size:12.5px">'+
       '佔領全部城池即統一天下；城池盡失則霸業終結。</div>';
  h += '</div><div class="modal-foot"><button data-act="closemask">知　悉</button></div></div></div>';
  document.getElementById('modalRoot').innerHTML = h;
}

/* ==================== 啟動 ==================== */
function renderStart(){
  const list = document.getElementById('factionList');
  let h = '';
  ['cao','sun','yuan','liu','ma'].forEach(f=>{
    const fac = FACTIONS[f];
    const cities = CITY_DEFS.filter(d=> d.f === f).length;
    const troops = CITY_DEFS.filter(d=> d.f === f).reduce((s,d)=> s + d.troops, 0);
    const gens = GENERAL_DEFS.filter(g=> g.f === f).length;
    h += '<div class="fcard" data-act="start" data-f="'+f+'">';
    h += '<div class="fbar" style="background:'+fac.color+'"></div>';
    h += '<div class="fname" style="color:'+fac.color+'">'+fac.name+'</div>';
    h += '<div class="fseat">據 '+fac.seat+'</div>';
    h += '<div class="finfo">城池 '+cities+'　武將 '+gens+'<br>兵力 '+fmtT(troops)+'</div>';
    h += '<div class="fdiff" style="color:'+fac.diffColor+'">'+fac.diff+'</div>';
    h += '</div>';
  });
  list.innerHTML = h;
}

function startGame(f){
  state = buildState(f);
  sel = null;
  CITY_DEFS.forEach(d=>{ if (d.f === f && d.name === FACTIONS[f].seat) sel = d.id; });
  if (!sel) sel = factionCities(f)[0];
  tab = 'city';
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  addLog('建安年間，' + FACTIONS[f].name + ' 起兵，志在天下。', 'turn');
  refresh();
}

renderStart();
})();
