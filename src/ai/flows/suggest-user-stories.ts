'use server';
/**
 * @fileOverview An AI agent that suggests user stories based on task descriptions.
 *
 * - suggestUserStories - A function that generates user stories.
 * - SuggestUserStoriesInput - The input type for the suggestUserStories function.
 * - SuggestUserStoriesOutput - The return type for the suggestUserStories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestUserStoriesInputSchema = z.object({
  taskDescriptions: z.string().describe('A collection of task descriptions, separated by newlines.'),
});
export type SuggestUserStoriesInput = z.infer<typeof SuggestUserStoriesInputSchema>;

const SuggestUserStoriesOutputSchema = z.object({
  userStories: z.array(z.string()).describe('An array of generated user stories in the format "As a [user type], I want to [action] so that [benefit]".'),
});
export type SuggestUserStoriesOutput = z.infer<typeof SuggestUserStoriesOutputSchema>;

export async function suggestUserStories(input: SuggestUserStoriesInput): Promise<SuggestUserStoriesOutput> {
  return suggestUserStoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestUserStoriesPrompt',
  input: {schema: SuggestUserStoriesInputSchema},
  output: {schema: SuggestUserStoriesOutputSchema},
  prompt: `You are an expert product manager specializing in Agile methodologies.
Your task is to analyze a list of technical task descriptions and generate a set of user-focused user stories.

Follow the standard user story format: "As a [user type], I want to [perform some action] so that [I can achieve some goal/benefit]."

Base the [user type], [action], and [benefit] on the details provided in the task descriptions. Infer the user's intent and ultimate goal.

Here are the task descriptions:
{{{taskDescriptions}}}

Generate 3-5 relevant user stories from these tasks.
`,
});

const suggestUserStoriesFlow = ai.defineFlow(
  {
    name: 'suggestUserStoriesFlow',
    inputSchema: SuggestUserStoriesInputSchema,
    outputSchema: SuggestUserStoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
