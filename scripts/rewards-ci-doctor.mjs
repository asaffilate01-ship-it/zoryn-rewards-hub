import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
const required=["package.json","package-lock.json","tsconfig.json","supabase/config.toml","vitest.rewards-critical.config.ts","playwright.release.config.ts"];
const errors=[];
for(const file of required){try{await access(file,constants.R_OK)}catch{errors.push(`Missing required file: ${file}`)}}
const pkg=JSON.parse(await readFile("package.json","utf8"));
for(const name of ["build","lint","typecheck","test:critical:coverage","test:e2e:release","audit:release-safety"]){if(!pkg.scripts?.[name])errors.push(`Missing package script: ${name}`)}
try{
 const migrations=(await readdir("supabase/migrations")).filter(x=>x.endsWith(".sql"));
 const seen=new Map();
 for(const name of migrations){const ts=name.split("_")[0];seen.set(ts,[...(seen.get(ts)??[]),name])}
 for(const [ts,names] of seen){if(names.length>1)errors.push(`Duplicate migration timestamp ${ts}: ${names.join(", ")}`)}
}catch{errors.push("Unable to inspect migrations")}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log("Rewards CI doctor passed")
