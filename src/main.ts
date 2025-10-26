import { createApp } from 'vue'
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

// signal to tests that the app has finished client-side initialization (hydration/i18n)
try { (window as any).__APP_HYDRATED__ = true } catch (e) { /* noop in non-browser env */ }

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
