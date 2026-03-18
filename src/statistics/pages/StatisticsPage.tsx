import React from "react"
import { useTranslation } from "react-i18next"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import { useStatistics } from "../../hooks/useStatistics"
import AccuracyChart from "../components/AccuracyChart"

export default function StatisticsPage() {
  const { t } = useTranslation()
  const {
    loading,
    totalAccuracy,
    totalJudgeCount,
    totalWrongCount,
    totalStatisticsResetDate,
    accuracyData,
    accuracyOptions,
  } = useStatistics()

  return (
    <Box sx={{ display: "flex", flexDirection: "column", m: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t("message.page_title")}
      </Typography>

      {loading ? (
        <Skeleton
          variant="rectangular"
          height={120}
          sx={{ m: 1, borderRadius: 1 }}
        />
      ) : (
        <Card sx={{ m: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("message.total_accuracy_title")}
            </Typography>
            <Box sx={{ display: "flex", gap: 4 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t("message.total_accuracy_label")}
                </Typography>
                <Typography variant="h5">{totalAccuracy} %</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t("message.total_judge_count_label")}
                </Typography>
                <Typography variant="h5">{totalJudgeCount}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t("message.total_wrong_count_label")}
                </Typography>
                <Typography variant="h5">{totalWrongCount}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ m: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("message.accuracy_title")}
          </Typography>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={200}
              sx={{ m: 1, borderRadius: 1 }}
            />
          ) : (
            <AccuracyChart
              chartData={accuracyData}
              chartOptions={accuracyOptions}
            />
          )}
          {loading ? (
            <Skeleton variant="text" height={40} sx={{ mt: 1 }} />
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t("message.statistics_reset_date_title")}
              </Typography>
              <Typography variant="body1">
                {totalStatisticsResetDate}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
