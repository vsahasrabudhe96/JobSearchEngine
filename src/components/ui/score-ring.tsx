import { cn } from '@/lib/utils'

interface ScoreRingProps { score: number; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean; className?: string }

export function ScoreRing({ score, size = 'md', showLabel = true, className }: ScoreRingProps) {
  const getColor = (s: number) => s >= 80 ? '#10b981' : s >= 60 ? '#0ea5e9' : s >= 40 ? '#f59e0b' : '#ef4444'
  const sizeStyles = { sm: { outer: 'w-10 h-10', inner: 'inset-1', text: 'text-xs' }, md: { outer: 'w-14 h-14', inner: 'inset-1.5', text: 'text-sm' }, lg: { outer: 'w-20 h-20', inner: 'inset-2', text: 'text-lg' } }
  const color = getColor(score)
  const styles = sizeStyles[size]

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} title={`${score}% match`}>
      <div className={cn('rounded-full', styles.outer)} style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #e7e5e4 0deg)` }} />
      <div className={cn('absolute bg-white rounded-full flex items-center justify-center', styles.inner)}>
        {showLabel && <span className={cn('font-bold', styles.text)} style={{ color }}>{score}</span>}
      </div>
    </div>
  )
}
