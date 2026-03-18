import React from "react"
import { useTranslation } from "react-i18next"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Button from "@mui/material/Button"
import Avatar from "@mui/material/Avatar"
import Typography from "@mui/material/Typography"

export default function PopupPage() {
  const { t } = useTranslation()

  const handleLearnMore = () => {
    browser.tabs.create({ url: t("message.learn_more_url") })
  }

  const handleOpenStatistics = () => {
    browser.tabs.create({ url: "/statistics/statistics.html" })
  }

  const handleOpenOption = () => {
    browser.runtime.openOptionsPage()
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", m: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t("message.page_title")}
      </Typography>
      <Card sx={{ m: 1 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", p: 1 }}>
          <Avatar
            src="../../icons/icon_128.png"
            variant="square"
            sx={{ width: 80, height: 80, m: 1 }}
          />
          <CardContent>
            <Typography variant="body2">
              {t("message.page_head_content")}
            </Typography>
          </CardContent>
        </Box>
        <CardActions sx={{ flexWrap: "wrap" }}>
          <Button size="small" color="info" onClick={handleLearnMore}>
            {t("message.learn_more")}
          </Button>
          <Button size="small" color="primary" onClick={handleOpenStatistics}>
            {t("message.statistics_btn_label")}
          </Button>
          <Button size="small" color="primary" onClick={handleOpenOption}>
            {t("message.option_btn_label")}
          </Button>
        </CardActions>
      </Card>
    </Box>
  )
}
