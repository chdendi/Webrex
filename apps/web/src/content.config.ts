import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const shortcutSchema = z.object({
  label: z.string(),
  mac: z.string(),
  win: z.string(),
});

const conceptStep = z.object({
  slug: z.literal('concept'),
  type: z.literal('concept'),
  title: z.string(),
  hook: z.string().optional(),
  body: z.array(z.string()),
  bullets: z
    .array(
      z.object({
        emoji: z.string().optional(),
        title: z.string(),
        body: z.string().optional(),
      }),
    )
    .optional(),
  takeaway: z.string().optional(),
});

const practiceStep = z.object({
  slug: z.literal('practice'),
  type: z.literal('practice'),
  title: z.string(),
  intro: z.string().optional(),
  steps: z.array(z.string()),
  shortcuts: z.array(shortcutSchema).optional(),
  expectedOutcome: z.string().optional(),
  labUrl: z.string().optional(),
  externalSite: z.string().optional(),
});

const verifyStep = z.object({
  slug: z.literal('verify'),
  type: z.literal('verify'),
  title: z.string(),
  prompt: z.string(),
  tier: z.enum(['hard', 'soft', 'self', 'choice']),
  expectedRegex: z.string().optional(),
  labCheckEndpoint: z.string().optional(),
  options: z
    .array(
      z.object({
        label: z.string(),
        correct: z.boolean(),
        hint: z.string().optional(),
      }),
    )
    .optional(),
  revealOption: z
    .object({
      label: z.string(),
      correct: z.boolean(),
      hint: z.string().optional(),
    })
    .optional(),
});

const askAiStep = z.object({
  slug: z.literal('ask-ai'),
  type: z.literal('ask-ai'),
  title: z.string(),
  intro: z.string().optional(),
  template: z.string(),
});

const stepSchema = z.discriminatedUnion('type', [conceptStep, practiceStep, verifyStep, askAiStep]);

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.json', base: 'src/data/lessons' }),
  schema: z.object({
    id: z.string(),
    level: z.number().int().min(0).max(13),
    sublevel: z.number().int().min(1),
    categoryIcon: z.string(),
    categoryName: z.string(),
    title: z.string(),
    time: z.number().int().min(1),
    track: z.enum(['core', 'extension']),
    needsLab: z.boolean(),
    steps: z.array(stepSchema).optional(),
    stuck: z.string().optional(),
  }),
});

export const collections = { lessons };
