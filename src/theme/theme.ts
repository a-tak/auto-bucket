import { createTheme } from "@mui/material/styles"

// Vuetifyテーマからの変換
// primary:   teal.lighten3  = #80CBC4
// secondary: amber.accent1  = #FFE57F
// accent:    teal.darken2   = #00796B  → info として利用
// error:     red.accent3    = #FF1744

const theme = createTheme({
  palette: {
    primary: {
      main: "#80CBC4",
    },
    secondary: {
      main: "#FFE57F",
    },
    error: {
      main: "#FF1744",
    },
    info: {
      main: "#00796B",
    },
  },
})

export default theme
