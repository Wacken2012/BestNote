import { describe, it, expect, nextTick } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useUserStore } from '@/store/user'
import vCanPiece from '@/directives/canPiece'

const TestComponent = {
  props: ['piece'],
  template: `<div v-can-piece="piece">Noten anzeigen</div>`
}

describe('v-can-piece directive', () => {
  it('shows element if user has access to piece', async () => {
    const pinia = createTestingPinia()
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
    userStore.$patch({ primaryRole: 'Admin' })

    await nextTick()
    expect(wrapper.element.style.display).not.toBe('none')
  })

  it('hides element if user lacks access to piece', async () => {
    const pinia = createTestingPinia()
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
    userStore.$patch({ primaryRole: 'Mitglied' }) // ohne passende Stimme

    await nextTick()
    expect(wrapper.element.style.display).toBe('none')
  })
})
