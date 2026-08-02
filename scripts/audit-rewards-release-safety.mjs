import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
const ignored=new Set(["node_modules",".git","dist",".output","coverage","fixtures","__fixtures__"]);
const allowed=new Set([".ts",".tsx",".js",".mjs"]);
const secret=[/\bVITE_SUPABASE_SERVICE_ROLE(?:_KEY)?\b/,/\bVITE_AFFILIATE_WEBHOOK_SECRET\b/,/\bVITE_CRON_SHARED_SECRET\b/,/\bNEXT_PUBLIC_.*(?:SECRET|SERVICE_ROLE|HMAC)/];
const storage=/(?:localStorage|sessionStorage)\.(?:setItem|getItem)\s*\(\s*["'`](?:[^"'`]*(?:wallet|points|balance|ledger|funding|settlement|commission)[^"'`]*)["'`]/i;
const findings=[];
async function walk(dir){for(const name of await readdir(dir)){if(ignored.has(name))continue;const p=join(dir,name);const s=await stat(p);if(s.isDirectory()){await walk(p);continue}if(!allowed.has(extname(p))||/routeTree\.gen\.ts$|supabase\/types\.ts$|\.(test|spec)\.[jt]sx?$/.test(p))continue;const src=await readFile(p,"utf8");for(const pattern of secret)if(pattern.test(src))findings.push(`${relative(process.cwd(),p)}: browser secret`);if(storage.test(src))findings.push(`${relative(process.cwd(),p)}: financial state in browser storage`)}}
await walk("src");
if(findings.length){console.error(findings.join("\n"));process.exit(1)}
console.log("Rewards release-safety audit passed")
