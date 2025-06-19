
'use client';

import React from 'react';
import type { ImpactStory } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, BookOpen } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import Image from 'next/image';

interface ImpactStoryCardProps {
  story: ImpactStory;
}

export function ImpactStoryCard({ story }: ImpactStoryCardProps) {
  const timeAgo = story.createdAt
    ? formatDistanceToNowStrict(story.createdAt.toDate(), { addSuffix: true })
    : 'N/A';

  let determinedDisplayImageUrl = `https://placehold.co/600x400.png`; // Default placeholder
  let imageIsFromStory = false;

  if (story.imageUrl) {
    try {
      const parsedUrl = new URL(story.imageUrl);
      // Only allow images from 'placehold.co' as per next.config.ts
      if (parsedUrl.hostname === 'placehold.co') {
        determinedDisplayImageUrl = story.imageUrl;
        imageIsFromStory = true;
      } else {
        // Silently fall back to placeholder for unconfigured hosts
        // console.warn(`Image from unconfigured host (${parsedUrl.hostname}) for story "${story.title}". Using placeholder.`);
      }
    } catch (e) {
      // Silently fall back to placeholder for invalid URLs
      // console.warn(`Invalid image URL format for story "${story.title}": ${story.imageUrl}. Using placeholder.`);
    }
  }

  let imageAiHintValue: string;
  if (imageIsFromStory) {
    // Using the image provided in the story data (and it's valid)
    imageAiHintValue = story['data-ai-hint'] || "charity success";
  } else {
    // Using a placeholder (either because no story.imageUrl or it was invalid/unallowed host)
    // If the story had a hint, use that for the placeholder, otherwise use a generic placeholder hint.
    imageAiHintValue = story['data-ai-hint'] || "community event";
  }


  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group bg-card border-2 border-transparent hover:border-accent/50">
      {/* Image container - always rendered */}
      <div className="relative w-full h-40 sm:h-48 overflow-hidden rounded-t-xl">
        <Image
          src={determinedDisplayImageUrl}
          alt={story.title || "Impact story image"}
          layout="fill"
          objectFit="cover"
          data-ai-hint={imageAiHintValue}
          className="group-hover:scale-105 transition-transform duration-500 ease-out"
          priority={false}
          loading="lazy"
        />
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-75 group-hover:opacity-60 transition-opacity"></div>
      </div>
      
      <CardHeader className="text-center items-center pt-5 pb-2 px-4">
         {/* Icon div - margin is static as image container is always present */}
         <div className={`bg-accent/10 p-3 rounded-full w-fit mb-3 group-hover:bg-accent/20 transition-colors mt-0`}>
          <BookOpen className="h-8 w-8 md:h-9 md:w-9 text-accent" />
        </div>
        <CardTitle className="text-lg sm:text-xl font-headline text-accent line-clamp-2">{story.title}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground pt-1">By: {story.ngoName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow px-4 pt-2 pb-3 text-left">
        <p className="text-sm text-foreground/80 line-clamp-4 leading-relaxed">
          {story.storyContent}
        </p>
      </CardContent>
      <CardFooter className="mt-auto border-t border-border/50 px-4 py-2.5 flex justify-end items-center">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" /> {timeAgo}
        </div>
      </CardFooter>
    </Card>
  );
}

