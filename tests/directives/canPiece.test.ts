import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { useUserStore } from '../../src/store/user'
import vCanPiece from '../../src/directives/canPiece'

const TestComponent = {
  props: ['piece'],
  template: `<div v-can-piece="piece">Noten anzeigen</div>`
}

describe('v-can-piece directive', () => {
  it('shows element if user has access to piece', async () => {
  const pinia = createPinia()
    const wrapper = shallowMount(TestComponent, {
      props: {
        piece: { id: 1, voice: 'Tenor' }
      },
      global: {
        plugins: [pinia],
        directives: { 'can-piece': vCanPiece }
      }
    })

    const userStore = useUserStore()
  userStore.$patch({ roles: ['admin'] })

    await nextTick()
    expect(wrapper.element.style.display).not.toBe('none')
  })

  it('hides element if user lacks access to piece', async () => {
  const pinia = createPinia()
    const wrapper = shallowMount(TestComponent, {
      props: {
        piece: { id: 1, voice: 'Tenor' }
      },
      global: {
        plugins: [pinia],
        directives: { 'can-piece': vCanPiece }
      }
    })

    const userStore = useUserStore()
  userStore.$patch({ roles: ['mitglied'] }) // ohne passende Stimme

    await nextTick()
    expect(wrapper.element.style.display).toBe('none')
  })
})
