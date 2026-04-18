import { renderHome, renderDetail, renderPokedex, renderBattle } from './ui.js'

function parseHash(hash){
  if(!hash || hash === '#/' || hash === '') return {route: 'home'}
  const clean = hash.replace('#','')
  const parts = clean.split('/')
  if(parts[1] === 'pokemon') return {route: 'detail', id: parts[2]}
  if(parts[1] === 'pokedex') return {route: 'pokedex'}
  if(parts[1] === 'battle') return {route: 'battle'}
  return {route: 'home'}
}

export function initRouter(){
  function onHash(){
    const h = window.location.hash
    const parsed = parseHash(h)
    const app = document.getElementById('app')
    app.innerHTML = ''
    if(parsed.route === 'home') renderHome(app)
    if(parsed.route === 'detail') renderDetail(app, parsed.id)
    if(parsed.route === 'pokedex') renderPokedex(app)
    if(parsed.route === 'battle') renderBattle(app)
  }
  window.addEventListener('hashchange', onHash)
  onHash()
}
