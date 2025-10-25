import { describe, it, expect, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

import canUpload from '../../src/directives/canUpload'
import { useUserStore } from '../../src/store/user'

describe('v-can-upload directive', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  describe('basic visibility and reactivity', () => {
    it('shows button for Notenwart and hides for Mitglied and reacts to changes', async () => {
      const userStore = useUserStore()

      // start as Notenwart
      userStore.$patch({ roles: ['notenwart'] })

      const TestComp = defineComponent({
        template: `<button v-can-upload>Upload</button>`
      })

      const wrapper = shallowMount(TestComp, {
        global: {
          plugins: [pinia],
          directives: { 'can-upload': canUpload }
        }
      })

  const btn = wrapper.find('button')
  expect(btn.exists()).toBe(true)
  // wait for any microtasks and macrotasks (directive uses setTimeout)
  await nextTick()
  await new Promise((r) => setTimeout(r, 0))
  // the directive updates inline style.display to '' or 'none'
  expect((btn.element as HTMLElement).style.display).toBe('')

      // change to Mitglied
  userStore.$patch({ roles: ['mitglied'] })
  await nextTick()
  await new Promise((r) => setTimeout(r, 0))
  expect(userStore.primaryRole).toBe('mitglied')
  expect((btn.element as HTMLElement).style.display).toBe('none')

      // change back to Notenwart
  userStore.$patch({ roles: ['notenwart'] })
  await nextTick()
  await new Promise((r) => setTimeout(r, 0))
  expect((btn.element as HTMLElement).style.display).toBe('')
    })
  })

  describe('additional role checks', () => {
    it('correctly hides/shows for kassierer/vorstand/admin combinations', async () => {
      const userStore = useUserStore()

      const TestComp = defineComponent({
        template: `<button v-can-upload>Upload</button>`
      })

      const wrapper = shallowMount(TestComp, {
        global: {
          plugins: [pinia],
          directives: { 'can-upload': canUpload }
        }
      })

      const btn = wrapper.find('button')
  expect(btn.exists()).toBe(true)

      // Kassierer without isMusician -> should not be visible
  userStore.$patch({ roles: ['kassierer'] })
  // ensure isMusician is not set (falsey)
  userStore.$patch({ /* no isMusician */ })
  await nextTick()
  await new Promise((r) => setTimeout(r, 0))
  expect(userStore.primaryRole).toBe('kassierer')
  expect((btn.element as HTMLElement).style.display).toBe('none')

      // Vorstand -> should not be visible (only notenwart/admin allowed)
  userStore.$patch({ roles: ['vorstand'] })
  await nextTick()
  await new Promise((r) => setTimeout(r, 0))
  expect(userStore.primaryRole).toBe('vorstand')
  expect((btn.element as HTMLElement).style.display).toBe('none')

      // Admin -> should be visible
  userStore.$patch({ roles: ['admin'] })
  await nextTick()
  await new Promise((r) => setTimeout(r, 0))
  expect(userStore.primaryRole).toBe('admin')
  expect((btn.element as HTMLElement).style.display).toBe('')
    })
  })
})
