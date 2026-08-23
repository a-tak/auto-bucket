import { useState, useEffect } from "react"
import type { ChartData, ChartOptions } from "chart.js"
import StatisticsUtil from "../lib/StatisticsUtil"
import StatisticsLog from "../models/StatisticsLog"
import DateUtil from "../lib/DateUtil"
import AccuracyUtil from "../lib/AccuracyUtil"

export function useStatistics() {
  const [loading, setLoading] = useState(true)
  const [totalStatistics, setTotalStatistics] = useState<StatisticsLog>({
    totalCount: 0,
    wrongCount: 0,
  })
  const [accuracyData, setAccuracyData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  })

  const accuracyOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  }

  const totalAccuracy = AccuracyUtil.calculate(totalStatistics)

  const totalStatisticsResetDate =
    typeof totalStatistics.date === "undefined"
      ? ""
      : totalStatistics.date.toLocaleString()

  useEffect(() => {
    async function loadAll() {
      const [total, items] = await Promise.all([
        StatisticsUtil.loadTotalStatistics(),
        StatisticsUtil.getListStatisticsFromStorage(),
      ])

      setTotalStatistics(total)

      const data: number[] = []
      const dateLabel: string[] = []
      for (const item of items) {
        data.push(AccuracyUtil.calculate(item))
        dateLabel.push(
          typeof item.date === "undefined" ? "" : DateUtil.getMD(item.date)
        )
      }

      setAccuracyData({
        labels: dateLabel,
        datasets: [
          {
            label: "精度",
            data,
            backgroundColor: "rgba(128, 203, 196, 0.5)",
          },
        ],
      })

      setLoading(false)
    }

    loadAll()
  }, [])

  return {
    loading,
    totalStatistics,
    totalAccuracy,
    totalJudgeCount: totalStatistics.totalCount,
    totalWrongCount: totalStatistics.wrongCount,
    totalStatisticsResetDate,
    accuracyData,
    accuracyOptions,
  }
}
