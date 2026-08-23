// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useOptions } from "@/hooks/useOptions"
import { useSnackbar } from "@/hooks/useSnackbar"
import OptionsPage from "@/options/pages/OptionsPage"

vi.mock("@/hooks/useOptions", () => ({ useOptions: vi.fn() }))
vi.mock("@/hooks/useSnackbar", () => ({ useSnackbar: vi.fn() }))
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe("OptionsPage", () => {
  const save = vi.fn()
  const showSnackbar = vi.fn()
  const setBodyMaxLength = vi.fn()
  const setLogDeletePastHour = vi.fn()
  const cancel = vi.fn()
  const clearLearn = vi.fn()
  const resetStatistic = vi.fn()
  const clearSetting = vi.fn()

  beforeEach(() => {
    vi.mocked(useOptions).mockReturnValue({
      tags: [],
      selectedTags: [],
      setSelectedTags: vi.fn(),
      bodyMaxLength: 100,
      setBodyMaxLength,
      logDeletePastHour: 72,
      setLogDeletePastHour,
      save,
      cancel,
      clearLearn,
      resetStatistic,
      clearSetting,
    })
    vi.mocked(useSnackbar).mockReturnValue({
      snackbarOpen: false,
      snackbarMessage: "",
      snackbarKey: 0,
      showSnackbar,
      hideSnackbar: vi.fn(),
    })
  })

  afterEach(cleanup)

  it("rejects non-numeric values without saving", async () => {
    const user = userEvent.setup()
    render(<OptionsPage />)

    const bodyLength = screen.getByLabelText("message.body_max_length_label")
    await user.clear(bodyLength)
    await user.type(bodyLength, "invalid")
    await user.click(screen.getByText("message.save_button_label"))

    expect(save).not.toHaveBeenCalled()
    expect(showSnackbar).toHaveBeenCalledWith("message.save_error_msg")
  })

  it("saves valid numeric values and updates displayed state", async () => {
    const user = userEvent.setup()
    render(<OptionsPage />)

    const bodyLength = screen.getByLabelText("message.body_max_length_label")
    const logHours = screen.getByLabelText("message.keep_log_hour_label")
    await user.clear(bodyLength)
    await user.type(bodyLength, "150")
    await user.clear(logHours)
    await user.type(logHours, "48")
    await user.click(screen.getByText("message.save_button_label"))

    expect(setBodyMaxLength).toHaveBeenCalledWith(150)
    expect(setLogDeletePastHour).toHaveBeenCalledWith(48)
    expect(save).toHaveBeenCalledWith(150, 48)
    expect(showSnackbar).toHaveBeenCalledWith("message.save_msg")
  })

  it("delegates cancel and reset operations", async () => {
    const user = userEvent.setup()
    render(<OptionsPage />)

    await user.click(screen.getByText("message.cancel_button_label"))
    await user.click(screen.getByText("message.reset_statistics_btn_label"))
    await user.click(screen.getByText("message.reset_learn_btn_label"))
    await user.click(screen.getByText("message.reset_all_btn_label"))

    expect(cancel).toHaveBeenCalledOnce()
    expect(resetStatistic).toHaveBeenCalledOnce()
    expect(clearLearn).toHaveBeenCalledOnce()
    expect(clearSetting).toHaveBeenCalledOnce()
  })
})
