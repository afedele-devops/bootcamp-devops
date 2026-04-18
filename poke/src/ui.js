import { fetchPokemonList, fetchPokemon } from './api.js'
import { store, capture, release } from './store.js'
import { battleSimulation } from './battle.js'

const TYPE_COLORS = {
  grass: 'bg-green-400', fire: 'bg-red-400', water: 'bg-blue-400', electric: 'bg-amber-300',
  rock: 'bg-amber-700', ground: 'bg-yellow-600', psychic: 'bg-pink-400', fighting: 'bg-rose-600',
  bug: 'bg-lime-400', ghost: 'bg-violet-700', ice: 'bg-cyan-200', dragon: 'bg-sky-800',
}

function topbar(){
  return `
  <header class="p-4 flex items-center justify-between bg-white/60 dark:bg-slate-800/60 sticky top-0 backdrop-blur z-10">
    <div class="flex items-center gap-4">
      <a href="#/" class="text-2xl font-bold">Poké Battle</a>
      <input id="search" placeholder="Buscar por nombre" class="px-3 py-1 border rounded shadow-sm" />
      <select id="filter" class="px-2 py-1 border rounded">
        <option value="">Todos los tipos</option>
      </select>
    </div>
    <div class="flex items-center gap-3">
      <a href="#/pokedex" class="btn">Mi Pokédex</a>
      <a href="#/battle" class="btn">Batalla</a>
      <button id="themeToggle" class="px-3 py-1 border rounded">Modo</button>
    </div>
  </header>`
}

export async function renderHome(container){
  container.innerHTML = topbar() + `<main class="p-4"><div id="list" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div></main>`
  const listEl = document.getElementById('list')
  listEl.innerHTML = skeletonGrid(12)
  const pokes = await fetchPokemonList(151)
  store.pokemons = pokes
  populateFilter(pokes)
  renderList(pokes, listEl)
  bindSearch()
  bindThemeToggle()
}

function skeletonGrid(n){
  return Array.from({length:n}).map(()=>`<div class="animate-pulse p-4 bg-white/60 rounded shadow h-36"></div>`).join('\n')
}

function populateFilter(pokes){
  // build unique types by fetching each detail lazily (simple approach)
  const sel = document.getElementById('filter')
  const types = new Set()
  pokes.forEach(async p=>{
    try{ const d = await fetch(p.url); d.types.forEach(t=>types.add(t.type.name)) }catch(e){}
    sel.innerHTML = `<option value="">Todos los tipos</option>` + Array.from(types).map(t=>`<option value="${t}">${t}</option>`).join('')
  })
  sel.addEventListener('change', ()=>applyFilters())
}

function bindSearch(){
  const s = document.getElementById('search')
  s.addEventListener('input', ()=>applyFilters())
}

function applyFilters(){
  const q = document.getElementById('search').value.toLowerCase()
  const type = document.getElementById('filter').value
  const filtered = store.pokemons.filter(p=>p.name.includes(q))
  const listEl = document.getElementById('list')
  renderList(filtered, listEl, type)
}

async function renderList(items, el, typeFilter){
  const html = (await Promise.all(items.map(async p=>{
    try{
      const d = await fetch(p.url).then(r=>r.json())
      const types = d.types.map(t=>`<span class="px-2 py-1 rounded text-sm ${TYPE_COLORS[t.type.name]||'bg-slate-300'}">${t.type.name}</span>`).join(' ')
      if(typeFilter && !d.types.some(t=>t.type.name===typeFilter)) return ''
      return `
      <a href="#/pokemon/${d.id}" class="block p-4 bg-white rounded shadow hover:scale-105 transform transition">
        <div class="flex items-center gap-4">
          <img loading="lazy" src="${d.sprites.other['official-artwork'].front_default}" alt="${d.name}" class="w-20 h-20 object-contain" />
          <div>
            <div class="font-bold text-lg">#${d.id} ${d.name}</div>
            <div class="mt-2">${types}</div>
          </div>
        </div>
      </a>`
    }catch(e){ return '' }
  }))).join('')
  el.innerHTML = html || '<div class="p-4">No hay resultados</div>'
}

