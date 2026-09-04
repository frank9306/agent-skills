#!/usr/bin/env python3
"""Read-only Codex harness efficiency audit for one project."""
from __future__ import annotations
import argparse, hashlib, json, os, re, sqlite3, sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

TOKEN_KEYS=("input_tokens","cached_input_tokens","cache_write_input_tokens","output_tokens","reasoning_output_tokens","total_tokens")
VERIFY_RE=re.compile(r"(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?(?:test|check|lint|build)|pytest|unittest|cargo\s+test|go\s+test|dotnet\s+test|mvn\s+test|gradle\w*\s+test",re.I)

def canonical(path): return os.path.normcase(os.path.realpath(os.path.abspath(os.path.expanduser(str(path)))))
def within(path,root):
    try:return os.path.commonpath((path,root))==root
    except ValueError:return False
def origin(value):
    if not value:return None
    value=value.strip().lower().replace("\\","/")
    if value.startswith("git@") and ":" in value:
        host,path=value[4:].split(":",1);value=f"https://{host}/{path}"
    return value.removesuffix(".git").rstrip("/")
def parse_time(value):
    try:return datetime.fromisoformat(str(value).replace("Z","+00:00")).astimezone(timezone.utc)
    except (TypeError,ValueError):return None
def select_home(explicit):
    if explicit:return Path(explicit).expanduser().resolve(),"explicit"
    if os.environ.get("CODEX_HOME"):return Path(os.environ["CODEX_HOME"]).expanduser().resolve(),"environment"
    return (Path.home()/".codex").resolve(),"default"
def discover(home):
    files=[]
    for folder in ("sessions","archived_sessions"):
        root=home/folder
        if root.is_dir():files.extend(sorted(root.rglob("*.jsonl")))
    return files
def read_session(path):
    records=[];warnings=[]
    try:
        with path.open("r",encoding="utf-8") as stream:
            for number,line in enumerate(stream,1):
                try:
                    item=json.loads(line)
                    if isinstance(item,dict):records.append(item)
                except (json.JSONDecodeError,UnicodeDecodeError):warnings.append(f"malformed_json:{path.name}:{number}")
    except OSError as error:warnings.append(f"unreadable:{path.name}:{type(error).__name__}")
    return records,warnings
def load_state(home):
    path=home/"state_5.sqlite"
    if not path.is_file():return {},["state_db_missing:path_only_matching"]
    result={}
    try:
        db=sqlite3.connect(f"file:{path.as_posix()}?mode=ro",uri=True);db.row_factory=sqlite3.Row
        columns={row[1] for row in db.execute("PRAGMA table_info(threads)")}
        wanted=[x for x in ("id","rollout_path","cwd","project_id","git_origin_url","git_sha","git_branch","model","reasoning_effort","agent_role") if x in columns]
        if not {"id","rollout_path","cwd"}.issubset(wanted):db.close();return {},["state_db_incompatible:path_only_matching"]
        for row in db.execute(f"SELECT {','.join(wanted)} FROM threads"):
            item=dict(row);result[canonical(item["rollout_path"])]=item
        db.close();return result,[]
    except (sqlite3.Error,OSError):return {},["state_db_unreadable:path_only_matching"]
def token_values(value):return Counter({key:int(value.get(key,0) or 0) for key in TOKEN_KEYS})
def failed(output):
    try:
        value=json.loads(str(output))
        if isinstance(value,dict):
            if value.get("isError") is True or value.get("is_error") is True:return True
            if value.get("exit_code") is not None:return int(value["exit_code"])!=0
    except (json.JSONDecodeError,TypeError,ValueError):pass
    text=str(output)[:4000].lower();return any(x in text for x in ("traceback","exception:","script failed","command failed"))
def succeeded(output):
    try:
        value=json.loads(str(output));return isinstance(value,dict) and int(value.get("exit_code",-1))==0
    except (json.JSONDecodeError,TypeError,ValueError):return False

