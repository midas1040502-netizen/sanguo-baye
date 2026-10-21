/* _terrain.js — 驗證山脈／河川／城內建築／行軍動畫
   1. 地形資料結構與「不壓住城池」
   2. 以 Proxy 假畫布跑完整 render()（山脈、河川、建築、行軍、特效）
   3. 出征／調兵／抵達／決戰的特效生命週期                                   */
const fs = require('fs');
const code = fs.readFileSync('三國志·霸業.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];

function mkEl(id){
  return {id, textContent:'', innerHTML:'', value:'', scrollTop:0, scrollHeight:100,
    style:{}, classList:{_s:new Set(), add(c){this._s.add(c)}, remove(c){this._s.delete(c)},
    contains(c){return this._s.has(c)}, toggle(){}},
    addEventListener(){}, appendChild(){},
    querySelector(){ return mkEl('q'); }, querySelectorAll(){ return []; },
    getAttribute(){ return null; }, setAttribute(){}};
}
const store = {};
global.document = {
  getElementById(id){ return store[id] || (store[id] = mkEl(id)); },
  querySelector(){ return mkEl('q'); },
  querySelectorAll(){ return []; },
  addEventListener(t, f){ if (t === 'click') global.__click = f; },
  createElement(){ return mkEl('c'); }
};
global.window = global;
global.location = {reload(){}};
eval(code);

const sgz = global.SGZ;
const M = sgz.Map3D;
let errors = 0;
function check(cond, msg){ console.log((cond ? '  ✔ ' : '  ✘ ') + msg); if (!cond) errors++; }
function click(act, attrs){
  const el = {_s:new Set(),
    classList:{add(c){el._s.add(c)}, remove(c){el._s.delete(c)}, contains(c){return el._s.has(c)}},
    style:{},
    getAttribute(k){ return k === 'data-act' ? act : (attrs && attrs[k] != null ? attrs[k] : null); }};
  try { global.__click({target:{closest(){ return el; }}}); }
  catch(e){ errors++; console.log('  ✘ click ' + act + ' → ' + e.message); }
}

/* ---------- 1. 地形資料 ---------- */
console.log('=== 1. 地形資料 ===');
check(sgz.RIVERS.length === 4, '四條河川（黃河／長江／漢水／淮河）');
check(sgz.RANGES.length === 6, '六道山脈（秦嶺／太行／祁連／巫山／大巴／會稽）');
const names = sgz.RANGES.map(r=> r.name).join('／');
check(names.indexOf('秦嶺') >= 0 && names.indexOf('太行山') >= 0, '山脈名：' + names);
const rn = sgz.RIVERS.map(r=> r.name).join('／');
check(rn.indexOf('黃河') >= 0 && rn.indexOf('長江') >= 0, '河川名：' + rn);
/* 任何地形頂點不可壓住城池中心（距離 ≥ 14 畫面單位） */
let minD = 1e9, minWho = '';
sgz.CITY_DEFS.forEach(c=>{
  sgz.RIVERS.forEach(rv=> rv.pts.forEach(p=>{
    const d = Math.hypot(p[0] - c.x, p[1] - c.y);
    if (d < minD){ minD = d; minWho = c.name + '–' + rv.name; }
  }));
  sgz.RANGES.forEach(rg=> rg.pts.forEach(p=>{
    const d = Math.hypot(p[0] - c.x, p[1] - c.y);
    if (d < minD){ minD = d; minWho = c.name + '–' + rg.name; }
  }));
});
check(minD >= 14, '地形未壓住城池（最近距離 ' + minD.toFixed(1) + '：' + minWho + '）');

/* ---------- 2. Proxy 假畫布跑完整 render ---------- */
console.log('=== 2. 完整繪製（山脈／河川／建築／行軍） ===');
const noop = ()=>{};
const fakeCtx = new Proxy({}, { get(t, k){ return noop; }, set(){ return true; } });
M.ctx = fakeCtx;
M.cv = {width: 700, height: 600, parentElement:{getBoundingClientRect:()=>({width:700, height:600})},
        addEventListener(){}, getContext(){ return fakeCtx; }};
M.w = 700; M.h = 600; M.scale = 1; M.cx = 350; M.cy = 300;

click('start', {'data-f':'cao'});
const st = sgz.state;
st.sel = 'xuchang';
try { M.render(); check(true, 'render()（含山脈、河川、24 城建築）無錯誤'); }
catch(e){ errors++; console.log('  ✘ render() → ' + e.message + '\n' + e.stack.split('\n').slice(0,4).join('\n')); }

/* 建立行軍後再畫一次（含將軍帶兵隊列） */
const genId = Object.values(st.generals).find(g=> g.city === 'xuchang').id;
sgz.createMarch('xuchang', 'ye', genId, 8000, {cav:.25, bow:.25, swd:.25, shd:.25});
try { M.render(); check(true, '行軍中 render()（將軍舉旗 + 士兵隊列）無錯誤'); }
catch(e){ errors++; console.log('  ✘ 行軍 render() → ' + e.message); }

/* ---------- 3. 特效生命週期 ---------- */
console.log('=== 3. 衝鋒特效（出兵／抵達／決戰） ===');
M.fx = [];
sgz.createMarch('xuchang', 'runan', genId, 6000, {cav:.25, bow:.25, swd:.25, shd:.25});
check(M.fx.length === 1 && M.fx[0].type === 'out', '出征 spawn「衝出城門」特效');
try { M.stepFx(2.2); check(M.fx.length === 0, '特效 2.2 秒後自動清除'); }
catch(e){ errors++; console.log('  ✘ stepFx → ' + e.message); }

/* 抵達駐防（友城）→ 'in' 特效 */
M.fx = [];
const m1 = st.marches[st.marches.length - 1];
sgz.resolveMarch(m1);
check(M.fx.length === 1 && M.fx[0].type === 'in', '援軍抵達 spawn「衝進城裡」特效');
try { M.render(); check(true, '特效 render() 無錯誤'); }
catch(e){ errors++; console.log('  ✘ 特效 render() → ' + e.message); }

/* 敵城決戰 → assault + in/retreat */
M.fx = [];
const enemyCity = sgz.CITY_BY_ID.xuchang.adj.find(id=> st.cities[id].owner !== st.player);
sgz.createMarch('xuchang', enemyCity, genId, 9000, {cav:.25, bow:.25, swd:.25, shd:.25});
const m2 = st.marches[st.marches.length - 1];
m2.eta = 1;
M.fx = [];                       // 清掉出發特效，只看決戰特效
sgz.resolveMarch(m2);
const types = M.fx.map(f=> f.type).join(',');
check(M.fx.length === 2 && types.indexOf('assault') >= 0, '敵城決戰 spawn 衝擊特效（' + types + '）');
try { for (let i = 0; i < 10; i++){ M.stepFx(0.2); M.render(); } check(true, '決戰特效逐幀 render() 無錯誤'); }
catch(e){ errors++; console.log('  ✘ 決戰逐幀 → ' + e.message); }

/* 調兵特效（先開調兵視窗帶入目標與兵力） */
M.fx = [];
st.sel = 'xuchang';
st.cities.xuchang.troops = 20000;
st.cities.xuchang.moved = false;
click('transfer');
global.document.getElementById('trTarget').value = 'ye';
global.document.getElementById('trTroops').value = '1500';
click('confirmtransfer', {'data-from':'xuchang'});
check(M.fx.length === 1 && M.fx[0].type === 'transfer', '調兵 spawn 全程騎行特效');

/* ---------- 4. 不死迴圈濫用：fx 過多時仍能收斂 ---------- */
console.log('=== 4. 壓力測試 ===');
try {
  for (let i = 0; i < 30; i++){
    sgz.createMarch('xuchang', 'ye', genId, 1000, {cav:.25, bow:.25, swd:.25, shd:.25});
  }
  M.render();
  check(true, '30 枚行軍 + ' + M.fx.length + ' 枚特效同框 render() 無錯誤');
} catch(e){ errors++; console.log('  ✘ 壓力測試 → ' + e.message); }

console.log('');
console.log('總錯誤數：' + errors);
process.exit(errors ? 1 : 0);
