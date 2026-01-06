import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'warning';
  className?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}) => {
  const variantStyles = {
    default: 'bg-card',
    primary: 'bg-gradient-primary text-primary-foreground',
    accent: 'bg-gradient-accent text-accent-foreground',
    warning: 'bg-gradient-warning text-warning-foreground',
  };

  const isGradient = variant !== 'default';

  return (
    <div
      className={cn(
        'rounded-xl p-6 shadow-card border border-border/50 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn('text-sm font-medium', isGradient ? 'opacity-90' : 'text-muted-foreground')}>
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <span
                className={cn(
                  'text-sm font-medium',
                  isGradient
                    ? 'opacity-90'
                    : trend.isPositive
                    ? 'text-success'
                    : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className={cn('text-sm', isGradient ? 'opacity-80' : 'text-muted-foreground')}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl',
            isGradient ? 'bg-white/20' : 'bg-primary/10'
          )}
        >
          <Icon className={cn('h-6 w-6', isGradient ? '' : 'text-primary')} />
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
