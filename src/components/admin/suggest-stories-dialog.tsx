'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2 } from 'lucide-react';
import { TASKS } from '@/lib/data';
import { suggestUserStories } from '@/ai/flows/suggest-user-stories';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

export function SuggestStoriesDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [stories, setStories] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSuggestStories = () => {
    startTransition(async () => {
      try {
        setStories([]);
        const taskDescriptions = TASKS.map(t => t.description).join('\n\n');
        const result = await suggestUserStories({ taskDescriptions });
        setStories(result.userStories);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'AI Suggestion Failed',
          description: 'Could not generate user stories at this time.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleSuggestStories}>
          <Lightbulb className="mr-2 h-4 w-4" />
          Suggest User Stories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI-Powered User Story Suggestions</DialogTitle>
          <DialogDescription>
            Based on the current tasks, here are some potential user stories.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
            {isPending ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">Generating stories...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {stories.map((story, index) => (
                        <Card key={index}>
                            <CardContent className="p-4">
                                <p className="text-sm">{story}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
