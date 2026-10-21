// 無頭煙霧測試：用 DOM stub 跑完整對局，抓執行期錯誤
const fs = require('fs');
const path = 'C:/Users/midas/WorkBuddy AI/三國誌/三國志·霸業.html';
const html = fs.readFileSync(path, 'utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const store = {};
function mkEl(id){
  const el = {
    id, textContent:'', innerHTML:'', value:'', scrollTop:0, scrollHeight:100,
    classList:{ _s:new Set(), add(c){this._s.add(c)}, remove(c){this._s.delete(c)},
                contains(c){return this._s.has(c)} },
    addEventListener(){}, appendChild(){}, querySelector(){return mkEl('q')},
    querySelectorAll(){return []},
    getAttribute(){return null}, setAttribute(){}
  };
  return el;
}
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
  const el = { getAttribute(k){ return k === 'data-act' ? act : (attrs && attrs[k] != null ? attrs[k] : null); } };
  try {
    global.__click({ target: { closest(){ return el; } } });
  } catch(e){
    errors++;
    console.log('!! 錯誤於 act=' + act + ' → ' + e.message);
    console.log(e.stack.split('\n').slice(0,4).join('\n'));
  }
}

const players = ['cao','sun','yuan','liu','ma'];
players.forEach(p=>{
  // 重置
  Object.keys(store).forEach(k=> delete store[k]);
  eval(code);
  errors = 0;
  click('start', {'data-f': p});
  let turns = 0;
  for (let i=0;i<80;i++){
    click('endturn');
    turns++;
    const over = store['modalRoot'] && /終　局/.test(store['modalRoot'].innerHTML || '');
    if (over) break;
  }
  const turn = store['cTurn'] ? store['cTurn'].textContent : '?';
  const cities = store['cCities'] ? store['cCities'].textContent : '?';
  const troops = store['cTroops'] ? store['cTroops'].textContent : '?';
  const gold = store['cGold'] ? store['cGold'].textContent : '?';
  const logLen = (store['logbar'] && store['logbar'].innerHTML || '').length;
  console.log(`玩家 ${p}: 跑 ${turns} 回合, 結束於第 ${turn} 季, 城 ${cities}, 兵 ${troops}, 金 ${gold}, 錯誤 ${errors}`);
});
