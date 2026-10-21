// 貪婪玩家機器人 v2：每次操作前清空模態殘留，避免假攻擊
const fs = require('fs');
const html = fs.readFileSync('C:/Users/midas/WorkBuddy AI/三國誌/三國志·霸業.html', 'utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const store = {};
function mkEl(id){
  return { id, textContent:'', innerHTML:'', value:'', scrollTop:0, scrollHeight:100,
    classList:{ _s:new Set(), add(c){this._s.add(c)}, remove(c){this._s.delete(c)}, contains(c){return this._s.has(c)} },
    addEventListener(){}, appendChild(){}, querySelector(){return mkEl('q')},
    querySelectorAll(){return []}, getAttribute(){return null}, setAttribute(){} };
}
global.document = {
  getElementById(id){ return store[id] || (store[id] = mkEl(id)); },
  querySelector(){ return mkEl('q'); },
  querySelectorAll(){ return []; },
  addEventListener(t, fn){ if (t === 'click') global.__click = fn; },
  createElement(){ return mkEl('c'); }
};
global.window = global;
global.location = { reload(){} };
eval(code);

function click(act, attrs){
  const el = { getAttribute(k){ return k === 'data-act' ? act : (attrs && attrs[k] != null ? attrs[k] : null); } };
  global.__click({ target: { closest(){ return el; } } });
}
function clearModal(){
  document.getElementById('modalRoot').innerHTML = '';
  ['atkTarget','atkGen','atkTroops','trTarget','trTroops'].forEach(k=>{
    if (store[k]) store[k].value = '';
  });
}
function modalOpen(){ return (store['modalRoot'] && store['modalRoot'].innerHTML || '').length > 0; }

const CITIES = ['beiping','ye','jinyang','pingyuan','luoyang','changan','tianshui','xiliang',
  'xuchang','chenliu','runan','xuzhou','shouchun','wan','xiangyang','jiangling','changsha',
  'chaisang','jianye','wu','kuaiji','hanzhong','chengdu','yongan'];

function play(faction, maxTurns){
  Object.keys(store).forEach(k=> delete store[k]);
  eval(code);
  click('start', {'data-f': faction});
  const S = () => window.SGZ.state;
  let attacks = 0;

  for (let t=0; t<maxTurns; t++){
    const st = S();
    if (st.over) break;
    const me = st.player;

    // 1) 內政：優先徵兵
    for (const id of CITIES){
      const c = st.cities[id];
      if (c.owner !== me || c.acted) continue;
      const t2 = st.treasury[me];
      click('pick', {'data-id': id});
      if (t2.gold >= 120 && t2.food > 150 && c.troops < 30000) click('recruit');
      else if (t2.gold >= 80) click('develop');
    }

    // 2) 調兵：內地 → 前線
    for (const id of CITIES){
      const c = st.cities[id];
      if (c.owner !== me || c.moved || c.troops < 7000) continue;
      const def = window.SGZ.CITY_BY_ID[id];
      const hostile = def.adj.some(n=>{
        const o = st.cities[n].owner;
        return o !== me && (o === 'none' || st.rel[me][o] < 75);
      });
      if (hostile) continue;
      const friend = def.adj.find(n=> st.cities[n].owner === me);
      if (!friend) continue;
      clearModal();
      click('pick', {'data-id': id});
      click('transfer');
      if (!modalOpen()) continue;
      document.getElementById('trTarget').value = friend;
      document.getElementById('trTroops').value = String(c.troops - 1000);
      click('confirmtransfer', {'data-from': id});
    }

    // 3) 出征
    for (const id of CITIES){
      const c = st.cities[id];
      if (c.owner !== me || c.moved || c.troops < 6000) continue;
      const def = window.SGZ.CITY_BY_ID[id];
      let best = null, bestNeed = 1e9;
      for (const nid of def.adj){
        const n = st.cities[nid];
        if (n.owner === me) continue;
        if (st.rel[me][n.owner] >= 75) continue;
        const need = n.troops * (1.5 + n.def/240);
        const avail = c.troops - 800;
        if (avail > need && n.troops < bestNeed){ best = nid; bestNeed = n.troops; }
      }
      if (!best) continue;
      const gens = Object.values(st.generals).filter(g=> g.city === id);
      if (!gens.length) continue;
      clearModal();
      click('pick', {'data-id': id});
      click('attack');
      if (!modalOpen()) continue;
      document.getElementById('atkTarget').value = best;
      document.getElementById('atkGen').value = gens.sort((a,b)=>b.lead-a.lead)[0].id;
      document.getElementById('atkTroops').value = String(c.troops - 800);
      attacks++;
      click('confirmattack', {'data-from': id});
    }
    click('endturn');
  }
  const st = S();
  const mine = CITIES.filter(id=> st.cities[id].owner === st.player).length;
  const alive = ['cao','sun','yuan','liu','ma'].filter(f=> CITIES.some(id=> st.cities[id].owner === f));
  return {turn: st.turn, mine, over: st.over, alive: alive.length, attacks};
}

['cao','sun','yuan','liu','ma'].forEach(f=>{
  const runs = [];
  for (let i=0;i<6;i++) runs.push(play(f, 120));
  const avg = a => Math.round(a.reduce((x,y)=>x+y,0)/a.length);
  const winsN = runs.filter(r=> r.mine === 24 || r.alive === 1).length;
  const deadN = runs.filter(r=> r.mine === 0).length;
  console.log(
    f.padEnd(5),
    '平均' + avg(runs.map(r=>r.turn)) + '季',
    '城池' + avg(runs.map(r=>r.mine)) + '/24',
    '勝' + winsN + '/6',
    '亡' + deadN + '/6',
    '攻城' + avg(runs.map(r=>r.attacks)) + '次'
  );
  console.log('   逐局:', runs.map(r=> r.turn+'季/'+r.mine+'城').join('  '));
});
