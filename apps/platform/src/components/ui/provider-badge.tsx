import * as React from 'react';
import { cn } from '@/lib/utils';

// Provider icons as simple SVG components
const StripeIcon = ({ className }: { className?: string }) => (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
    </svg>
);

const PaddleIcon = ({ className }: { className?: string }) => (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.894c-.78.78-2.047.78-2.828 0L12 13.828l-3.066 3.066c-.78.78-2.047.78-2.828 0-.78-.78-.78-2.047 0-2.828L9.172 11 6.106 7.934c-.78-.78-.78-2.047 0-2.828.78-.78 2.047-.78 2.828 0L12 8.172l3.066-3.066c.78-.78 2.047-.78 2.828 0 .78.78.78 2.047 0 2.828L14.828 11l3.066 3.066c.78.78.78 2.047 0 2.828z" />
    </svg>
);

const GumroadIcon = ({ className }: { className?: string }) => (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 13.5c0 2.485-2.015 4.5-4.5 4.5s-4.5-2.015-4.5-4.5v-3c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5v3z" />
    </svg>
);

const LemonSqueezyIcon = ({ className }: { className?: string }) => (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
    </svg>
);

const PolarIcon = ({ className }: { className?: string }) => (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" fill="none" stroke="white" strokeWidth="2" />
    </svg>
);

const providerConfig: Record<string, { icon: React.FC<{ className?: string }>, label: string, color: string }> = {
    stripe: { icon: StripeIcon, label: 'Stripe', color: 'text-[#635BFF]' },
    paddle: { icon: PaddleIcon, label: 'Paddle', color: 'text-[#3B4B5E]' },
    gumroad: { icon: GumroadIcon, label: 'Gumroad', color: 'text-[#FF90E8]' },
    lemon_squeezy: { icon: LemonSqueezyIcon, label: 'Lemon Squeezy', color: 'text-[#FFC233]' },
    lemonsqueezy: { icon: LemonSqueezyIcon, label: 'Lemon Squeezy', color: 'text-[#FFC233]' },
    polar: { icon: PolarIcon, label: 'Polar', color: 'text-[#0062FF]' },
    dodo: { icon: PolarIcon, label: 'Dodo', color: 'text-[#FF6B35]' },
};

interface ProviderBadgeProps {
    provider: string;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ProviderBadge({ provider, showLabel = false, size = 'sm', className }: ProviderBadgeProps) {
    const normalizedProvider = provider?.toLowerCase().replace(/[\s-]/g, '_');
    const config = providerConfig[normalizedProvider];

    if (!config) {
        return null;
    }

    const Icon = config.icon;
    const sizeClasses = {
        sm: 'h-5 w-5 p-0.5',
        md: 'h-6 w-6 p-1',
        lg: 'h-8 w-8 p-1.5',
    };

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md bg-muted/50 border border-border/50",
                sizeClasses[size],
                className
            )}
            title={config.label}
        >
            <Icon className={cn("h-full w-full", config.color)} />
            {showLabel && (
                <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
            )}
        </div>
    );
}

interface ProviderBadgeGroupProps {
    providers: string[];
    maxVisible?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ProviderBadgeGroup({ providers, maxVisible = 3, size = 'sm', className }: ProviderBadgeGroupProps) {
    const uniqueProviders = [...new Set(providers.filter(Boolean))];
    const visibleProviders = uniqueProviders.slice(0, maxVisible);
    const remainingCount = uniqueProviders.length - maxVisible;

    if (uniqueProviders.length === 0) {
        return null;
    }

    return (
        <div className={cn("inline-flex items-center gap-1", className)}>
            {visibleProviders.map((provider) => (
                <ProviderBadge key={provider} provider={provider} size={size} />
            ))}
            {remainingCount > 0 && (
                <span className="text-xs text-muted-foreground ml-1">+{remainingCount}</span>
            )}
        </div>
    );
}
