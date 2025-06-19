
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
           <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity"></div>
        </div>
      )}
      <CardHeader className="pb-2 pt-4 px-4 md:px-5">
        <CardTitle className="text-lg md:text-xl font-headline font-semibold text-primary group-hover:text-primary/90 transition-colors flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary/80" />
          {story.title}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground pt-1 flex items-center">
          <Building className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          {story.ngoName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 pt-2 pb-3 px-4 md:px-5">
        <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
          {story.storyContent}
        </p>
      </CardContent>
      <CardFooter className="mt-auto border-t border-border/50 pt-2.5 pb-2.5 px-4 md:px-5 flex justify-end items-center">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" /> {timeAgo}
        </div>
      </CardFooter>
    </Card>
  );
}
