import { ref } from 'vue'

export function useA11y() {
  const announce = (msg: string, role: 'polite' | 'assertive' = 'polite') => {
    let el = document.getElementById('a11y-live') as HTMLElement | null
    if (!el) {
      el = document.createElement('div')
      el.id = 'a11y-live'
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      el.setAttribute('role', 'status')
      document.body.appendChild(el)
    }
    el.setAttribute('aria-live', role)
    el.textContent = msg
  }

  function focusFirst(selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') {
    const el = document.querySelector(selector) as HTMLElement | null
    if (el) el.focus()
  }

  return { announce, focusFirst }
}
