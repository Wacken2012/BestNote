import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useUserStore } from '../../src/store/user'
import vCanCalendar from '../../src/directives/canCalendar'

const TestComponent = {
  template: `<div v-can-calendar>Kalender</div>`
}

describe('v-can-calendar directive', () => {
  it('shows element for allowed roles', async () => {
    const pinia = createTestingPinia()
    const wrapper = shallowMount(TestComponent, {
      global: { plugins: [pinia], directives: { 'can-calendar': vCanCalendar } }
    })

    const userStore = useUserStore()
    userStore.$patch({ roles: ['vorstand'] })

    await nextTick()
    expect(wrapper.element.style.display).not.toBe('none')
  })

  it('hides element for disallowed roles', async () => {
    const pinia = createTestingPinia()
    const wrapper = shallowMount(TestComponent, {
      global: { plugins: [pinia], directives: { 'can-calendar': vCanCalendar } }
    })

  const userStore = useUserStore()
  // simulate an unknown/disallowed role at runtime
  userStore.$patch({ roles: ['gast' as any] })

    await nextTick()
    expect(wrapper.element.style.display).toBe('none')
  })
})
