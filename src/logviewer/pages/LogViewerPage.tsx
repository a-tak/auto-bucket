import React from "react"
import { useTranslation } from "react-i18next"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Chip from "@mui/material/Chip"
import { useLogViewer } from "../../hooks/useLogViewer"

export default function LogViewerPage() {
  const { t } = useTranslation()
  const {
    subject,
    from,
    classificate,
    scores,
    wordscore,
    targetText,
    notFound,
  } = useLogViewer()

  return (
    <Box sx={{ display: "flex", flexDirection: "column", m: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t("message.page_title")}
      </Typography>

      <Card sx={{ m: 1 }}>
        <CardContent>
          <Typography variant="subtitle1" color="text.secondary">
            {t("message.subject_title")}
          </Typography>
          <Typography variant="body1">{subject}</Typography>
        </CardContent>
      </Card>

      <Card sx={{ m: 1 }}>
        <CardContent>
          <Typography variant="subtitle1" color="text.secondary">
            {t("message.from_title")}
          </Typography>
          <Typography variant="body1">{from}</Typography>
        </CardContent>
      </Card>

      {notFound && (
        <Card sx={{ m: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ m: 1 }}>
              {t("message.not_found_title")}
            </Typography>
          </CardContent>
        </Card>
      )}

      {!notFound && (
        <>
          <Card sx={{ m: 1 }}>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">
                {t("message.judgement_title")}
              </Typography>
              <Typography variant="body1">{classificate}</Typography>
            </CardContent>
          </Card>

          <Card sx={{ m: 1 }}>
            <CardContent>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                {t("message.category_score_title")}
              </Typography>
              {scores.map((score) => (
                <Box
                  key={score.category}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1">{score.category}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {score.score} {t("message.unit_score")}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {wordscore.map((category) => (
            <Card key={category.category} sx={{ m: 1 }}>
              <CardContent>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  {category.category} {t("message.top_score_word_title")}
                </Typography>
                {category.words.map((word) => (
                  <Box
                    key={word.word}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {word.word}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${word.score} ${t("message.unit_score")}`}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={`${word.count} ${t("message.unit_count")}`}
                      variant="outlined"
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card sx={{ m: 1 }}>
            <CardContent>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                {t("message.target_text_title")}
              </Typography>
              <Typography variant="caption" sx={{ wordBreak: "break-all" }}>
                {targetText}
              </Typography>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}