def metrics(records,state):
    totals=Counter();inputs=[];calls=[];outputs={};models=Counter();finals=interruptions=verified=reasoning_heavy=subagents=0
    model=state.get("model") or "unknown";effort=state.get("reasoning_effort") or "unknown"
    for record in records:
        payload=record.get("payload",{});kind=record.get("type");subtype=payload.get("type")
        if kind=="turn_context":model=payload.get("model") or model;effort=payload.get("effort") or payload.get("reasoning_effort") or effort
        elif kind=="event_msg" and subtype=="token_count":
            value=(payload.get("info") or {}).get("last_token_usage")
            if isinstance(value,dict):
                tokens=token_values(value);totals.update(tokens);inputs.append(sum(tokens[k] for k in TOKEN_KEYS[:3]));models[model]+=tokens["total_tokens"] or sum(tokens[k] for k in TOKEN_KEYS[:-1])
                if tokens["reasoning_output_tokens"]>max(1000,tokens["output_tokens"]):reasoning_heavy+=1
        elif kind=="response_item" and subtype in ("function_call","custom_tool_call"):
            name=str(payload.get("name") or payload.get("tool_name") or "unknown");args=payload.get("arguments",payload.get("input",""))
            if not isinstance(args,str):args=json.dumps(args,sort_keys=True,ensure_ascii=False)
            calls.append((payload.get("call_id") or payload.get("id"),name,args,hashlib.sha256((name+"\0"+args).encode("utf-8","replace")).hexdigest()))
            if "agent" in name.lower() or name.lower()=="create_thread":subagents+=1
        elif kind=="response_item" and subtype in ("function_call_output","custom_tool_call_output"):outputs[payload.get("call_id") or payload.get("id")]=payload.get("output","")
        elif kind=="event_msg" and subtype=="agent_message" and payload.get("phase")=="final_answer":finals+=1
        elif kind=="event_msg" and subtype in ("turn_aborted","task_aborted"):interruptions+=1
    failures=sum(failed(outputs[cid]) for cid,_,_,_ in calls if cid in outputs);repeats=sum(n-1 for n in Counter(sig for *_,sig in calls).values() if n>1)
    for cid,_,args,_ in calls:
        if VERIFY_RE.search(args) and cid in outputs and succeeded(outputs[cid]):verified+=1
    return {"tokens":totals,"inputs":inputs,"token_calls":len(inputs),"tool_calls":len(calls),"tool_failures":failures,"repeated_calls":repeats,"reasoning_heavy_calls":reasoning_heavy,"subagent_calls":subagents,"final_answers":finals,"interruptions":interruptions,"successful_verifications":verified,"models":models,"effort":effort}

def collect(project,home,since,checkout_only):
    project_key=canonical(project);state,warnings=load_state(home)
    current=[row for row in state.values() if row.get("cwd") and within(canonical(row["cwd"]),project_key)]
    ids={row.get("project_id") for row in current if row.get("project_id")};origins={origin(row.get("git_origin_url")) for row in current if origin(row.get("git_origin_url"))}
    seen=set();sessions=[];excluded=duplicates=0;files=discover(home)
    for path in files:
        records,problems=read_session(path);warnings.extend(problems);meta=next((r.get("payload",{}) for r in records if r.get("type")=="session_meta"),{})
        sid=str(meta.get("id") or meta.get("session_id") or canonical(path))
        if sid in seen:duplicates+=1;continue
        seen.add(sid);cwd=meta.get("cwd");stamp=parse_time(meta.get("timestamp")) or parse_time(records[0].get("timestamp") if records else None)
        if not cwd or (stamp and stamp<since):excluded+=1;continue
        row=state.get(canonical(path),{});is_current=within(canonical(cwd),project_key)
        same_id=bool(row.get("project_id") and row.get("project_id") in ids);same_origin=bool(origin(row.get("git_origin_url")) and origin(row.get("git_origin_url")) in origins)
        is_worktree=not is_current and (same_id or same_origin)
        if not is_current and not (is_worktree and not checkout_only):excluded+=1;continue
        sessions.append({"group":"current_checkout" if is_current else "worktrees","branch":row.get("git_branch") or "unknown","metrics":metrics(records,row)})
    return {"sessions":sessions,"warnings":warnings,"excluded":excluded,"duplicates":duplicates,"candidate":len(files)}

