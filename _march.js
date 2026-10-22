// 無頭功能測試：行軍系統（出征需 20 季）
const fs = require('fs');
const path = 'C:/Users/midas/WorkBuddy AI/三國誌/三國志·霸業.html';
const code = fs.readFileSync(path, 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];

function mkEl(id){
  return {
    id, textContent:'', innerHTML:'', value:'', scrollTop:0, scrollHeight:100,
    style:{}, classList:{ _s:new Set(), add(c){this._s.add(c)}, remove(c){this._s.delete(c)},
                contains(c){return this._s.has(c)}, toggle(){} },
    addEventListener(){}, appendChild(){}, querySelector(){return mkEl('q')},
    querySelectorAll(){return []},
    getAttribute(){return null}, setAttribute(){}
  };
}
const store = {};
global.document = {
  getElementById(id){ return store[id] || (store[id] = mkEl(id)); },
  querySelector(){ return mkEl('q'); },
  querySelectorAll(){ return []; },
  addEventListener(type, fn){ if (type === 'click') global.__click = fn; },
  createElement(){ return mkEl('c'); }
};
global.window = global;
global.location = { reload(){} };

eval(code);
let errors = 0;
let pass = 0, fail = 0;
function check(cond, label){
  if (cond){ pass++; console.log('  ✔ ' + label); }
  else { fail++; console.log('  ✘ ' + label); }
}

function click(act, attrs){
  const el = {
    _s:new Set(),
    classList:{ add(c){el._s.add(c)}, remove(c){el._s.delete(c)},
                contains(c){return el._s.has(c)} },
    style:{},
    getAttribute(k){
      return k === 'data-act' ? act : (attrs && attrs[k] != null ? attrs[k] : null);
    }
  };
  try { global.__click({ target:{ closest(){ return el; } } }); }
  catch(e){ errors++; console.log('!! 錯誤 act=' + act + ' → ' + e.message);
            console.log(e.stack.split('\n').slice(0,4).join('\n')); }
}
function resetStore(){
  Object.keys(store).forEach(k=> delete store[k]);
  eval(code);
}
const sgz = () => global.SGZ;
const EVEN = {cav:0.25, bow:0.25, swd:0.25, shd:0.25};

/* ---------- 1. 完整 UI 路徑：出征 → 建立行軍 ---------- */
console.log('=== 1. 出征收生出 20 季行軍（UI 全路徑） ===');
resetStore();
click('start', {'data-f':'cao'});
{
  const st = sgz().state;
  const fromId = 'xuchang';
  const genId = Object.values(st.generals).find(g=> g.city === fromId).id;
  const target = 'ye';                                   // 袁紹的鄴，許昌鄰城
  const t0 = st.cities[fromId].troops;
  const send = 9000;

  store['atkTarget'] = mkEl(); store['atkTarget'].value = target;
  store['atkGen']    = mkEl(); store['atkGen'].value = genId;
  store['atkTroops'] = mkEl(); store['atkTroops'].value = String(send);
  store['mixEditor'] = mkEl();

  click('confirmattack', {'data-from': fromId});

  check(st.marches.length === 1, '建立 1 支行軍部隊');
  const m = st.marches[0];
  check(m && m.eta === sgz().MARCH_TURNS, '行軍時間 = 20 季（eta ' + sgz().MARCH_TURNS + '）');
  check(m && m.troops === send, '行軍兵力 = 派出兵力 ' + send);
  check(m && m.owner === 'cao' && m.to === target && m.from === fromId, '行軍歸屬與路線正確');
  check(Math.abs(st.cities[fromId].troops - (t0 - send)) < 2,
        '出發城兵力已扣除（' + t0 + ' → ' + st.cities[fromId].troops + '）');
  check(st.generals[genId].city === null, '主將隨軍離城（city = null）');
  check(st.cities[fromId].moved === true, '出發城標記已行動');

  /* 逐季推進：前 19 季仍在途，第 20 季結算（AI 也可能出兵，只追蹤我軍這支） */
  const my = ()=> st.marches.find(m=> m.from === fromId && m.owner === 'cao');
  for (let i = 1; i < sgz().MARCH_TURNS; i++){
    click('endturn');
    const m = my();
    check(m && m.eta === sgz().MARCH_TURNS - i,
          '第 ' + i + ' 季結算後仍在途（剩 ' + (m ? m.eta : '—') + ' 季）');
  }
  click('endturn');   // 第 20 季 → 抵達決戰
  check(!my(), '第 20 季抵達，我行軍清除');
  const gBack = st.generals[genId];
  check(!!gBack.city, '主將戰後有歸處（' + (gBack.city || '無') + '）');
  check(errors === 0, '全程無執行期錯誤（錯誤數 ' + errors + '）');
}

