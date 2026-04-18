import { initRouter } from './router.js'
import { initStore } from './store.js'

async function bootstrap(){
  initStore()
  initRouter()
}

bootstrap()
