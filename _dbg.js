const fs = require('fs');
const html = fs.readFileSync('三國志·霸業.html','utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const store={};
function mkEl(id){return {id,textContent:'',innerHTML:'',value:'',scrollTop:0,scrollHeight:100,
 classList:{_s:new Set(),add(c){this._s.add(c)},remove(c){this._s.delete(c)},contains(c){return this._s.has(c)}},
 addEventListener(){},appendChild(){},querySelector(){return mkEl('q')},querySelectorAll(){return[]},
 getAttribute(){return null},setAttribute(){}};}
global.document={getElementById(id){return store[id]||(store[id]=mkEl(id))},querySelector(){return mkEl('q')},
 querySelectorAll(){return[]},addEventListener(t,fn){if(t==='click')global.__click=fn},createElement(){return mkEl('c')}};
global.window=global; global.location={reload(){}};
eval(code);
function click(act,attrs){const el={getAttribute(k){return k==='data-act'?act:(attrs&&attrs[k]!=null?attrs[k]:null)}};
 global.__click({target:{closest(){return el}}});}
click('start',{'data-f':'cao'});
const S=()=>window.SGZ.state;
for(let t=0;t<6;t++){
  const st=S();
  const mine=Object.keys(st.cities).filter(id=>st.cities[id].owner==='cao');
  console.log('季',st.turn,'金',Math.round(st.treasury.cao.gold),'城',mine.map(id=>id+':'+st.cities[id].troops).join(' '));
  // 嘗試一次攻擊
  const id='xuchang'; const c=st.cities[id];
  click('pick',{'data-id':id});
  click('attack');
  console.log('   modal keys:', Object.keys(store).filter(k=>/atk/.test(k)));
  if(store['atkTarget']){
    store['atkTarget'].value='chenliu';
    store['atkGen'].value='caocao';
    store['atkTroops'].value=String(c.troops-800);
    try{ click('confirmattack',{'data-from':id}); console.log('   attack fired'); }
    catch(e){ console.log('   ERR',e.message); }
  }
  console.log('   chenliu owner=',st.cities.chenliu.owner,'troops=',st.cities.chenliu.troops);
  click('endturn');
}
