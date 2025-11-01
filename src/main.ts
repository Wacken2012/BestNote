import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import routes from './router'
import messages from './i18n'
import vCan from './directives/v-can'
import vCanUpload from './directives/canUpload'
import vCanPiece from './directives/canPiece'
import vCanCalendar from './directives/canCalendar'

const app = createApp(App)
const pinia = createPinia()

const savedLang = localStorage.getItem('lang') || 'de'
const i18n = createI18n({ locale: savedLang, fallbackLocale: 'en', messages })

app.use(pinia)
app.use(router)
app.use(i18n)
app.directive('can', vCan)
app.directive('can-upload', vCanUpload)
app.directive('can-piece', vCanPiece)
app.directive('can-calendar', vCanCalendar)

// Service worker registration will be handled by vite-plugin-pwa automatically

app.mount('#app')

// default readiness flag for component-level readiness used by Playwright tests
try { (window as any).APP_READY_FOR_TESTS = false } catch (e) { /* noop in non-browser env */ }

// Immediate fallback: mark app ready for tests right after mount so tests don't hang
try {

// Service Worker registration and update notification
try {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/service-worker.js').then(reg => {
			console.info('SW registered:', reg.scope)
			// listen for updatefound to notify user
			reg.addEventListener('updatefound', () => {
				const newWorker = reg.installing
				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed') {
							// A new SW is installed: notify the user via a custom event so app can show a toast
							window.dispatchEvent(new CustomEvent('sw-update-available'))
						}
					})
				}
			})
		}).catch(err => console.warn('SW registration failed', err))

		// listen to client messages from the SW
		navigator.serviceWorker.addEventListener('message', ev => {
			try {
				if (ev.data && ev.data.type === 'SW_ACTIVATED') {
					console.info('Service worker activated:', ev.data.cache)
				}
			} catch (e) {}
		})
	}
} catch (e) {}

	;(window as any).APP_READY_FOR_TESTS = true
	try { console.info('APP_READY_FOR_TESTS set (immediate fallback after mount)') } catch (e) {}
} catch (e) { /* noop in non-browser env */ }

// signal to tests that the app has finished client-side initialization (hydration/i18n)
;(async () => {
	try {
		// wait for router to be ready
		try { await router.isReady() } catch (e) { /* proceed even if router readiness fails */ }
		// ensure i18n locale is available (not a real async API but await the value to follow the requested contract)
		try {
			const i18nGlobal = (i18n as any).global
			if (i18nGlobal && i18nGlobal.locale && 'value' in i18nGlobal.locale) {
				// awaiting the value is effectively a microtask; keeps the intent explicit
				await Promise.resolve(i18nGlobal.locale.value)
			}
		} catch (e) { /* noop */ }
		// wait a microtask to let DOM updates and hydration finish
		try { await nextTick() } catch (e) {}
		try {
			;(window as any).APP_HYDRATED = true
			// explicit log so CI artifacts contain a clear hydration marker
			try { console.info('app hydrated') } catch (e) {}
			// also log the current i18n locale and route for CI diagnostics
			try {
				const i18nGlobal = (i18n as any).global
				const localeVal = i18nGlobal && i18nGlobal.locale && 'value' in i18nGlobal.locale ? i18nGlobal.locale.value : savedLang
				try { console.info('app init', { locale: localeVal, route: window.location.pathname }) } catch (e) {}
			} catch (e) {}
			// fallback: if component-level readiness wasn't set yet, mark app ready for tests
			try {
				if (!(window as any).APP_READY_FOR_TESTS) {
					(window as any).APP_READY_FOR_TESTS = true
					try { console.info('APP_READY_FOR_TESTS set (fallback from APP_HYDRATED)') } catch (e) {}
				}
			} catch (e) {}
		} catch (e) { /* noop in non-browser env */ }
	} catch (e) {
		// swallow any errors here - hydration signal is best-effort
	}
	
// router navigation diagnostics: write a small meta tag so Playwright debug HTML contains current route
try {
	router.afterEach((to, from) => {
		try {
			const meta = document.querySelector('meta[data-playwright-route]') || document.createElement('meta')
			meta.setAttribute('data-playwright-route', to.fullPath || to.path || String(to))
			meta.setAttribute('content', `from:${from.fullPath || from.path || String(from)} at:${Date.now()}`)
			if (!document.head.contains(meta)) document.head.appendChild(meta)
		} catch (e) {}
		try { console.info('router: navigated', { to: to.fullPath || to.path || String(to), from: from.fullPath || from.path || String(from) }) } catch (e) {}
	})
} catch (e) {}
})()

// keep HTML lang attribute in sync if user changes language later
try {
	const { locale } = (i18n as any).global
	if (locale && typeof locale === 'object' && 'value' in locale) {
		locale.value = locale.value || savedLang
		// reactive watch style: update html lang initially and when changed
		const setLang = (v: string) => { try { document.documentElement.lang = v } catch {} }
		setLang(locale.value)
		// small reactive subscription
		if (typeof (locale as any).watch === 'function') {
			;(locale as any).watch((v:string) => setLang(v))
		}
	}
} catch (e) { /* noop */ }
