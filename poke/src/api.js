const API_BASE = 'https://pokeapi.co/api/v2'

export async function fetchPokemonList(limit = 151){
  const res = await fetch(`${API_BASE}/pokemon?limit=${limit}`)
  const data = await res.json()
  return data.results
}

export async function fetchPokemon(urlOrName){
  const url = typeof urlOrName === 'string' && urlOrName.startsWith('http') ? urlOrName : `${API_BASE}/pokemon/${urlOrName}`
  const res = await fetch(url)
  if(!res.ok) throw new Error('No se pudo obtener pokemon')
  return res.json()
}

export async function fetchSpecies(idOrName){
  const res = await fetch(`${API_BASE}/pokemon-species/${idOrName}`)
  return res.json()
}
