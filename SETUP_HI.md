# InterviewCoach AI ko apne computer par kaise chalayein

## 1. Node.js install karein

Node.js **24 LTS**, version **24.5 ya newer**, install karein. Uske baad terminal mein check karein:

```bash
node --version
npm --version
```

Is app ke liye Python, PyTorch, TensorFlow, GPU ya alag SQLite installation ki zarurat nahi hai.

## 2. Code download karein

```bash
git clone https://github.com/Hkkumarr/-interwier.git interviewcoach-ai
cd interviewcoach-ai
npm run setup
npm run dev
```

Git nahi hai toh GitHub se ZIP download karke extract karein. Jis folder mein `package.json` hai, usmein terminal kholein, phir `npm run setup` aur `npm run dev` chalayein.

Browser mein **http://localhost:3000** kholein. Yeh commands Windows PowerShell / CMD, macOS aur Linux par chalti hain. Setup pehle se maujood `.env.local` ko overwrite nahi karta.

## 3. AI kaise enable hoga?

Bina keys ke demo questions aur basic rule-based coaching chalti hai. Demo technical accuracy verify nahi karta. Real AI ke liye `.env.local` mein yeh settings dein:

```env
LLM_PROVIDER=openai
LLM_API_KEY=your_openai_api_key
LLM_MODEL=gpt-4.1-mini
```

Company/role ki live search ke liye optional settings:

```env
SEARCH_PROVIDER=tavily
SEARCH_API_KEY=your_tavily_api_key
```

Sirf apne provider ki valid keys use karein. Provider account ki billing/usage conditions apply hoti hain. Keys GitHub ya chat mein share na karein. File change karne ke baad `Ctrl+C` se server stop karke `npm run dev` dobara chalayein.

Yahan pretrained AI model API se use hota hai; repository apna ML model train nahi karti. Browser speech recognition aapki voice ko text mein badalta hai; text confirm karne ke baad AI feedback deta hai. Actual service calls ke liye Internet zaroori hai.

## 4. requirements.txt ka kya kaam hai?

Aapke liye `requirements.txt` diya gaya hai, lekin usmein samjhaya gaya hai ki yeh Python project nahi hai. Asli dependencies **package.json** aur **package-lock.json** mein hain. Unhein `npm run setup` ya `npm ci` install karta hai. Sirf `pip install -r requirements.txt` se website nahi chalegi.

## 5. Problem aaye toh

- `npm run doctor` se Node version, dependencies aur provider settings check karein. Yeh keys print nahi karta.
- Port busy ho toh `npm run dev -- --port 3001` chalakar http://localhost:3001 kholein.
- Voice ke liye Chrome try karein aur “Speak answer” par microphone permission dein. Voice unavailable ho toh answer type karein.
- AI error aaye toh provider key, billing, model access aur Internet check karein. App clear message ke saath demo fallback deta hai.
- Saved data delete karne ke liye app ke Settings mein “Delete all preparation data” use karein.

Validation ke liye `npm run typecheck`, `npm test`, aur `npm run build` chalayein. Production build ko `npm start` se chala sakte hain.

Yeh working local MVP hai. Resume upload, public-user login aur production hosting hardening abhi implement nahi hain. Live AI/search ko apni key se aur actual microphone recognition ko apne browser par verify karein.
