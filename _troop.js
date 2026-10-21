// 兵種相剋驗證：同一兵力下，不同編制的勝率與傷亡
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

const S = window.SGZ;
const N = 4000;

// 先開局，state 才有內容
global.__click({ target: { closest(){ return {
  getAttribute(k){ return k === 'data-act' ? 'start' : (k === 'data-f' ? 'cao' : null); }
}; } } });

function trial(aMix, dMix, aT, dT, def){
  const st = S.state;
  // 直接改寫對局狀態再呼叫 resolveBattle
  st.cities.xuchang.owner = 'cao';
  st.cities.xuchang.troops = aT;
  st.cities.xuchang.mix = S.normMix(aMix);
  st.cities.ye.owner = 'yuan';
  st.cities.ye.troops = dT;
  st.cities.ye.def = def;
  st.cities.ye.mix = S.normMix(dMix);
  st.generals.caocao.city = 'xuchang';
  st.generals.yuanshao.city = 'ye';
  st.cities.ye.governor = 'yuanshao';
  st.cities.xuchang.governor = 'caocao';
  const r = S.resolveBattle('xuchang', 'ye', 'caocao', aT, aMix);
  return r;
}

function run(label, aMix, dMix, aT, dT, def){
  let win = 0, aSum = 0, dSum = 0;
  for (let i = 0; i < N; i++){
    const r = trial(aMix, dMix, aT, dT, def);
    if (r.win) win++;
    aSum += r.aLeft; dSum += r.dLeft;
  }
  console.log(label.padEnd(28),
    '勝率 ' + (win / N * 100).toFixed(1).padStart(5) + '%',
    ' 我餘 ' + (aSum / N).toFixed(0).padStart(6),
    ' 敵餘 ' + (dSum / N).toFixed(0).padStart(6));
}

function mix(o){ return S.normMix(o); }
const EVEN = {cav:25,bow:25,swd:25,shd:25};

console.log('=== 兵力 13000 攻 10000，城防 60（貼近攻城門檻）===');
const defCav = {cav:60,bow:13,swd:14,shd:13};
const defShd = {cav:13,bow:14,swd:13,shd:60};
const defBow = {cav:13,bow:60,swd:14,shd:13};

run('均衡 vs 均衡', EVEN, EVEN, 13000, 10000, 60);
run('騎兵60 vs 騎兵60', {cav:60,bow:13,swd:14,shd:13}, defCav, 13000, 10000, 60);
run('均衡 vs 騎兵60', EVEN, defCav, 13000, 10000, 60);
run('盾兵60 vs 騎兵60（相剋）', {cav:13,bow:14,swd:13,shd:60}, defCav, 13000, 10000, 60);
run('弓兵60 vs 騎兵60（被剋）', {cav:13,bow:60,swd:14,shd:13}, defCav, 13000, 10000, 60);
run('刀兵60 vs 盾兵60（相剋）', {cav:13,bow:14,swd:60,shd:13}, defShd, 13000, 10000, 60);
run('均衡 vs 盾兵60', EVEN, defShd, 13000, 10000, 60);
run('弓兵60 vs 刀兵60（相剋）', {cav:13,bow:60,swd:14,shd:13}, {cav:13,bow:14,swd:60,shd:13}, 13000, 10000, 60);
run('均衡 vs 弓兵60', EVEN, defBow, 13000, 10000, 60);

console.log('\n=== 自動反制（counterMix）===');
['cav','bow','swd','shd'].forEach(k=>{
  const d = {}; S.TKEYS.forEach(j=> d[j] = 0.1333); d[k] = 0.60;
  const cm = S.counterMix(d);
  run('counterMix vs ' + S.TROOPS[k].name + '60', cm, d, 13000, 10000, 60);
});

console.log('\n=== 相剋係數檢查 ===');
S.TKEYS.forEach(k=>{
  const a = {}; S.TKEYS.forEach(j=> a[j] = 0); a[k] = 1;
  const t = S.TROOPS[k].beats;
  const d = {}; S.TKEYS.forEach(j=> d[j] = 0); d[t] = 1;
  console.log('全' + S.TROOPS[k].name + ' vs 全' + S.TROOPS[t].name + ' → x' +
    S.counterBonus(a, d).toFixed(3));
});
