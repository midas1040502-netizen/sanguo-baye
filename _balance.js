// 戰鬥平衡驗算：複製遊戲內公式，跑蒙地卡羅
const rnd = (a,b)=> a + Math.random()*(b-a);
const rint = (a,b)=> Math.floor(a + Math.random()*(b-a+1));

function battle(aT0, aLead, aInt, dT0, dLead, dInt, cityDef){
  const dStart = dT0;
  let aT = aT0, dT = dT0;
  let aM = 1, dM = 1;
  if (Math.random() < 0.28){
    const as = aLead + rint(0,22), ds = dLead + rint(0,22);
    if (as > ds){ aM = 1.12; dM = 0.9; } else { aM = 0.9; dM = 1.12; }
  }
  if (aInt > dInt + 8 && Math.random() < 0.55){
    dT -= Math.round(dT * rnd(0.05,0.10));
  }
  const defBonus = 1 + cityDef/260;
  for (let r=1;r<=4 && aT>0 && dT>0;r++){
    const aPow = aT * (0.55 + aLead/220) * aM;
    const dPow = dT * (0.55 + dLead/220) * dM;
    const aLoss = Math.round(dPow * 0.15 * rnd(0.9,1.1));
    const dLoss = Math.round(aPow * 0.18 / defBonus * rnd(0.9,1.1));
    aT = Math.max(0, aT - aLoss);
    dT = Math.max(0, dT - dLoss);
  }
  let win;
  if (dT <= 0 || dT < dStart * 0.15) win = true;
  else if (aT <= 0) win = false;
  else win = false;
  return {win, aLeft: Math.round(aT), dLeft: Math.round(dT)};
}

function trial(label, aT, aL, aI, dT, dL, dI, cd, n=3000){
  let w=0, sumA=0;
  for (let i=0;i<n;i++){
    const r = battle(aT,aL,aI,dT,dL,dI,cd);
    if (r.win){ w++; sumA += r.aLeft; }
  }
  const rate = (w/n*100).toFixed(1);
  const avg = w? Math.round(sumA/w):0;
  console.log(
    label.padEnd(30),
    'ratio='+(aT/dT).toFixed(2),
    '勝率='+rate+'%',
    '勝時餘兵='+avg,
    '損耗='+(w? Math.round((1-avg/aT)*100)+'%':'-')
  );
}

console.log('=== 攻城：兵力倍數 vs 城防 ===');
trial('10000統97 vs 8000統85 防55', 10000,97,80, 8000,85,60, 55);
trial('12000統97 vs 8000統85 防55', 12000,97,80, 8000,85,60, 55);
trial('14000統97 vs 8000統85 防55', 14000,97,80, 8000,85,60, 55);
trial('16000統97 vs 8000統85 防55', 16000,97,80, 8000,85,60, 55);
console.log('');
trial('12000統82 vs 8000統88 防75', 12000,82,80, 8000,88,75, 75);
trial('15000統82 vs 8000統88 防75', 15000,82,80, 8000,88,75, 75);
trial('18000統82 vs 8000統88 防75', 18000,82,80, 8000,88,75, 75);
trial('21000統82 vs 8000統88 防75', 21000,82,80, 8000,88,75, 75);
console.log('');
trial('20000統82 vs 10000統88 防100', 20000,82,80, 10000,88,75, 100);
trial('24000統82 vs 10000統88 防100', 24000,82,80, 10000,88,75, 100);
console.log('');
console.log('=== 野戰（城防=0）===');
trial('10000統97 vs 10000統85 防0', 10000,97,80, 10000,85,60, 0);
trial('13000統97 vs 10000統85 防0', 13000,97,80, 10000,85,60, 0);
