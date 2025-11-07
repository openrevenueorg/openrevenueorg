'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ url, title });
      } catch {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="p-2 hover:bg-muted rounded-lg transition-colors"
      title={copied ? 'Copied!' : 'Share'}
    >
      <Share2 className="h-5 w-5" />
    </button>
  );
}
