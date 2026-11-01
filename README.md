# InterviewCoach AI

A responsive interview-preparation application built with Next.js 16, React, TypeScript, Tailwind CSS 4, and SQLite. Paste a job description, review extracted skills, prepare questions, practise text/voice answers, get coaching feedback, and follow a daily plan.

## Quick start — Windows, macOS, Linux

Install **Node.js 24.5+** (Node 24 LTS recommended; npm is included). Git is needed only if cloning from the terminal. No Python, GPU, CUDA, or separately installed database is required.

```bash
git clone https://github.com/Hkkumarr/-interwier.git interviewcoach-ai
cd interviewcoach-ai
npm run setup
npm run dev
```

Open **http://localhost:3000**. `npm run setup` installs exact dependencies using `npm ci` and creates `.env.local` from the example without replacing an existing file. If you downloaded a ZIP, extract it, open a terminal in the directory containing `package.json`, and start with `npm run setup`.

The same npm commands work in PowerShell, Command Prompt, macOS Terminal, and Linux shells. Check your installation with `node --version` and `npm --version`. Run `npm run doctor` to check Node, dependencies, and whether providers are configured; it never prints keys or claims the remote connection was tested.

[Hindi setup instructions](SETUP_HI.md)

### Which requirements file should I use?

`package.json` declares JavaScript dependencies; `package-lock.json` locks their exact versions. **`npm ci` installs them.** The requested `requirements.txt` is included as an explanatory file: this application has no Python dependencies, and `pip install -r requirements.txt` does not run the website. Do not install Python machine-learning packages to run this app.

## AI and ML: what actually runs?

| Feature | Without credentials | With OpenAI configured |
| --- | --- | --- |
| Job-description analysis | Local skill-vocabulary extraction | Language-model extraction of skills, responsibilities, tools, and experience |
| Questions | Common and reviewed-skill templates | Additional personalized model-generated questions, while preserving all common and reviewed-skill templates |
| Answer evaluation | Transparent text heuristics; technical accuracy, relevance, and coverage unassessed | Model coaching across six explicit criteria, with nullable scores when uncertain |
| Web research | Clear unavailable state | Independent Tavily configuration supplies real source URLs, titles, excerpts, and retrieval timestamps |

The real AI integration calls a pretrained OpenAI language model on the server. This is **not a model trained by this repository**. Training a separate model is unnecessary for this MVP. Browser ASR provides speech-to-text; browser speech synthesis provides text-to-speech. Templates, word counts, and search results are not presented as trained ML models.

Demo mode works immediately, without an account or paid key. Provider configuration status is visible in Settings. Configured means settings are present, not that connectivity or authorization has been verified. Provider failures produce explicit, usable demo fallbacks. Generated questions are never labeled as confirmed company questions. Personal examples use only supplied facts or placeholders.

### Enable real AI and research

Edit the ignored `.env.local` created by setup:

```env
LLM_PROVIDER=openai
LLM_API_KEY=your_openai_api_key
LLM_MODEL=gpt-4.1-mini

SEARCH_PROVIDER=tavily
SEARCH_API_KEY=your_tavily_api_key
```

Either service is optional. Use `LLM_PROVIDER=demo` or `SEARCH_PROVIDER=disabled` to disable it. Restart with `Ctrl+C`, then `npm run dev`. Credentials must be valid for the selected provider and model. AI and search require Internet access; in the managed cloud, allow `api.openai.com` and `api.tavily.com` as needed. Keep proxy and TLS verification enabled.

Never commit `.env.local` or put keys in `NEXT_PUBLIC_` variables. Only the server reads provider credentials. The app sends the entered job information and confirmed answer to OpenAI when live AI is enabled; it sends the role/company search query to Tavily when live research is enabled.

`lib/ai.ts` contains the language-model adapter, safe configuration metadata, and explicit fallbacks. `lib/schemas.ts` validates model output, including six unique feedback criteria. Provider calls have timeouts. Job descriptions, transcripts, and retrieved excerpts are treated as untrusted data, not application instructions.

## Voice: ASR → reviewed text → coaching

1. Local NLG templates or the model supply a practice question.
2. Start or replay reads it with browser `speechSynthesis` (TTS).
3. “Speak answer” requests microphone permission and browser `SpeechRecognition` performs ASR.
4. Stop, edit the transcript, and explicitly confirm it. The server also requires confirmation before evaluation.
5. Submit the confirmed text to receive AI or demo feedback; retry, skip, replay, or end the interview.

Use Chrome on localhost or a secure HTTPS site for the best chance of browser voice support. Recognition availability, Hindi/Hinglish accuracy, and voice selection depend on the browser and vendor service. Microphone denial and transcription failures leave text practice available. Browser recognition may send audio to its vendor; this app never retains raw audio. Speech adapters (`record` and `speak`) live in `app/page.tsx` and can be replaced while preserving transcript review.

Common question templates are English. Configured AI role questions and feedback follow the preferred language. The daily plan prioritizes user-reported weak topics and includes HR practice, project explanations, and mock interviews. Feedback recommends the next practice step. The plan is capped at 30 days.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run setup` | Locked dependency installation and safe environment-file creation |
| `npm run doctor` | Local Node/dependency/provider configuration check |
| `npm run dev` | Development server on port 3000 |
| `npm run dev -- --port 3001` | Development server on another port |
| `npm run typecheck` | TypeScript validation |
| `npm test` | Domain and mocked provider tests |
| `npm run build` | Production build |
| `npm start` | Run the production build |

Node's built-in SQLite experimental warning is expected. If a port is busy, stop the existing server with `Ctrl+C` or select another port. After editing `.env.local`, restart the server. If AI cannot connect, check provider settings, key permissions, billing, and network access; do not paste secret keys in issues or chat.

In a managed cloud task, use the existing isolated checkout rather than creating another Git worktree. Live server processes do not survive snapshots; restart them in later tasks. On Windows, the npm scripts use a portable Node launcher instead of Unix-only environment-variable assignment syntax.

## Data and scope

SQLite at `.data/coach.sqlite` holds job details, confirmed transcripts, feedback, bookmarks, and plan progress. A random HttpOnly, SameSite browser cookie identifies the local session. The cookie lasts 30 days; records remain until deleted. Settings → Delete all preparation data removes saved preparation records, and deletion cancels pending autosaves. No raw audio or resumes are stored.

This is a functional **local MVP**, not a claim of a complete public SaaS product. Account authentication, production retention cleanup, hosted storage, PDF/DOCX resume import, and advanced company research remain future work. Coaching feedback is not a hiring prediction. Local limits (30 coaching requests/session/hour and bounded inputs) are not deployment-wide abuse protection.

## Validation evidence

Tests cover local extraction, skill-name boundaries, mandatory common and skill-specific questions, honest demo evaluation, time-bounded planning, real-provider request formatting with mocked responses, validated AI extraction/questions/feedback, missing credentials, invalid model output, HTTP failures, and duplicate assessment criteria.

Browser workflow validation covers reviewed skills → question bank → bookmarks → confirmed answer → coaching → persisted history → research fallback → plan completion → mobile fit → data deletion. Mocked browser speech tests cover TTS → ASR → correction → confirmation → feedback and microphone denial. Mocked provider tests do **not** establish a successful live OpenAI/Tavily call. Live provider requests and actual microphone recognition require user credentials and a supported browser.

The separate sibling handwriting recognition repository is unrelated to this app and remains dependent on its missing trained `model.pth`. InterviewCoach AI does not import or train that model.
