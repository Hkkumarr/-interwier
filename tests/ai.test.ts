import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeJob, generateQuestions, evaluateAnswer, providerStatus } from '../lib/ai';
import { common, questions, type Job } from '../lib/coach';
import { criterionNames } from '../lib/schemas';

const job: Job = { title: 'Frontend developer', company: 'Example', description: 'Build React interfaces with accessibility. Fresher role.', level: 'Fresher', date: '2099-01-01', minutes: 30, language: 'Hindi', skills: ['React', 'Accessibility'], strengths: '', weaknesses: '' };
const env = { LLM_PROVIDER: 'openai', LLM_API_KEY: 'unit-test-placeholder', LLM_MODEL: 'test-model' };
function reply(output: unknown): typeof fetch {
  return async () => Response.json({ choices: [{ message: { content: JSON.stringify(output) } }] });
}
const generated = { text: 'How would you make a dialog accessible?', category: 'Technical', skill: 'Accessibility', difficulty: 'Intermediate', why: 'Accessibility is a reviewed role requirement.', points: ['Focus handling', 'Keyboard interactions', 'Accessible names'], framework: 'Explain the concept, then use a real project example.', followups: ['How would you test it?'], mistakes: ['Ignoring keyboard access'] };
const assessment = { criteria: criterionNames.map(name => ({ name, score: name === 'Technical correctness' ? null : 3, explanation: 'Practice review; verify factual claims.' })), well: 'You described your approach.', missing: 'Provide a specific example.', structure: 'Direct answer, reasoning, example.', improved: 'In [your actual project], I [your action].', next: 'Practise a concrete example.' };

test('provider status distinguishes missing credentials and never exposes keys', () => {
  assert.equal(providerStatus({}).aiConfigured, false);
  assert.equal(providerStatus({ LLM_PROVIDER: 'openai' }).ai, 'demo');
  assert.equal(providerStatus(env).aiConfigured, true);
  assert(!JSON.stringify(providerStatus(env)).includes(env.LLM_API_KEY));
});

test('demo mode performs no external AI request', async () => {
  const noNetwork: typeof fetch = async () => { throw Error('Unexpected network call'); };
  const result = await analyzeJob(job, { env: {}, fetch: noNetwork });
  assert(result.mode.startsWith('Demo'));
  assert(result.skills.includes('React'));
  const feedback = await evaluateAnswer(job, questions(job)[0], 'A short answer.', { env: {}, fetch: noNetwork });
  assert(feedback.mode.startsWith('Demo'));
});

test('AI extraction submits untrusted data separately and validates extracted requirements', async () => {
  const output = { skills: ['React'], responsibilities: ['Build interfaces'], tools: [], experience: ['Fresher'] };
  const send: typeof fetch = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/chat/completions');
    const body = JSON.parse(String(options?.body));
    assert.equal(body.model, 'test-model');
    assert(body.messages[0].content.includes('untrusted data'));
    assert.equal(JSON.parse(body.messages[1].content).description, job.description);
    assert(options?.signal);
    return reply(output)(url, options);
  };
  const result = await analyzeJob(job, { env, fetch: send });
  assert(result.mode.startsWith('AI analysis'));
  assert.deepEqual(result.skills, ['React']);
});

test('generated questions keep all common questions and reviewed-skill coverage', async () => {
  const result = await generateQuestions(job, { env, fetch: reply({ questions: [generated] }) });
  assert(result.mode.startsWith('AI-generated'));
  for (const text of common) assert(result.questions.some(question => question.text === text));
  for (const skill of job.skills) assert(result.questions.some(question => question.skill === skill));
  assert(result.questions.some(question => question.id === 'ai-0'));
  assert(result.questions.every(question => question.origin.includes('not confirmed')));
});

test('provider HTTP failure and malformed output produce explicit demo fallbacks', async () => {
  const failed: typeof fetch = async () => new Response('Unavailable', { status: 503 });
  const analysis = await analyzeJob(job, { env, fetch: failed });
  assert('warning' in analysis);
  assert(analysis.mode.startsWith('Demo'));
  const bank = await generateQuestions(job, { env, fetch: reply({ questions: [{ text: 'Missing metadata' }] }) });
  assert('warning' in bank);
  assert(bank.mode.startsWith('Demo'));
  const feedback = await evaluateAnswer(job, questions(job)[0], 'My answer.', { env, fetch: async () => Response.json({ choices: [] }) });
  assert('warning' in feedback);
  assert.equal(feedback.criteria.find(criterion => criterion.name === 'Technical correctness')?.score, null);
});

test('AI feedback validates all six unique criteria and preserves uncertainty', async () => {
  const result = await evaluateAnswer(job, questions(job)[0], 'A confirmed answer.', { env, fetch: reply(assessment) });
  assert(result.mode.startsWith('AI coaching'));
  assert.equal(result.criteria.length, 6);
  assert.equal(result.criteria.find(criterion => criterion.name === 'Technical correctness')?.score, null);
  const duplicate = { ...assessment, criteria: Array.from({ length: 6 }, () => assessment.criteria[0]) };
  const invalid = await evaluateAnswer(job, questions(job)[0], 'A confirmed answer.', { env, fetch: reply(duplicate) });
  assert(invalid.mode.startsWith('Demo'));
  assert('warning' in invalid);
});
