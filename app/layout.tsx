import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'InterviewCoach AI — Your next chapter starts here', description: 'A thoughtful workspace to prepare, practise, and grow for your next interview.' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