def take(score,points,code,evidence,findings):
    points=min(score,max(0,round(points,1)))
    if points:findings.append({"code":code,"points":points,"evidence":evidence})
    return score-points
def score(sessions,warnings):
    ms=[s["metrics"] for s in sessions];calls=sum(x["token_calls"] for x in ms);tools=sum(x["tool_calls"] for x in ms);failures=sum(x["tool_failures"] for x in ms);repeats=sum(x["repeated_calls"] for x in ms);verified=sum(x["successful_verifications"] for x in ms);interrupts=sum(x["interruptions"] for x in ms);all_inputs=[v for x in ms for v in x["inputs"]];totals=Counter()
    for x in ms:totals.update(x["tokens"])
    dimensions={};findings=[];value=100.0
    growth=sum(bool(x["inputs"] and max(x["inputs"])>=50000 and max(x["inputs"])>=max(1,min(x["inputs"]))*4) for x in ms);large=sum(v>=100000 for v in all_inputs)/max(1,len(all_inputs))
    cached=totals["cached_input_tokens"];input_total=totals["input_tokens"]+cached+totals["cache_write_input_tokens"];cache_share=cached/max(1,input_total)
    value=take(value,min(45,growth/max(1,len(ms))*50),"context_growth",{"affected_sessions":growth,"large_call_share":round(large,3)},findings);value=take(value,min(25,large*40),"large_context",{"share":round(large,3),"threshold_tokens":100000},findings)
    if input_total>=100000 and cache_share<.1:value=take(value,15,"low_cache_reuse",{"cached_input_share":round(cache_share,3),"input_tokens":input_total},findings)
    dimensions["context_efficiency"]=round(value,1)
    value=100.0;fr=failures/max(1,tools);rr=repeats/max(1,tools);value=take(value,min(60,fr*160),"tool_failures",{"count":failures,"rate":round(fr,3)},findings);value=take(value,min(40,rr*100),"repeated_calls",{"count":repeats,"rate":round(rr,3)},findings);dimensions["tool_efficiency"]=round(value,1)
    value=100.0;long=sum(x["token_calls"]>40 for x in ms)/max(1,len(ms));delegated=sum(x["subagent_calls"] for x in ms)
    value=take(value,min(55,long*70),"long_trajectories",{"session_share":round(long,3)},findings)
    if delegated>len(ms)*2:value=take(value,min(30,(delegated-len(ms)*2)*5),"heavy_delegation",{"subagent_calls":delegated,"sessions":len(ms)},findings)
    dimensions["trajectory_efficiency"]=round(value,1)
    value=100.0;reasoning=totals["reasoning_output_tokens"];share=reasoning/max(1,reasoning+totals["output_tokens"])
    if share>.7:value=take(value,min(50,(share-.7)*100),"reasoning_overhead",{"share":round(share,3)},findings)
    dimensions["model_reasoning_efficiency"]=round(value,1)
    value=100.0;value=take(value,min(50,interrupts*10),"interruptions",{"count":interrupts},findings);missing=sum(not x["final_answers"] for x in ms);value=take(value,min(35,missing/max(1,len(ms))*40),"missing_final_answers",{"count":missing},findings);dimensions["stability"]=round(value,1)
    operational=round(dimensions["context_efficiency"]*20/75+dimensions["tool_efficiency"]*20/75+dimensions["trajectory_efficiency"]*15/75+dimensions["model_reasoning_efficiency"]*10/75+dimensions["stability"]*10/75,1);completion=round(min(100,verified/max(1,len(ms))*100),1) if verified else None;composite=round(operational*.75+completion*.25,1) if completion is not None else None;confidence="high" if len(ms)>=20 and calls>=100 and len(warnings)<=2 else "medium" if len(ms)>=5 and calls>=20 else "low"
    evidence={"token_bearing_calls":calls,"tool_calls":tools,"tool_failures":failures,"repeated_calls":repeats,"successful_verifications":verified,"interruptions":interrupts}
    return {"operational_efficiency":operational,"composite_harness":composite,"completion_evidence":completion,"confidence":confidence,"dimensions":dimensions},findings,evidence

