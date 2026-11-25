import {useEffect,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import "./style.css";

type Marker={title:string;time:number};
type Session={phase:string;step:string;error?:string;events:Marker[]};
const names:Record<string,string>={waiting:"正在连接",live:"实时",encoding:"正在生成录像",ready:"回放",failed:"采集中断"};
const speeds=[0.5,1,2,4];
function stamp(seconds:number){
 return new Intl.NumberFormat("en",{minimumIntegerDigits:2}).format(Math.floor(seconds/60))+":"+String(Math.floor(seconds%60)).padStart(2,"0");
}
function App(){
 const [session,setSession]=useState<Session>({phase:"waiting",step:"等待测试画面",events:[]});
 const [paused,setPaused]=useState(false);
 const [frozen,setFrozen]=useState<string>();
 const [speed,setSpeed]=useState(1);
 const [liveKey,setLiveKey]=useState(0);
 const video=useRef<HTMLVideoElement>(null);
 const image=useRef<HTMLImageElement>(null);
 const [position,setPosition]=useState(0);
 const [duration,setDuration]=useState(0);
 const [zoom,setZoom]=useState(false);
 const [aspect,setAspect]=useState(16/9);
 const screen=useRef<HTMLDivElement>(null);
 const [screenError,setScreenError]=useState("");
 useEffect(()=>{
  const element=screen.current;
  if(zoom&&element){
   element.scrollLeft=(element.scrollWidth-element.clientWidth)/2;
   element.scrollTop=(element.scrollHeight-element.clientHeight)/2;
  }
 },[zoom]);
 async function fullscreen(){
  if(!screen.current)return;
  try{
   if(document.fullscreenElement)await document.exitFullscreen();
   else await screen.current.requestFullscreen();
   setScreenError("");
  }catch{setScreenError("无法切换全屏");}
 }
 useEffect(()=>{
  let open=true;
  async function refresh(){try{
   const reply=await fetch("/api/session",{cache:"no-store"});
   if(reply.ok && open)setSession(await reply.json());
  }catch{ /* keep state until server reconnects */ }}
  void refresh();
  const timer=window.setInterval(refresh,400);
  return()=>{open=false;window.clearInterval(timer);};
 },[]);
  const replay=session.phase==="ready";
 useEffect(()=>{
  if(!replay)return;
  // WebView2 can keep the previous multipart connection in its media
  // loader during the transition. Retry metadata once all live frames stop.
  const timer=window.setTimeout(()=>{
   const current=video.current;
   if(current?.readyState===0 && current.paused)current.load();
  },1800);
  return()=>window.clearTimeout(timer);
 },[replay]);
 const canSeeLive=session.phase==="live"||session.phase==="encoding";
 function jump(time:number){const v=video.current;if(v&&Number.isFinite(v.duration)){v.currentTime=Math.min(time,v.duration);}}
 function changeSpeed(rate:number){setSpeed(rate);if(video.current)video.current.playbackRate=rate;}
 return <main>
  <header><div className="brand"><img src="/franks-bot.png" alt="franks-bot" /><div><h1>桌面测试播放器</h1><p>{session.step||"等待测试画面"}</p></div></div><span data-phase={session.phase} className="status"><i/>{names[session.phase]??session.phase}</span></header>
  <section className="layout">
   <div className="viewer">
    <div className="screen" ref={screen} data-zoom={zoom} style={{aspectRatio:aspect}}><div className="media">{replay?
      <video ref={video} src="/replay.mp4" controls playsInline preload="auto"
        onLoadedMetadata={e=>{e.currentTarget.playbackRate=speed;setDuration(e.currentTarget.duration);setAspect(e.currentTarget.videoWidth/e.currentTarget.videoHeight);}}
        onTimeUpdate={e=>setPosition(e.currentTarget.currentTime)} />:
      canSeeLive?<img ref={image} onLoad={e=>{const frame=e.currentTarget;if(frame.naturalHeight)setAspect(frame.naturalWidth/frame.naturalHeight);}} src={paused?frozen:"/live?watch="+liveKey} key={liveKey} alt="独立测试桌面画面"/>:
      <p>{session.error?"视频采集失败":"等待测试桌面开始推流"}</p>}</div></div>
    {session.error&&<p className="error" role="alert">{session.error}</p>}
    <div className="controls">{replay?<>
      <span className="time">{stamp(position)} / {stamp(duration)}</span>
      <div aria-label="播放速度" role="group">{speeds.map(rate=><button key={rate} type="button" aria-pressed={speed===rate} onClick={()=>changeSpeed(rate)}>{rate}×</button>)}</div>
    </>:canSeeLive&&<button onClick={()=>{
      if(!paused&&image.current?.naturalWidth){const canvas=document.createElement("canvas");
        canvas.width=image.current.naturalWidth;canvas.height=image.current.naturalHeight;
        canvas.getContext("2d")?.drawImage(image.current,0,0);setFrozen(canvas.toDataURL("image/jpeg"));setPaused(true);
      }else{setFrozen(undefined);setPaused(false);setLiveKey(liveKey+1);}
    }}>{paused?"返回实时":"暂停观看"}</button>}
      {(replay||canSeeLive)&&<div className="view-actions" role="group" aria-label="画面视图">
        <button type="button" aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?"适应窗口":"放大 2×"}</button>
        <button type="button" onClick={()=>void fullscreen()}>全屏</button>
      </div>}
    </div>
    {screenError&&<p className="error" role="alert">{screenError}</p>}
   </div>
   <aside><h2>测试步骤</h2>
    {session.events.length===0?<p>等待步骤</p>:<ol>{session.events.map((event,index)=>
      <li key={index}><button disabled={!replay} onClick={()=>jump(event.time)}><time>{stamp(event.time)}</time><span>{event.title}</span></button></li>
    )}</ol>}</aside>
  </section>
 </main>;
}
createRoot(document.getElementById("root")!).render(<App/>);
