import React from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"
import type { ChartData, ChartOptions } from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  chartData: ChartData<"line">
  chartOptions: ChartOptions<"line">
}

export default function AccuracyChart({ chartData, chartOptions }: Props) {
  return (
    <Line
      data={chartData}
      options={chartOptions}
      style={{ position: "relative" }}
    />
  )
}
