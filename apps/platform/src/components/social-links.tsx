'use client';

import Link from 'next/link';
import { 
  Twitter, 
  Linkedin, 
  Github, 
  Instagram, 
  Facebook, 
  Youtube,
  Music,
  MessageCircle,
  BookOpen,
  Globe
} from 'lucide-react';

interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  threads?: string;
  medium?: string;
  website?: string;
}

interface SocialLinksProps {
  socialLinks: SocialLinks;
  className?: string;
}

export function SocialLinks({ socialLinks, className = '' }: SocialLinksProps) {
  const links = [
    {
      key: 'twitter',
      url: socialLinks.twitter,
      icon: Twitter,
      label: 'Twitter/X',
      getUrl: (value: string) => {
        if (value.startsWith('http')) return value;
        if (value.startsWith('@')) return `https://x.com/${value.slice(1)}`;
        return `https://x.com/${value}`;
      },
    },
    {
      key: 'linkedin',
      url: socialLinks.linkedin,
      icon: Linkedin,
      label: 'LinkedIn',
      getUrl: (value: string) => {
        if (value.startsWith('http')) return value;
        return `https://linkedin.com/in/${value}`;
      },
    },
    {
      key: 'github',
      url: socialLinks.github,
      icon: Github,
      label: 'GitHub',
      getUrl: (value: string) => {
        if (value.startsWith('http')) return value;
        if (value.startsWith('@')) return `https://github.com/${value.slice(1)}`;
        return `https://github.com/${value}`;
      },
    },
    {
      key: 'instagram',
      url: socialLinks.instagram,
      icon: Instagram,
      label: 'Instagram',
      getUrl: (value: string) => {
        if (value.startsWith('http')) return value;
        if (value.startsWith('@')) return `https://instagram.com/${value.slice(1)}`;
        return `https://instagram.com/${value}`;
      },
    },
    {
      key: 'facebook',
      url: socialLinks.facebook,
      icon: Facebook,
      label: 'Facebook',
      getUrl: (value: string) => {
        if (value.startsWith('http')) return value;
        return `https://facebook.com/${value}`;
      },
    },
    {
      key: 'youtube',
      url: socialLinks.youtube,
      icon: Youtube,
      label: 'YouTube',
      getUrl: (value: string) => {
        if (value.startsWith('http')) return value;
        if (value.includes('/channel/') || value.includes('/@')) return `https://youtube.com/${value}`;
        return `https://youtube.com/@${value}`;
      },
    },
    {
      key: 'tiktok',
      url: socialLinks.tiktok,
      icon: Music,
      label: 'TikTok',
      getUrl: (value: string) => {
        if (value.startsWith('http')) return value;
        if (value.startsWith('@')) return `https://tiktok.com/@${value.slice(1)}`;
        return `https://tiktok.com/@${value}`;
      },
    },
    {
      key: 'threads',
      url: socialLinks.threads,
      icon: MessageCircle,
      label: 'Threads',
      getUrl: (value: string) => {
        if (value.startsWith('http')) return value;
        if (value.startsWith('@')) return `https://threads.net/@${value.slice(1)}`;
        return `https://threads.net/@${value}`;
      },
    },
    {
      key: 'medium',
      url: socialLinks.medium,
      icon: BookOpen,
      label: 'Medium',
      getUrl: (value: string) => {
        if (value.startsWith('http')) return value;
        if (value.startsWith('@')) return `https://medium.com/@${value.slice(1)}`;
        return `https://medium.com/@${value}`;
      },
    },
    {
      key: 'website',
      url: socialLinks.website,
      icon: Globe,
      label: 'Website',
      getUrl: (value: string) => {
        if (value.startsWith('http')) return value;
        return `https://${value}`;
      },
    },
  ].filter(link => link.url);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map(({ key, url, icon: Icon, label, getUrl }) => (
        <Link
          key={key}
          href={getUrl(url!)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title={label}
          aria-label={label}
        >
          <Icon className="h-5 w-5" />
        </Link>
      ))}
    </div>
  );
}
