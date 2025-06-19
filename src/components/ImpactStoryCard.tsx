
'use client';

import React from 'react';
import type { ImpactStory } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Building, BookOpen } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import Image from 'next/image';

interface ImpactStoryCardProps {
  story: ImpactStory;
}

export function ImpactStoryCard({ story }: ImpactStoryCardProps) {
  const timeAgo = story.createdAt
    ? formatDistanceToNowStrict(story.createdAt.toDate(), { addSuffix: true })
    : 'N/A';

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group bg-card border border-border/50 hover:border-primary/30">
      {story.imageUrl && (
        <div className="relative w-full h-48 sm:h-52 overflow-hidden">
          <Image
            src={story.imageUrl || "https://placehold.co/600x300.png"}
            alt={story.title || "Impact story image"}
            layout="fill"
            objectFit="cover"
            data-ai-hint={story['data-ai-hint'] || "charity success"}
            className="group-hover:scale-105 transition-transform duration-500 ease-out"
            priority={false}
            loading="lazy"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-70 group-hover:opacity-60 transition-opacity"></div>
        </div>
      )}
      <CardHeader className="px-4 md:px-5 pt-4 pb-2">
        <CardTitle className="text-lg md:text-xl font-headline font-semibold text-primary group-hover:text-primary/90 transition-colors flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary flex-shrink-0" /> {/* Icon color matches title */}
          {story.title}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground pt-1.5 flex items-center"> {/* Increased pt slightly */}
          <Building className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
          {story.ngoName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow px-4 md:px-5 pt-1 pb-4"> {/* Adjusted pt and pb */}
        <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
          {story.storyContent}
        </p>
      </CardContent>
      <CardFooter className="mt-auto border-t border-border/50 px-4 md:px-5 py-3 flex justify-end items-center"> {/* Consistent py */}
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" /> {timeAgo}
        </div>
      </CardFooter>
    </Card>
  );
}

