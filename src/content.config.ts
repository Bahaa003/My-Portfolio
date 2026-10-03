import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared confidentiality levels. Private content must never be rendered
// on any public listing, detail page, or RSS feed — enforced centrally
// in src/lib/collections.ts, not ad hoc per page.
const confidentiality = z.enum(['public', 'redacted', 'private']).default('public');

const writeups = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writeups' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.date(),
      updatedDate: z.date().optional(),
      slug: z.string().optional(), // explicit slug override when useful
      tags: z.array(z.string()).default([]),
      category: z.enum(['web', 'api', 'auth', 'misconfig', 'recon', 'other']),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      technologies: z.array(z.string()).default([]),
      author: z.string().default('Bahaa Aldeen Nawlo'),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      confidentiality,
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.date().optional(),
      slug: z.string().optional(),
      // Broad groupings so /work can aggregate across all of them.
      category: z.enum([
        'professional-security-work',
        'security-investigation',
        'personal-project',
        'research',
      ]),
      tags: z.array(z.string()).default([]),
      status: z.enum(['ongoing', 'completed', 'archived']),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      technologies: z.array(z.string()).default([]),
      confidentiality,
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

const labs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/labs' }),
  schema: z.object({
    title: z.string(),
    // Platform-agnostic: free text rather than a fixed enum, so any
    // legal training platform (PortSwigger, TryHackMe, HTB, etc.) fits
    // without forcing one platform's vocabulary onto another.
    platform: z.string(),
    vulnerabilityCategory: z.string(),
    // Free text as well: PortSwigger uses apprentice/practitioner/expert,
    // TryHackMe uses easy/medium/hard, other platforms differ again.
    // Store whatever the platform actually calls it.
    difficulty: z.string().optional(),
    status: z.enum(['completed', 'in-progress']),
    date: z.date(),
    writeupUrl: z.string().optional(), // internal path or external URL
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.date(),
      updatedDate: z.date().optional(),
      slug: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      confidentiality,
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

export const collections = { writeups, projects, labs, blog };
