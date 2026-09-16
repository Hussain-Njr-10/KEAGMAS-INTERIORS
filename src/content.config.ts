import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const projectsCollection = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    location: z.string().optional(),
    year: z.number().optional(),
    category: z.string(),
    heroImage: z.string(),
    media: z.array(z.string()).optional(),
  }),
});

const journalCollection = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/journal" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string(),
    category: z.string(),
    coverImage: z.string(),
  }),
});

export const collections = {
  'projects': projectsCollection,
  'journal': journalCollection,
};
