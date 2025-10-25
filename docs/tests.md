# 🧪 Teststrategie für BestNote

Dieses Projekt verwendet [Vitest](https://vitest.dev/) und [Vue Test Utils](https://test-utils.vuejs.org/) für Unit- und Integrationstests.

## 📦 Struktur

- Testdateien liegen unter `tests/`
- Dateinamen: `*.test.ts`
- Direktiven-Tests: `tests/directives/`
- Services-Tests: `tests/services/`

## 🧩 Pinia-Test-Setup

Für Tests mit Pinia-Stores:

- Nutze `createTestingPinia()` aus `@pinia/testing`
- Stelle sicher, dass Directive und Test dieselbe Store-Instanz verwenden
- Ändere Store-Werte mit `$patch()` statt direkter Zuweisung

Beispiel:

```ts
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import { useUserStore } from '@/store/user'

const pinia = createTestingPinia()
setActivePinia(pinia)
const userStore = useUserStore()
userStore.$patch({ primaryRole: 'admin' })
```

## 🧪 Direktiven testen

- Nutze `shallowMount()` mit einer kleinen Testkomponente
- Verwende `nextTick()` und ggf. `setTimeout(0)` für reaktive DOM-Updates
- Prüfe Sichtbarkeit über `el.style.display` ('' oder 'none') statt `isVisible()`

Beispiel-Assertion:

```ts
expect(button.style.display).toBe('none')
```

## 🧪 Tests ausführen

```bash
npm run test
```

## 📊 Coverage erzeugen

```bash
npm run test -- --coverage
```

Ergebnis: `coverage/index.html` im Browser öffnen

## 🛠 Erweiterungen

- Snapshot-Tests mit `toMatchSnapshot()`
- Integrationstests mit echten Komponenten
- Teststrategie für die Rollenmatrix (`src/services/PermissionService.ts`)
