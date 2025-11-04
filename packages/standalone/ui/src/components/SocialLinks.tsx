import React from 'react';

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
  const getUrl = (key: string, value: string): string => {
    if (value.startsWith('http')) return value;
    
    switch (key) {
      case 'twitter':
        if (value.startsWith('@')) return `https://x.com/${value.slice(1)}`;
        return `https://x.com/${value}`;
      case 'linkedin':
        return `https://linkedin.com/in/${value}`;
      case 'github':
        if (value.startsWith('@')) return `https://github.com/${value.slice(1)}`;
        return `https://github.com/${value}`;
      case 'instagram':
        if (value.startsWith('@')) return `https://instagram.com/${value.slice(1)}`;
        return `https://instagram.com/${value}`;
      case 'facebook':
        return `https://facebook.com/${value}`;
      case 'youtube':
        if (value.includes('/channel/') || value.includes('/@')) return `https://youtube.com/${value}`;
        return `https://youtube.com/@${value}`;
      case 'tiktok':
        if (value.startsWith('@')) return `https://tiktok.com/@${value.slice(1)}`;
        return `https://tiktok.com/@${value}`;
      case 'threads':
        if (value.startsWith('@')) return `https://threads.net/@${value.slice(1)}`;
        return `https://threads.net/@${value}`;
      case 'medium':
        if (value.startsWith('@')) return `https://medium.com/@${value.slice(1)}`;
        return `https://medium.com/@${value}`;
      case 'website':
        return `https://${value}`;
      default:
        return value;
    }
  };

  const links = [
    {
      key: 'twitter',
      url: socialLinks.twitter,
      label: 'Twitter/X',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      key: 'linkedin',
      url: socialLinks.linkedin,
      label: 'LinkedIn',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      key: 'github',
      url: socialLinks.github,
      label: 'GitHub',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    },
    {
      key: 'instagram',
      url: socialLinks.instagram,
      label: 'Instagram',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      key: 'facebook',
      url: socialLinks.facebook,
      label: 'Facebook',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      key: 'youtube',
      url: socialLinks.youtube,
      label: 'YouTube',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      key: 'tiktok',
      url: socialLinks.tiktok,
      label: 'TikTok',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ),
    },
    {
      key: 'threads',
      url: socialLinks.threads,
      label: 'Threads',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.158 6.896c-.277 0-.547.027-.811.077v3.217h2.805c.104 0 .208-.009.312-.034.264-.063.498-.194.685-.38a1.19 1.19 0 00.349-.848c0-.319-.13-.624-.36-.849a1.31 1.31 0 00-.871-.383 3.946 3.946 0 00-.309-.006zm11.842 0c0 3.136-.901 6.046-2.456 8.517-.786 1.265-1.717 2.405-2.765 3.39a1.11 1.11 0 01-.779.301c-.291 0-.569-.12-.771-.331-.202-.211-.314-.497-.312-.794 0-.154.018-.308.052-.46.119-.537.233-1.078.34-1.62.015-.077.031-.154.044-.231.102-.627.17-1.26.204-1.896.013-.27.02-.541.02-.812V6.896h6.463zm-6.463 1.751v6.531a7.8 7.8 0 01-.147 1.515 7.295 7.295 0 01-.412 1.686c.822-.324 1.606-.726 2.339-1.2a11.52 11.52 0 002.318-2.084 11.882 11.882 0 001.972-2.726H17.537zm-6.543-1.751C4.935 6.896 0 10.05 0 14.002c0 1.89 1.08 3.578 2.758 4.68.41.272.857.49 1.324.645a1.11 1.11 0 01.643.398c.16.037.326.056.492.056.291 0 .569-.12.771-.331.202-.211.314-.497.312-.794a3.32 3.32 0 00-.143-.963c-.02-.08-.04-.161-.063-.24a9.305 9.305 0 01-.35-1.729c-.03-.356-.047-.714-.05-1.072 0-1.875 1.459-3.458 3.418-3.968a6.76 6.76 0 011.995-.303h.136zm1.362 5.427c-.277 0-.547.027-.811.077v3.217h2.805c.104 0 .208-.009.312-.034.264-.063.498-.194.685-.38a1.19 1.19 0 00.349-.848c0-.319-.13-.624-.36-.849a1.31 1.31 0 00-.871-.383 3.946 3.946 0 00-.309-.006z"/>
        </svg>
      ),
    },
    {
      key: 'medium',
      url: socialLinks.medium,
      label: 'Medium',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
        </svg>
      ),
    },
    {
      key: 'website',
      url: socialLinks.website,
      label: 'Website',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
  ].filter(link => link.url);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map(({ key, url, label, icon }) => (
        <a
          key={key}
          href={getUrl(key, url!)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={label}
          aria-label={label}
        >
          {icon}
        </a>
      ))}
    </div>
  );
}
