import { CheckCircle, Info } from 'lucide-react';
import { Badge } from './badge';

interface TrustBadgeProps {
  trustLevel: 'PLATFORM_VERIFIED' | 'SELF_REPORTED';
  verificationMethod?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TrustBadge({ trustLevel, verificationMethod, size = 'md' }: TrustBadgeProps) {
  const config = {
    PLATFORM_VERIFIED: {
      icon: CheckCircle,
      label: 'Verified',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700',
      tooltip: 'Data verified through direct payment provider integration'
    },
    SELF_REPORTED: {
      icon: Info,
      label: 'Self-Reported',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
      tooltip: 'Data from self-hosted application'
    }
  };
  
  const { icon: Icon, label, className, tooltip } = config[trustLevel];
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  
  return (
    <Badge className={className} title={tooltip} variant="outline">
      <Icon className={`${iconSize} mr-1`} />
      {label}
    </Badge>
  );
}
