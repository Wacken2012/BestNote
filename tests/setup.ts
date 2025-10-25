import { vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Aktiviere Pinia für alle Tests
const pinia = createPinia()
setActivePinia(pinia)

// Beispiel: globale Mocks (optional)
vi.stubGlobal('console', console)
