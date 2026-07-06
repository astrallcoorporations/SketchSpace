import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { heatmapIntensityClass, type HeatmapWeek } from '@/features/growth/computations'

const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ContributionHeatmap({ weeks }: { weeks: HeatmapWeek[] }) {
  const max = Math.max(1, ...weeks.flat().map((d) => d.count))

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]" style={{ minWidth: weeks.length * 13 }}>
        <div className="mr-1 flex flex-col gap-[3px]">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-[10px] text-[9px] leading-[10px] text-muted-foreground">
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <Tooltip key={day.date}>
                <TooltipTrigger asChild>
                  <div
                    className={`size-[10px] rounded-[2px] ${day.inRange ? heatmapIntensityClass(day.count, max) : 'bg-transparent'}`}
                  />
                </TooltipTrigger>
                {day.inRange && (
                  <TooltipContent>
                    {day.count === 0 ? 'No activity' : `${day.count} update${day.count === 1 ? '' : 's'}`} ·{' '}
                    {formatDateLabel(day.date)}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
