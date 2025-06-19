
'use client';

import React from 'react';
import type { ImpactStory } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Building, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface ImpactStoryCardProps {
  story: ImpactStory;
}

export function ImpactStoryCard({ story }: ImpactStoryCardProps) {
  const timeAgo = story.createdAt ? formatDistanceToNow(story.createdAt.toDate(), { addSuffix: true }) : 'N/A';

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-up group">
      {story.imageUrl && (
        <div className="relative w-full h-48 sm:h-56">
          <Image
            src={story.imageUrl || "https://placehold.co/600x300.png"}
            alt={story.title || "Impact story image"}
            layout="fill"
            objectFit="cover"
            data-ai-hint={story['data-ai-hint'] || "charity success"}
            className="group-hover:scale-105 transition-transform duration-300"
            priority={false}
            loading="lazy"
          />
        </div>
      )}
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-xl md:text-2xl font-headline text-primary flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          {story.title}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground pt-1 flex items-center">
          <Building className="h-4 w-4 mr-1.5 text-muted-foreground" />
          Shared by: {story.ngoName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 md:space-y-3 pt-2 pb-3 md:pb-4">
        <p className="text-sm text-foreground/90 line-clamp-4">
          {story.storyContent}
        </p>
      </CardContent>
      <CardFooter className="mt-auto border-t pt-3 pb-3 flex justify-end items-center">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <CalendarDays className="h-4 w-4" /> Posted {timeAgo}
        </div>
      </CardFooter>
    </Card>
  );
}
