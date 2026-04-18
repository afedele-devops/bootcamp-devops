function sumStats(p){
  return p.stats.reduce((s,x)=>s+x.base_stat,0)
}

export function battleSimulation(a, b){
  // keep legacy synchronous log builder
  const hpA = sumStats(a)
  const hpB = sumStats(b)
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

export async function animateBattle(player, rival, container){
  const hpPlayer = sumStats(player)
  const hpRival = sumStats(rival)
  let state = {
    player: {hp: hpPlayer, max: hpPlayer},
    rival: {hp: hpRival, max: hpRival}
  }

  container.innerHTML = `
    <div class="battle-stage flex flex-col md:flex-row gap-6 items-stretch">
      <div class="poke-card card p-4 flex-1 text-center" id="card-player">
        <img src="${player.sprites.other['official-artwork'].front_default}" class="mx-auto w-40 h-40 object-contain" />
        <div class="font-bold mt-2">#${player.id} ${player.name}</div>
        <div class="hp mt-3 w-full bg-slate-200 h-3 rounded overflow-hidden"><div id="hp-player" class="hp-fill h-3 bg-emerald-500" style="width:100%"></div></div>
      </div>
      <div class="flex-1 flex flex-col justify-center items-center">
        <div id="battle-log" class="text-sm mb-3 max-h-40 overflow-auto w-full"></div>
        <div class="text-center text-xs text-slate-400">Turnos en vivo</div>
      </div>
      <div class="poke-card card p-4 flex-1 text-center" id="card-rival">
        <img src="${rival.sprites.other['official-artwork'].front_default}" class="mx-auto w-40 h-40 object-contain" />
        <div class="font-bold mt-2">#${rival.id} ${rival.name}</div>
        <div class="hp mt-3 w-full bg-slate-200 h-3 rounded overflow-hidden"><div id="hp-rival" class="hp-fill h-3 bg-red-500" style="width:100%"></div></div>
      </div>
    </div>
  `

  const logEl = container.querySelector('#battle-log')
  const cardPlayer = container.querySelector('#card-player')
  const cardRival = container.querySelector('#card-rival')
  const hpPlayerEl = container.querySelector('#hp-player')
  const hpRivalEl = container.querySelector('#hp-rival')

  function pushLog(text){
    const d = document.createElement('div')
    d.textContent = text
    logEl.appendChild(d)
    logEl.scrollTop = logEl.scrollHeight
  }

  function sleep(ms){ return new Promise(r=>setTimeout(r, ms)) }

  let turn = 0
  while(state.player.hp>0 && state.rival.hp>0){
    const attacker = (turn%2===0)?'player':'rival'
    const defender = attacker==='player' ? 'rival' : 'player'
    const atkCard = attacker==='player' ? cardPlayer : cardRival
    const defCard = defender==='player' ? cardPlayer : cardRival
    // animate attacker lean
    atkCard.classList.add('attacking')
    // play attack sound if enabled
    try{ if(localStorage.getItem('sound') !== '0') playAttackSound(attacker==='player'?player:rival) }catch(e){}
    pushLog(`${attacker === 'player' ? player.name : rival.name} ataca!`)
    await sleep(450)
    defCard.classList.add('shake')
    // damage
    const dmg = Math.max(5, Math.floor(Math.random()*20))
    state[defender].hp = Math.max(0, state[defender].hp - dmg)
    const pct = Math.round((state[defender].hp / state[defender].max) * 100)
    if(defender==='player') hpPlayerEl.style.width = pct + '%'
    else hpRivalEl.style.width = pct + '%'
    // play hit sound
    try{ if(localStorage.getItem('sound') !== '0') playHitSound(defender==='player'?player:rival) }catch(e){}
    pushLog(`${attacker === 'player' ? player.name : rival.name} hace ${dmg} daño`)
    await sleep(600)
    defCard.classList.remove('shake')
    atkCard.classList.remove('attacking')
    await sleep(250)
    turn++
  }

  const winner = state.player.hp>0 ? player.name : rival.name
  pushLog(`Ganador: ${winner}`)
  return winner
}

// Simple WebAudio effects (procedural): map pokemon id to frequency and waveform
let _audioCtx = null
function ensureAudioCtx(){ if(!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)() }

function playTone(freq, type='sine', dur=0.25, vol=0.12){
  ensureAudioCtx()
  const ctx = _audioCtx
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.value = vol
  o.connect(g); g.connect(ctx.destination)
  const now = ctx.currentTime
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(vol, now + 0.01)
  o.start(now)
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  o.stop(now + dur + 0.02)
}

function playAttackSound(poke){
  try{
    const base = 220 + (poke.id % 100)
    const typeIdx = poke.types && poke.types[0] ? poke.types[0].type.name.length % 4 : 0
    const wave = ['sine','square','sawtooth','triangle'][typeIdx]
    playTone(base, wave, 0.18, 0.14)
    // small arpeggio
    setTimeout(()=>playTone(base*1.25, wave, 0.12, 0.09), 90)
  }catch(e){}
}

function playHitSound(poke){
  try{
    const base = 120 + (poke.id % 80)
    playTone(base, 'triangle', 0.12, 0.14)
  }catch(e){}
}

