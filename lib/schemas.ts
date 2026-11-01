import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().max(150), company: z.string().max(150),
  description: z.string().max(15000),
  level: z.enum(['Fresher', 'Junior', 'Experienced']),
  date: z.string().max(20), minutes: z.number().min(10).max(240),
  language: z.enum(['English', 'Hindi', 'Hinglish']),
  skills: z.array(z.string().trim().min(1).max(80)).max(30),
  strengths: z.string().max(2000), weaknesses: z.string().max(2000),
});
export const questionSchema = z.object({
  id: z.string().max(20), text: z.string().trim().min(1).max(1000),
  category: z.enum(['Common HR', 'Projects', 'Technical', 'JD skills', 'Practical', 'Behavioral', 'Company & role']),
  skill: z.string().min(1).max(80), difficulty: z.enum(['Foundation', 'Intermediate']),
  why: z.string().min(1).max(2000),
  points: z.array(z.string().min(1).max(1000)).min(1).max(8),
  framework: z.string().min(1).max(3000),
  followups: z.array(z.string().min(1).max(1000)).min(1).max(5),
  mistakes: z.array(z.string().min(1).max(1000)).min(1).max(5),
  origin: z.string().max(200),
});
export const extractionSchema = z.object({
  skills: z.array(z.string().trim().min(1).max(80)).max(30),
  responsibilities: z.array(z.string().min(1).max(1500)).max(8),
  tools: z.array(z.string().min(1).max(80)).max(30),
  experience: z.array(z.string().min(1).max(1000)).max(8),
});
export const criterionNames = ['Relevance', 'Technical correctness', 'Key-point coverage', 'Structure & clarity', 'Specific examples', 'Conciseness'] as const;
export const feedbackSchema = z.object({
  criteria: z.array(z.object({
    name: z.enum(criterionNames), score: z.number().int().min(1).max(5).nullable(),
    explanation: z.string().min(1).max(2000),
  })).length(6).refine(items => new Set(items.map(item => item.name)).size === 6, 'Every criterion must appear exactly once'),
  well: z.string().min(1).max(3000), missing: z.string().min(1).max(3000),
  structure: z.string().min(1).max(3000), improved: z.string().min(1).max(6000), next: z.string().min(1).max(2000),
});
