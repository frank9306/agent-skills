import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {skillRoot,stateRoot} from './client.mjs';
async function sha(file){const h=createHash('sha256');for await(const chunk of createReadStream(file))h.update(chunk);return h.digest('hex');}
export async function prepareModel(source,{out=path.join(stateRoot,'models','multilingual-1720e3e')}={}){
  const expected=JSON.parse(await fs.readFile(path.join(skillRoot,'references/model-manifest.json'),'utf8'));
  async function verify(root){for(const [file,hash]of Object.entries(expected.files))if(await sha(path.join(root,file))!==hash)throw Error('fixed model artifact hash mismatch: '+file);}
  await verify(source);
  let exists=false;try{await fs.access(out);exists=true;}catch(e){if(e.code!=='ENOENT')throw e;}
  if(exists)await verify(out);
  else {
    await fs.mkdir(out,{recursive:true});
    for(const file of Object.keys(expected.files)){await fs.mkdir(path.dirname(path.join(out,file)),{recursive:true});await fs.copyFile(path.join(source,file),path.join(out,file),1);}
    await verify(out);
  }
  await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(expected,null,2),'utf8');
  const configFile=path.join(stateRoot,'runtime.json');let config={};try{config=JSON.parse(await fs.readFile(configFile,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  await fs.mkdir(stateRoot,{recursive:true});config.modelDirectory=path.resolve(out);await fs.writeFile(configFile,JSON.stringify(config,null,2),'utf8');
  return {modelDirectory:config.modelDirectory,revision:expected.sourceRevision,integrity:'verified',download:false};
}