def human_report(report):
    scores=report["scores"];coverage=report["coverage"]
    lines=["Codex Harness Audit",f"Operational efficiency: {scores['operational_efficiency']} / 100",f"Composite harness: {scores['composite_harness'] if scores['composite_harness'] is not None else 'not scored (no objective verification evidence)'}",f"Confidence: {scores['confidence']}",f"Coverage: {coverage['matched_sessions']} matched, {coverage['excluded_sessions']} excluded, {coverage['duplicate_sessions']} duplicates"]
    if report["findings"]:
        lines.append("Findings:")
        lines.extend(f"- {item['code']}: -{item['points']} ({json.dumps(item['evidence'],ensure_ascii=False,sort_keys=True)})" for item in report["findings"][:5])
    else:lines.append("Findings: none from the available sample")
    if coverage["warnings"]:lines.append("Warnings: "+", ".join(coverage["warnings"]))
    return "\n".join(lines)+"\n"

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("--project",default=os.getcwd());p.add_argument("--codex-home");p.add_argument("--days",type=int,default=30);p.add_argument("--checkout-only",action="store_true");p.add_argument("--worktree-detail",action="store_true");p.add_argument("--output");p.add_argument("--json",action="store_true");p.add_argument("--now",help=argparse.SUPPRESS);args=p.parse_args(argv)
    home,selection=select_home(args.codex_home);now=parse_time(args.now) if args.now else datetime.now(timezone.utc)
    if now is None:raise SystemExit("invalid --now timestamp")
    data=collect(Path(args.project),home,now-timedelta(days=max(1,args.days)),args.checkout_only);sessions=data["sessions"]
    scores,findings,evidence=score(sessions,data["warnings"]) if sessions else ({"operational_efficiency":None,"composite_harness":None,"completion_evidence":None,"confidence":"low","dimensions":{}},[],{})
    totals=Counter();models=Counter();groups={"current_checkout":{"sessions":0},"worktrees":{"sessions":0}}
    for s in sessions:groups[s["group"]]["sessions"]+=1;totals.update(s["metrics"]["tokens"]);models.update(s["metrics"]["models"])
    report={"schema_version":1,"scoring_version":"1.0.0","scope":"operational efficiency; composite requires objective verification evidence","data_source":{"selection":selection,"codex_home":str(home)},"coverage":{"days":args.days,"candidate_sessions":data["candidate"],"matched_sessions":len(sessions),"excluded_sessions":data["excluded"],"duplicate_sessions":data["duplicates"],"warnings":data["warnings"]},"groups":groups,"tokens":dict(totals),"models_by_tokens":dict(models),"scores":scores,"evidence":evidence,"findings":sorted(findings,key=lambda x:x["points"],reverse=True),"limitations":["Historical traces do not prove task correctness without objective verification evidence.","Thresholds are heuristics; compare controlled runs with the same model, task class, and scoring version."]}
    if args.worktree_detail:
        report["worktree_breakdown"]=[{"branch":branch,"sessions":count} for branch,count in sorted(Counter(s["branch"] for s in sessions if s["group"]=="worktrees").items())]
    rendered=json.dumps(report,ensure_ascii=False,indent=2)+"\n" if args.json else human_report(report)
    if args.output:Path(args.output).write_text(rendered,encoding="utf-8")
    sys.stdout.write(rendered);return 0 if sessions else 2
if __name__=="__main__":sys.exit(main())
