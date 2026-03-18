import React from "react"
import ReactDOM from "react-dom/client"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { I18nextProvider } from "react-i18next"
import theme from "../theme/theme"
import { createI18n } from "../i18n/createI18n"
import messages from "./message.json"
import App from "./App"

const i18n = createI18n(messages)

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </ThemeProvider>
  </React.StrictMode>
)
