import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {cookies} from 'next/headers';
import {randomUUID} from 'node:crypto';
let database:DatabaseSync;
export function db(){if(!database){mkdirSync(join(process.cwd(),'.data'),{recursive:true});database=new DatabaseSync(join(process.cwd(),'.data','coach.sqlite'));database.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS usage (id TEXT PRIMARY KEY, count INTEGER NOT NULL, reset INTEGER NOT NULL)');}return database}
export async function session(){const jar=await cookies();let id=jar.get('coach_session')?.value;if(!id||!/^[a-f0-9-]{36}$/.test(id)){id=randomUUID();jar.set('coach_session',id,{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*24*30});}return id}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');const site=request.headers.get('sec-fetch-site');try{return site!=='cross-site'&&(!origin||new URL(origin).host===(request.headers.get('host')||new URL(request.url).host))}catch{return false}}
export function allow(id:string){const now=Date.now();const row=db().prepare('SELECT count,reset FROM usage WHERE id=?').get(id) as {count:number;reset:number}|undefined;if(!row||row.reset<now){db().prepare('INSERT OR REPLACE INTO usage VALUES (?,1,?)').run(id,now+3600000);return true}if(row.count>=30)return false;db().prepare('UPDATE usage SET count=count+1 WHERE id=?').run(id);return true}
