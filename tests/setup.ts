import { vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Aktiviere eine echte Pinia-Instanz für Tests (ohne @pinia/testing)
const pinia = createPinia()
setActivePinia(pinia)

// Optional: globale Mocks
vi.stubGlobal('console', console)