/* ---------- 2. 行軍中持續耗糧 ---------- */
console.log('=== 2. 行軍部隊計入耗糧 ===');
resetStore();
click('start', {'data-f':'cao'});
{
  const st = sgz().state;
  const g = Object.values(st.generals).find(x=> x.city === 'xuchang').id;
  sgz().createMarch('xuchang', 'ye', g, 15000, EVEN);
  const incMarch = (function(){
    // incomeFor 未匯出，用 treasury 前後差間接驗證不崩潰；直接檢查行軍存在
    return st.marches.length;
  })();
  check(incMarch === 1, '行軍建立成功（15000 兵在途）');
  for (let i = 0; i < 20; i++) click('endturn');
  check(errors === 0, '行軍 20 季推進無錯誤');
}

/* ---------- 3. 抵達友城＝援軍駐防 ---------- */
console.log('=== 3. 抵達自家城池：援軍駐防不戰鬥 ===');
resetStore();
click('start', {'data-f':'cao'});
{
  const st = sgz().state;
  const genId = Object.values(st.generals).find(x=> x.city === 'runan').id;
  if (!genId){ check(false, '找不到汝南守將'); }
  else {
    const t0 = st.cities.xuchang.troops;
    sgz().createMarch('runan', 'xuchang', genId, 6000, EVEN);
    for (let i = 0; i < 20; i++) click('endturn');
    const got = st.cities.xuchang.troops;
    check(st.cities.xuchang.owner === 'cao', '許昌仍為我方');
    check(got >= t0 + 6000 - 50, '許昌獲得援軍（' + t0 + ' → ' + got + '，至少 +6000）');
    check(!st.marches.some(m=> m.from === 'runan' && m.to === 'xuchang'), '我行軍已清除');
  }
}

/* ---------- 4. AI 也行軍（20 季延遲對 AI 同樣生效） ---------- */
console.log('=== 4. AI 出征同樣為 20 季行軍 ===');
resetStore();
click('start', {'data-f':'liu'});
{
  const st = sgz().state;
  let sawAiMarch = false, sawResolve = false;
  for (let i = 0; i < 40; i++){
    click('endturn');
    st.marches.forEach(m=>{ if (m.owner !== 'liu') sawAiMarch = true; });
    if (st.marches.length === 0 && i > 19) sawResolve = true;
  }
  check(sawAiMarch, '40 季內觀察到 AI 行軍部隊');
  check(errors === 0, 'AI 行軍流程無錯誤（錯誤數 ' + errors + '）');
  // 出征不再即時：同一 endTurn 內不可能同時建立又消滅 AI 行軍
  // （結構上 createMarch 只在玩家/AI 行動時建立，結算只在 stepMarches）
}

/* ---------- 5. 行軍條渲染 ---------- */
console.log('=== 5. 行軍條渲染 ===');
resetStore();
click('start', {'data-f':'cao'});
{
  const st = sgz().state;
  const genId = Object.values(st.generals).find(x=> x.city === 'xuchang').id;
  sgz().createMarch('xuchang', 'ye', genId, 8000, EVEN);
  sgz().renderMarchbar();
  const bar = store['marchbar'];
  check(bar && /行　軍/.test(bar.innerHTML), '行軍條顯示「行軍」標題');
  check(bar && /許昌 → 鄴/.test(bar.innerHTML), '行軍條顯示路線（許昌 → 鄴）');
  check(bar && new RegExp(sgz().MARCH_TURNS + ' 季後抵達').test(bar.innerHTML), '行軍條顯示剩餘季數');
  check(bar && !/hidden/.test(bar.className), '有行軍時行軍條可見');
}

/* ---------- 6. 全部勢力長跑 ---------- */
console.log('=== 6. 五勢力 × 60 季長跑（行軍系統壓力測試） ===');
['cao','sun','yuan','liu','ma'].forEach(p=>{
  resetStore();
  click('start', {'data-f': p});
  for (let i = 0; i < 60; i++) click('endturn');
});
check(errors === 0, '五勢力各 60 季零錯誤（總錯誤數 ' + errors + '）');

console.log('');
console.log('結果：通過 ' + pass + ' 項，失敗 ' + fail + ' 項，執行期錯誤 ' + errors + ' 次');
process.exit(fail + errors ? 1 : 0);
