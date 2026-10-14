#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { checkUI, verifyUIReport } from './check-ui.mjs';

const usage='node verify-ui.mjs --contract <case.json> --project-root <project> [--runtime-root <dir>] [--channel chrome|msedge] [--out <dir>]\nnode verify-ui.mjs --verify-report <report.json> [--project-root <relocated-project>]';
let browser;
try {
  const args=process.argv.slice(2), options={};
  if(args.length===1&&args[0]==='--help'){console.log(usage);process.exitCode=0;}
  else {
    const allowed=new Set(['--contract','--project-root','--runtime-root','--out','--channel','--verify-report']);
    for(let i=0;i<args.length;i+=2){
      if(!allowed.has(args[i])||!args[i+1]||args[i+1].startsWith('--')||options[args[i]])throw new Error('Invalid or duplicate arguments. '+usage);
      options[args[i]]=args[i+1];
    }
    let result;
    if(options['--verify-report']){
      if(options['--contract']||options['--runtime-root']||options['--channel']||options['--out'])throw new Error('Report verification only accepts report and optional project root');
      result=await verifyUIReport(path.resolve(options['--verify-report']),{projectRoot:options['--project-root']?path.resolve(options['--project-root']):undefined});
    }else{
      if(!options['--contract']||!options['--project-root'])throw new Error(usage);
      const projectRoot=await fs.realpath(path.resolve(options['--project-root']));
      const contractPath=await fs.realpath(path.resolve(options['--contract']));
      const relative=path.relative(projectRoot,contractPath);
      if(relative==='..'||relative.startsWith(`..${path.sep}`)||path.isAbsolute(relative))throw new Error('contract must be inside project root');
      const contract=JSON.parse(await fs.readFile(contractPath,'utf8'));
      if(typeof contract.url!=='string'||!contract.url)throw new Error('CLI contract needs a prepared url');
      if(!Array.isArray(contract.inputs)||!contract.inputs.length)throw new Error('CLI contract needs source/data/resource inputs');
      const runtimeRoot=await fs.realpath(path.resolve(options['--runtime-root']??projectRoot));
      if(!(await fs.stat(runtimeRoot)).isDirectory())throw new Error('runtime root must be an existing directory');
      const require=createRequire(path.join(runtimeRoot,'package.json'));
      let runtime;
      for(const name of ['@playwright/test','playwright']){
        let resolved;
        try{resolved=require.resolve(name);}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;continue;}
        runtime=require(resolved);break;
      }
      if(!runtime?.chromium)throw new Error('Playwright is unavailable in selected runtime root; install it separately or pass --runtime-root');
      browser=await runtime.chromium.launch({headless:true,...(options['--channel']?{channel:options['--channel']}:{})});
      const context=await browser.newContext({viewport:contract.viewport,colorScheme:contract.colorScheme,locale:'en-US',timezoneId:'UTC'});
      const page=await context.newPage();
      try{await page.goto(contract.url,{waitUntil:'domcontentloaded',timeout:30000});}
      catch{throw new Error('Prepared page navigation failed; verify its URL, server and browser access locally. URL details are omitted from this report.');}
      result=await checkUI(page,contract,{projectRoot,inputs:[...new Set([...contract.inputs,relative])],outDir:path.resolve(options['--out']??path.join(projectRoot,'.ui-evidence'))});
      if(result.evidence.status!=='bound'&&result.status==='pass'){result.status='unverified';result.error='File-bound evidence was not completed';}
    }
    process.stdout.write(JSON.stringify(result,null,2)+'\n');
    process.exitCode=result.status==='pass'?0:result.status==='fail'?1:2;
  }
}catch(error){process.stdout.write(JSON.stringify({version:1,status:'unverified',error:error.message})+'\n');process.exitCode=2;}
finally{await browser?.close();}
