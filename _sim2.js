// 無頭功能測試：三難度、自建勢力、資源上限 1000、外族結盟
const fs = require('fs');
const path = 'C:/Users/midas/WorkBuddy AI/三國誌/三國志·霸業.html';
const html = fs.readFileSync(path, 'utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];

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

console.log('=== 1. 三種難度 × 五勢力（各 40 季） ===');
['easy','normal','hard'].forEach(d=>{
  ['cao','sun','yuan','liu','ma'].forEach(p=>{
    resetStore();
    click('diff', {'data-d': d});
    click('start', {'data-f': p});
    for (let i = 0; i < 40; i++) click('endturn');
  });
  console.log('  難度 ' + d + ' 完成，錯誤數：' + errors);
});

console.log('=== 2. 自建勢力（困難） ===');
resetStore();
click('diff', {'data-d': 'hard'});
click('opencustom');
global.document.getElementById('cfName').value = '大魏';
global.document.getElementById('cfLord').value = '曹孟德';
global.document.getElementById('cfCity').value = 'luoyang';
global.document.getElementById('cfBase').value = 'cao';
click('confirmcustom');
const sgz2 = global.SGZ;
const stCustom = sgz2.state;
console.log('  國號：' + sgz2.FACTIONS[stCustom.player].name +
            '　起始城：' + sgz2.CITY_BY_ID.luoyang.name + '（' + sgz2.CITY_BY_ID.luoyang.region + '）' +
            '　洛陽歸屬：' + sgz2.FACTIONS[stCustom.cities.luoyang.owner].name +
            '　我城數：' + Object.keys(stCustom.cities).filter(k=> stCustom.cities[k].owner === stCustom.player).length +
            '　武將數：' + Object.values(stCustom.generals).filter(g=> g.f === stCustom.player).length);
for (let i = 0; i < 40; i++) click('endturn');
console.log('  自建勢力跑 40 季完成，錯誤數：' + errors);

console.log('=== 3. 資源上限 1000（新開局） ===');
resetStore();
click('start', {'data-f': 'cao'});
const st3 = global.SGZ.state;
st3.treasury[st3.player].gold = 5000;
st3.treasury[st3.player].food = 8000;
click('endturn');
const t3 = st3.treasury[st3.player];
console.log('  對局結束：' + st3.over + '　金 ' + Math.round(t3.gold) + '／' + 1000 +
            '　糧 ' + Math.round(t3.food) + '／' + 1000 +
            ' → ' + (t3.gold <= 1000 && t3.food <= 1000 ? '上限生效 ✔' : '上限失敗 ✘'));

console.log('=== 4. 外族結盟與貢品（新開局） ===');
resetStore();
click('start', {'data-f': 'cao'});
const sgz = global.SGZ;
const st = sgz.state;
click('tab', {'data-tab':'diplo'});
Object.keys(st.tribes).forEach(k=>{ st.tribes[k].rel = 100; });
st.treasury[st.player].gold = 1000;
click('tribeally', {'data-t':'qiang'});
console.log('  羌同盟：' + st.tribes.qiang.ally + '（普通上限 2）');
click('tribeally', {'data-t':'nanman'});
console.log('  南蠻同盟：' + st.tribes.nanman.ally);
click('tribeally', {'data-t':'wuhuan'});
console.log('  第三支（應被上限擋下）：' + st.tribes.wuhuan.ally);
click('endturn');
console.log('  羌貢品進帳後金 ' + Math.round(st.treasury[st.player].gold));

console.log('=== 5. 出征（含烏桓協同） ===');
st.tribes.wuhuan.ally = true;
const myCity = Object.keys(st.cities).find(k=> st.cities[k].owner === st.player);
if (!myCity){ console.log('  無我方城池，跳過'); }
else {
  st.cities[myCity].troops = 30000;
  const enemy = sgz.CITY_BY_ID[myCity].adj.find(id=> st.cities[id].owner !== st.player);
  if (!enemy) console.log('  無相鄰敵城，跳過');
  else {
    st.cities[enemy].troops = 5000;
    try {
      const res = sgz.resolveBattle(myCity, enemy, 'caocao', 20000,
        {cav:0.25, bow:0.25, swd:0.25, shd:0.25});
      const hasWuhuan = res.lines.some(l=> /烏桓/.test(l.t));
      console.log('  結算完成，烏桓協同行出現：' + hasWuhuan +
                  '　結果：' + (res.win ? '城破' : '未克'));
    } catch(e){ errors++; console.log('!! resolveBattle 錯誤 → ' + e.message); }
  }
}

console.log('');
console.log('總錯誤數：' + errors);
