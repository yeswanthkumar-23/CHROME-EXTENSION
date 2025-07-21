"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface HourlyHeatmapProps {
  data: Array<{
    hour: number
    productive?: number
    unproductive?: number
    neutral?: number
  }>
}

export function HourlyHeatmap({ data }: HourlyHeatmapProps) {
  // Format the data for display
  const formattedData = data.map((item) => ({
    ...item,
    hour: formatHour(item.hour),
    total: (item.productive || 0) + (item.unproductive || 0) + (item.neutral || 0),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formattedData}>
        <XAxis dataKey="hour" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => [
            `${value} min`,
            name === "total" ? "Total Activity" : name.charAt(0).toUpperCase() + name.slice(1),
          ]}
        />
        <Bar dataKey="total" fill="#64748b" />
      </BarChart>
    </ResponsiveContainer>
  )
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM"
  if (hour === 12) return "12 PM"
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}
