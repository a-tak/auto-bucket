import { createInstance } from "i18next"
import { initReactI18next } from "react-i18next"

type Messages = {
  ja: { message: Record<string, string> }
  en: { message: Record<string, string> }
}

export function createI18n(translations: Messages) {
  const lang = browser.i18n.getUILanguage().split("-")[0]

  const instance = createInstance()
  instance.use(initReactI18next).init({
    resources: {
      ja: { translation: translations.ja },
      en: { translation: translations.en },
    },
    lng: lang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  })

  return instance
}
