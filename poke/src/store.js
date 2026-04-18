export const store = {
  pokemons: [],
  cache: new Map(),
  pokedex: new Set(),
}

export function initStore(){
  const raw = localStorage.getItem('pokedex')
  try{ if(raw) JSON.parse(raw).forEach(id=>store.pokedex.add(id)) }catch(e){}
}

export function savePokedex(){
  localStorage.setItem('pokedex', JSON.stringify(Array.from(store.pokedex)))
}

export function capture(id){
  store.pokedex.add(id)
  savePokedex()
}

export function release(id){
  store.pokedex.delete(id)
  savePokedex()
}
