import { vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'

// Aktiviere eine testbare Pinia-Instanz
const pinia = createTestingPinia()
setActivePinia(pinia)

// Optional: globale Mocks
vi.stubGlobal('console', console)
