import { z } from 'zod';
import { questions } from '@/lib/coach';
import { analyzeJob, generateQuestions, evaluateAnswer, providerStatus } from '@/lib/ai';
import { jobSchema, questionSchema } from '@/lib/schemas';
import { allow, session, sameOrigin } from '@/lib/server';

export const runtime = 'nodejs';
const schema = z.object({
  action: z.enum(['analyze', 'questions', 'feedback', 'research']),
  job: jobSchema, answer: z.string().max(12000).optional(),
  questionId: z.string().max(20).optional(), question: questionSchema.optional(),
  transcriptConfirmed: z.boolean().optional(),
});

export async function GET() {
  return Response.json(providerStatus(), { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Cross-site requests are not allowed.' }, { status: 403 });
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 50000) return Response.json({ error: 'Request too large.' }, { status: 413 });
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) return Response.json({ error: 'Check job fields, daily time (10–240 minutes), and input lengths.' }, { status: 400 });
    if (!allow(await session())) return Response.json({ error: 'Practice limit reached (30 requests per hour). Please try later.' }, { status: 429 });
    const { action, job, answer, questionId, transcriptConfirmed } = parsed.data;
    if (action === 'analyze') return Response.json(await analyzeJob(job));
    if (action === 'questions') return Response.json(await generateQuestions(job));
    if (action === 'research') {
      if (!providerStatus().searchConfigured) return Response.json({ sources: [], notice: 'Live research is not configured. Your practice is based on the job description; no company claims have been verified.' });
      try {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SEARCH_API_KEY}` },
          body: JSON.stringify({ query: `${job.company} ${job.title} official careers responsibilities interview experience`, max_results: 5, include_answer: false }),
          signal: AbortSignal.timeout(20000),
        });
        if (!response.ok) throw new Error('Search unavailable');
        const result = await response.json();
        const sources = z.array(z.object({ url: z.string().url(), title: z.string(), content: z.string() })).max(10)
          .parse(result.results).filter(source => /^https?:\/\//.test(source.url)).map(source => ({
            ...source, content: source.content.slice(0, 1600), retrieved: new Date().toISOString(), kind: 'Public search result · unverified excerpt',
          }));
        return Response.json({ sources, notice: 'Public search excerpts are source material, not independently verified company facts. No questions are labeled as source-reported without verification.' });
      } catch {
        return Response.json({ sources: [], notice: 'Search provider failed. Continue with job-description practice or retry research later.' });
      }
    }
    const question = parsed.data.question || questions(job).find(item => item.id === questionId);
    if (!question || !answer?.trim() || transcriptConfirmed !== true) {
      return Response.json({ error: 'Choose a question, review a nonempty transcript, and explicitly confirm it before evaluation.' }, { status: 400 });
    }
    return Response.json(await evaluateAnswer(job, question, answer));
  } catch {
    return Response.json({ error: 'Unable to process this request. Check the input and try again.' }, { status: 400 });
  }
}
