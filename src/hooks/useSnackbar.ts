import { useState, useCallback } from "react"

export function useSnackbar() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [key, setKey] = useState(0)

  const show = useCallback((msg: string) => {
    setMessage(msg)
    setKey((k) => k + 1)
    setOpen(true)
  }, [])

  const hide = useCallback(() => {
    setOpen(false)
  }, [])

  return {
    snackbarOpen: open,
    snackbarMessage: message,
    snackbarKey: key,
    showSnackbar: show,
    hideSnackbar: hide,
  }
}
