"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"

interface DonutChartProps {
  percentage: number
  centerText?: string
  centerSubtext?: string
}

export function DonutChart({ percentage, centerText, centerSubtext }: DonutChartProps) {
  const data = [
    { name: "Completo", value: percentage },
    { name: "Incompleto", value: 100 - percentage },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill="#374192" />
          <Cell fill="#E5E7EB" />
          <Label
            content={({ viewBox }) => {
              if (!viewBox) return null
              const { cx, cy } = viewBox
              return (
                <g>
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-[#333333] text-lg font-bold"
                  >
                    {centerText || `${percentage}%`}
                  </text>
                  {centerSubtext && (
                    <text
                      x={cx}
                      y={cy + 16}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-[#666666] text-xs font-medium"
                    >
                      {centerSubtext}
                    </text>
                  )}
                </g>
              )
            }}
          />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
