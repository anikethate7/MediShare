
'use client';

import React from 'react';
import type { ImpactStory } from '@/types';
import Image from 'next/image';

interface ImpactStoryCardProps {
  story: ImpactStory;
}

export function ImpactStoryCard({ story }: ImpactStoryCardProps) {
  const determineDisplayImage = () => {
    const defaultPlaceholder = 'https://placehold.co/600x400.png';
    const defaultHint = 'community event';

    // Check for a valid, fully-formed URL starting with http
    if (story.imageUrl && story.imageUrl.startsWith('http')) {
      try {
        const url = new URL(story.imageUrl);
        const allowedHosts = ['placehold.co', 'firebasestorage.googleapis.com'];
        
        // Ensure the hostname is in our allowed list for next/image
        if (allowedHosts.includes(url.hostname)) {
          return {
            src: story.imageUrl,
            hint: story['data-ai-hint'] || 'charity success',
          };
        }
      } catch (e) {
        // This will catch errors from `new URL()` if the URL is malformed
        console.warn(
          `Invalid image URL provided for story "${story.title}": ${story.imageUrl}`
        );
      }
    }

    // Fallback case if no valid URL is found
    return {
      src: defaultPlaceholder,
      hint: story['data-ai-hint'] || defaultHint,
    };
  };

  const { src: displayImageUrl, hint: imageAiHint } = determineDisplayImage();

  return (
    <div className="group flex flex-col">
      <div className="relative h-64 w-full overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl sm:h-72">
        <Image
          src={displayImageUrl}
          alt={story.title || 'Impact story image'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          style={{ objectFit: 'cover' }}
          data-ai-hint={imageAiHint}
          className="transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute bottom-0 left-0 p-4">
          <h3
            className="text-2xl font-bold uppercase tracking-wider text-white"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >
            {story.title}
          </h3>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm leading-relaxed text-foreground/80">
          {story.storyContent}
        </p>
      </div>
    </div>
  );
}
