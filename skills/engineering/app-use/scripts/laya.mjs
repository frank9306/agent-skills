import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {stateRoot} from './client.mjs';

export class LocalLaya {
  static async create(modelDir){
    const config=JSON.parse(await fs.readFile(path.join(stateRoot,'runtime.json'),'utf8'));
    if(!config.layaExecutable)throw Error('prepare --laya first; local worker is unavailable');
    modelDir||=config.modelDirectory;if(!modelDir)throw Error('prepare --model-source or provide --model-dir for semantic branches');
    return new LocalLaya(config.layaExecutable,modelDir);
  }
  constructor(executable,modelDir){this.executable=executable;this.modelDir=modelDir;this.busy=false;}
  async judge(request,{signal,timeoutMs=60000}={}){
    if(this.busy)throw Error('Laya worker is busy');signal?.throwIfAborted();this.busy=true;
    if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>60000){this.busy=false;throw Error('invalid local model timeout');}
    // One process per declared judgment: timeout/cancellation has a complete kill boundary.
    const child=spawn(this.executable,[this.modelDir],{stdio:['pipe','pipe','pipe'],windowsHide:true});this.child=child;
    child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');let output='',diagnostic='',timer,abort,settled=false;
    try{return await new Promise((resolve,reject)=>{
      const finish=(error,value)=>{if(settled)return;settled=true;child.kill();error?reject(error):resolve(value);};
      timer=setTimeout(()=>finish(Error('local model timeout')),timeoutMs);
      abort=()=>finish(signal.reason||Error('stopped'));signal?.addEventListener('abort',abort,{once:true});
      child.on('error',e=>finish(e));child.stderr.on('data',d=>{diagnostic=(diagnostic+d).slice(-2000);});
      child.stdout.on('data',d=>{output+=d;if(output.length>100000)return finish(Error('model reply too large'));const end=output.indexOf('\n');if(end>=0){try{finish(null,JSON.parse(output.slice(0,end)));}catch{finish(Error('invalid local model JSON'));}}});
      child.on('close',code=>{if(!output.includes('\n'))finish(Error(diagnostic||`local worker exited ${code}`));});
      child.stdin.on('error',e=>finish(e));child.stdin.end(JSON.stringify(request)+'\n');
    });}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);child.kill();this.child=null;this.busy=false;}
  }
  close(){this.child?.kill();}
}
