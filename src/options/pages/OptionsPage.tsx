import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Chip from "@mui/material/Chip"
import Snackbar from "@mui/material/Snackbar"
import Tooltip from "@mui/material/Tooltip"
import InputAdornment from "@mui/material/InputAdornment"
import Tag from "../../models/Tag"
import { useOptions } from "../../hooks/useOptions"
import { useSnackbar } from "../../hooks/useSnackbar"

export default function OptionsPage() {
  const { t } = useTranslation()
  const {
    tags,
    selectedTags,
    setSelectedTags,
    bodyMaxLength,
    setBodyMaxLength,
    logDeletePastHour,
    setLogDeletePastHour,
    save,
    cancel,
    clearLearn,
    resetStatistic,
    clearSetting,
  } = useOptions()
  const {
    snackbarOpen,
    snackbarMessage,
    snackbarKey,
    showSnackbar,
    hideSnackbar,
  } = useSnackbar()

  const [bodyMaxLengthStr, setBodyMaxLengthStr] = useState(
    String(bodyMaxLength)
  )
  const [logDeletePastHourStr, setLogDeletePastHourStr] = useState(
    String(logDeletePastHour)
  )

  useEffect(() => {
    setBodyMaxLengthStr(String(bodyMaxLength))
  }, [bodyMaxLength])

  useEffect(() => {
    setLogDeletePastHourStr(String(logDeletePastHour))
  }, [logDeletePastHour])

  const isBodyMaxLengthValid = !isNaN(Number(bodyMaxLengthStr))
  const isLogDeletePastHourValid = !isNaN(Number(logDeletePastHourStr))
  const isValid = isBodyMaxLengthValid && isLogDeletePastHourValid

  const handleSave = async () => {
    if (!isValid) {
      showSnackbar(t("message.save_error_msg"))
      return
    }
    setBodyMaxLength(Number(bodyMaxLengthStr))
    setLogDeletePastHour(Number(logDeletePastHourStr))
    await save()
    showSnackbar(t("message.save_msg"))
  }

  const handleCancel = async () => {
    await cancel()
    showSnackbar(t("message.cancel_msg"))
  }

  const handleClearLearn = async () => {
    await clearLearn()
    showSnackbar(t("message.clear_learn_msg"))
  }

  const handleResetStatistic = async () => {
    await resetStatistic()
    showSnackbar(t("message.reset_statistics_msg"))
  }

  const handleClearSetting = async () => {
    await clearSetting()
    showSnackbar(t("message.clear_setting_msg"))
  }

  return (
    <Box sx={{ m: 2 }}>
      <Card sx={{ m: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("message.classificate_tag_title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t("message.notice")}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", mb: 2 }}>
            <Tooltip title={t("message.save_button_tip")}>
              <Button
                variant="contained"
                color="info"
                onClick={handleSave}
                sx={{ mr: 1 }}
              >
                {t("message.save_button_label")}
              </Button>
            </Tooltip>
            <Tooltip title={t("message.cancel_button_tip")}>
              <Button variant="outlined" onClick={handleCancel}>
                {t("message.cancel_button_label")}
              </Button>
            </Tooltip>
          </Box>
          <Autocomplete
            multiple
            value={selectedTags}
            onChange={(_event, newValue: Tag[]) => setSelectedTags(newValue)}
            options={tags}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.key === value.key}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const tagProps = getTagProps({ index })
                return (
                  <Chip label={option.name} {...tagProps} key={option.key} />
                )
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("message.classificate_tag_label")}
                helperText={t("message.classificate_tag_hint")}
                sx={{ mb: 2 }}
              />
            )}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            value={bodyMaxLengthStr}
            onChange={(e) => setBodyMaxLengthStr(e.target.value)}
            label={t("message.body_max_length_label")}
            helperText={
              isBodyMaxLengthValid
                ? t("message.body_max_length_hint")
                : t("message.numeric_only_rule_error")
            }
            error={!isBodyMaxLengthValid}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">KByte</InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            value={logDeletePastHourStr}
            onChange={(e) => setLogDeletePastHourStr(e.target.value)}
            label={t("message.keep_log_hour_label")}
            helperText={
              isLogDeletePastHourValid
                ? t("message.keep_log_hour_hint")
                : t("message.numeric_only_rule_error")
            }
            error={!isLogDeletePastHourValid}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {t("message.keep_log_hour_suffix")}
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card sx={{ m: 1, bgcolor: "error.light" }}>
        <CardContent>
          <Typography variant="h6">
            {t("message.reset_statistics_title")}
          </Typography>
          <Typography variant="body2">
            {t("message.reset_statistics_subtitle")}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            sx={{ bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}
            onClick={handleResetStatistic}
          >
            {t("message.reset_statistics_btn_label")}
          </Button>
        </CardActions>
      </Card>

      <Card sx={{ m: 1, bgcolor: "error.light" }}>
        <CardContent>
          <Typography variant="h6">{t("message.reset_learn_title")}</Typography>
          <Typography variant="body2">
            {t("message.reset_learn_subtitle")}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            sx={{ bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}
            onClick={handleClearLearn}
          >
            {t("message.reset_learn_btn_label")}
          </Button>
        </CardActions>
      </Card>

      <Card sx={{ m: 1, bgcolor: "error.light" }}>
        <CardContent>
          <Typography variant="h6">{t("message.reset_all_title")}</Typography>
          <Typography variant="body2">
            {t("message.reset_all_subtitle")}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            sx={{ bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}
            onClick={handleClearSetting}
          >
            {t("message.reset_all_btn_label")}
          </Button>
        </CardActions>
      </Card>

      <Snackbar
        key={snackbarKey}
        open={snackbarOpen}
        onClose={hideSnackbar}
        message={snackbarMessage}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </Box>
  )
}
