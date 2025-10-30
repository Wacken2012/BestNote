import deApp from './de.json'
import enApp from './en.json'
import deLocales from './locales/de.json'
import enLocales from './locales/en.json'

const de = { ...deApp, ...deLocales }
const en = { ...enApp, ...enLocales }

export default { de, en }
