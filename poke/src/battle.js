export function battleSimulation(a, b){
  // simple deterministic-ish simulation using HP as sum of stats
  const hpA = a.stats.reduce((s,x)=>s+x.base_stat,0)
  const hpB = b.stats.reduce((s,x)=>s+x.base_stat,0)
  let log = []
  let A = {name: a.name, hp: hpA}
  let B = {name: b.name, hp: hpB}
  let turn = 0
  while(A.hp>0 && B.hp>0 && log.length<20){
    const attacker = (turn%2===0)?A:B
    const defender = (turn%2===0)?B:A
    const dmg = Math.max(5, Math.floor(Math.random()*20))
    defender.hp -= dmg
    log.push(`${attacker.name} hace ${dmg} daño a ${defender.name} (hp ${Math.max(0,defender.hp)})`)
    turn++
  }
  const winner = A.hp>0?A:B
  return `<div class="p-4"><h3 class="font-bold">${a.name} vs ${b.name}</h3><div class="mt-2">${log.map(l=>`<div class="text-sm">${l}</div>`).join('')}<div class="mt-4 font-semibold">Ganador: ${winner.name}</div></div></div>`
}
