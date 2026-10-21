/* _save.js — 驗證新開／儲存／載入遊戲 */
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
/* localStorage 樁 */
const lsData = {};
global.localStorage = {
  getItem(k){ return lsData[k] == null ? null : lsData[k]; },
  setItem(k, v){ lsData[k] = String(v); },
  removeItem(k){ delete lsData[k]; }
};
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

console.log('=== 1. 初始狀態 ===');
check(sgz.hasSave() === false, '尚無存檔');
check(sgz.saveInfo() === null, '無存檔資訊');
check(store['loadSaveBtn'].style.display === 'none', '開始畫面「載入存檔」按鈕隱藏');

console.log('=== 2. 開局並推進 ===');
click('start', {'data-f':'cao'});
const st1 = sgz.state;
check(st1.player === 'cao', '選擇曹操開局');
click('endturn'); click('endturn'); click('endturn');
const turn1 = st1.turn;
const gold1 = st1.treasury.cao.gold;
check(turn1 === 4, '推進到第 ' + turn1 + ' 季');

console.log('=== 3. 儲存遊戲 ===');
click('savegame');
check(sgz.hasSave() === true, 'localStorage 已有存檔');
const info = sgz.saveInfo();
check(info && info.turn === turn1 && info.faction === sgz.FACTIONS.cao.name,
      '存檔摘要：第 ' + (info && info.turn) + ' 季 · ' + (info && info.faction));
check(store['loadSaveBtn'].style.display !== 'none', '開始畫面「載入存檔」按鈕顯示');
check(store['loadSaveBtn'].textContent.indexOf('第 ' + turn1 + ' 季') >= 0, '按鈕文字：' + store['loadSaveBtn'].textContent);

console.log('=== 4. 新開遊戲（放棄對局）===');
click('newgame');
check(store['modalRoot'].innerHTML.indexOf('新開遊戲') >= 0, '彈出確認視窗');
click('confirmnewgame');
check(sgz.state === null, '對局已清空');
check(store['startScreen'].classList.contains('hidden') === false, '回到開始畫面');
check(store['game'].classList.contains('hidden') === true, '遊戲畫面隱藏');

console.log('=== 5. 載入遊戲 ===');
click('loadstart');
const st2 = sgz.state;
check(st2 && st2.player === 'cao', '載入後勢力為曹操');
check(st2.turn === turn1, '回合數還原（' + st2.turn + '）');
check(Math.abs(st2.treasury.cao.gold - gold1) < 2, '金庫還原（' + Math.round(st2.treasury.cao.gold) + '）');
check(Object.keys(st2.cities).length === 24, '24 城還原');
check(Object.keys(st2.generals).length === Object.keys(st1.generals).length,
      Object.keys(st2.generals).length + ' 將還原');
check(store['game'].classList.contains('hidden') === false, '進入遊戲畫面');

console.log('=== 6. 載入後可繼續玩 ===');
click('endturn');
check(sgz.state.turn === turn1 + 1, '載入後可結束回合（→ 第 ' + sgz.state.turn + ' 季）');

console.log('=== 7. 行軍中的存檔／載入 ===');
const genId = Object.values(st2.generals).find(g=> g.city === 'xuchang').id;
sgz.createMarch('xuchang', 'ye', genId, 6000, {cav:.25, bow:.25, swd:.25, shd:.25});
const mid = st2.marches[st2.marches.length - 1].id;
click('savegame');
click('endturn');                       // 推進一季
click('loadstart');                     // 載入回行軍建立時
const m = sgz.state.marches.find(x=> x.id === mid);
check(m && m.eta === 5, '行軍狀態還原（eta = ' + (m && m.eta) + '）');
check(m && m.disp >= 0 && m.disp <= 1, '行軍顯示進度有值（' + (m && m.disp) + '）');

console.log('=== 8. 存檔損毀時的保護 ===');
lsData[sgz.SAVE_KEY] = '{broken json';
click('loadgame');
check(sgz.state !== null, '存檔損毀不致當機，保留原對局');
lsData[sgz.SAVE_KEY] = JSON.stringify({v:1, ts:Date.now(), state:{}});
click('loadgame');
check(sgz.state !== null, '缺欄位的存檔被拒絕');

console.log('');
console.log('總錯誤數：' + errors);
process.exit(errors ? 1 : 0);