export async function renderDetail(container, id){
  container.innerHTML = topbar() + `<main class="p-6"><div id="detail" class="max-w-3xl mx-auto"></div></main>`
  const dEl = document.getElementById('detail')
  dEl.innerHTML = `<div class="animate-pulse h-64 bg-white/60 rounded"></div>`
  try{
    const p = await fetchPokemon(id)
    const types = p.types.map(t=>`<span class="px-3 py-1 rounded text-sm ${TYPE_COLORS[t.type.name]||'bg-slate-300'}">${t.type.name}</span>`).join(' ')
    const stats = p.stats.map(s=>`<div class="mb-2"><div class="flex justify-between text-sm"><span>${s.stat.name}</span><span>${s.base_stat}</span></div><div class="w-full bg-slate-200 h-2 rounded"><div style="width:${Math.min(100, s.base_stat)}%" class="h-2 bg-indigo-500 rounded"></div></div></div>`).join('')
    const abilities = p.abilities.map(a=>a.ability.name).join(', ')
    const captured = store.pokedex.has(p.id)
    dEl.innerHTML = `
      <div class="bg-white p-6 rounded shadow flex flex-col md:flex-row gap-6">
        <img src="${p.sprites.other['official-artwork'].front_default}" class="w-48 h-48 mx-auto" />
        <div class="flex-1">
          <h2 class="text-2xl font-bold">#${p.id} ${p.name}</h2>
          <div class="mt-2">${types}</div>
          <div class="mt-4"><h3 class="font-semibold">Stats</h3>${stats}</div>
          <div class="mt-2"><strong>Habilidades:</strong> ${abilities}</div>
          <div class="mt-4">
            <button id="captureBtn" class="px-4 py-2 bg-emerald-500 text-white rounded">${captured? 'Liberar' : 'Capturar'}</button>
            <a href="#/battle" class="ml-3 px-4 py-2 border rounded">Retar</a>
          </div>
        </div>
      </div>`
    document.getElementById('captureBtn').addEventListener('click', ()=>{
      if(store.pokedex.has(p.id)){ release(p.id); document.getElementById('captureBtn').textContent='Capturar' }
      else { capture(p.id); document.getElementById('captureBtn').textContent='Liberar' }
    })
  }catch(e){ dEl.innerHTML = '<div class="p-4">Error al cargar</div>' }
  bindThemeToggle()
}

export async function renderPokedex(container){
  container.innerHTML = topbar() + `<main class="p-4"><h2 class="text-xl font-bold mb-4">Mi Pokédex</h2><div id="pokedexGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div></main>`
  const g = document.getElementById('pokedexGrid')
  const ids = Array.from(store.pokedex)
  if(ids.length===0) { g.innerHTML = '<div>No has capturado Pokémon aun.</div>'; return }
  g.innerHTML = ids.map(id=>`<div class="p-3 bg-white rounded shadow flex items-center justify-between"><a href="#/pokemon/${id}">#${id}</a><button data-id="${id}" class="text-red-500">Eliminar</button></div>`).join('')
  g.querySelectorAll('button').forEach(b=>b.addEventListener('click', e=>{ release(Number(e.target.dataset.id)); renderPokedex(container) }))
  bindThemeToggle()
}

export function renderBattle(container){
  container.innerHTML = topbar() + `
    <main class="p-4 max-w-3xl mx-auto">
      <h2 class="text-xl font-bold mb-4">Modo Batalla</h2>
      <div id="battleArea" class="bg-white p-4 rounded shadow min-h-[300px]"></div>
    </main>`
  const area = document.getElementById('battleArea')
  area.innerHTML = `<div class="mb-4">Selecciona tu Pokémon:</div><div id="sel" class="grid grid-cols-3 gap-2"></div>`
  // show captured pokes first, fallback to first 6
  const ids = Array.from(store.pokedex).slice(0,6)
  const toShow = ids.length? ids : [1,4,7,25,39,133]
  toShow.forEach(async id=>{
    try{ const p = await fetchPokemon(id)
      const btn = document.createElement('button')
      btn.className = 'p-2 bg-slate-100 rounded flex items-center gap-2'
      btn.innerHTML = `<img src="${p.sprites.front_default}" class="w-10"/><span>#${p.id} ${p.name}</span>`
      btn.addEventListener('click', ()=>startBattle(p, area))
      document.getElementById('sel').appendChild(btn)
    }catch(e){}
  })
  bindThemeToggle()
}

async function startBattle(playerPoke, area){
  area.innerHTML = `<div class="p-4">Buscando rival...</div>`
  const rivalId = Math.floor(Math.random()*150)+1
  const rival = await fetchPokemon(rivalId)
  area.innerHTML = battleSimulation(playerPoke, rival)
}

function bindThemeToggle(){
  const btn = document.getElementById('themeToggle')
  if(!btn) return
  const dark = localStorage.getItem('dark') === '1'
  setDark(dark)
  btn.addEventListener('click', ()=>{ setDark(!(document.documentElement.classList.contains('dark'))) })
}

function setDark(v){
  if(v){ document.documentElement.classList.add('dark'); document.body.classList.add('bg-slate-900','text-slate-100'); localStorage.setItem('dark','1') }
  else{ document.documentElement.classList.remove('dark'); document.body.classList.remove('bg-slate-900','text-slate-100'); localStorage.setItem('dark','0') }
}
