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

const i18n = createI18n({ locale: 'de', fallbackLocale: 'en', messages })

app.use(pinia)
app.use(router)
app.use(i18n)
app.directive('can', vCan)
app.directive('can-upload', vCanUpload)
app.directive('can-piece', vCanPiece)
app.directive('can-calendar', vCanCalendar)

// Service worker registration will be handled by vite-plugin-pwa automatically

app.mount('#app')
