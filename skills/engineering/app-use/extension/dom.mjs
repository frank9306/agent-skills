// Executed only in the extension's isolated world, never in the page's JS world.
export function dom(operation, args = {}) {
  const key=Symbol.for('app-use.dom.v1');
  const state=globalThis[key]??(globalThis[key]={ids:new WeakMap(),nodes:new Map(),seq:0});
  function sensitive(el) {
    for(let node=el;node;node=node.getRootNode()?.host)if(node.closest?.('input[type=password],[data-app-use-sensitive]'))return true;
    return false;
  }
  function text(el) {
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),parts=[];
    while(walker.nextNode()){const parent=walker.currentNode.parentElement;if(parent&&!sensitive(parent)&&!parent.closest('script,style,noscript,template'))parts.push(walker.currentNode.textContent);}
    return parts.join('');
  }
  function name(el) {
    const label=el.getAttribute('aria-labelledby');
    return (label?label.split(/\s+/).map(id=>((node)=>node?text(node):'')(el.getRootNode().getElementById?.(id))).join(' '):el.getAttribute('aria-label')||[...(el.labels||[])].map(l=>text(l)).join(' ')||el.getAttribute('alt')||el.getAttribute('title')||(el.matches('input[type=button],input[type=submit]')?el.value:text(el))||'').trim();
  }
  function role(el) {
    return el.getAttribute('role')||({BUTTON:'button',A:el.hasAttribute('href')?'link':'generic',SELECT:'combobox',TEXTAREA:'textbox',IMG:'img',DIALOG:'dialog',OPTION:'option',UL:'list',OL:'list',LI:'listitem',H1:'heading',H2:'heading',H3:'heading',TABLE:'table',TR:'row',TD:'cell',TH:'columnheader'}[el.tagName])||(el.tagName==='INPUT'?({checkbox:'checkbox',radio:'radio',button:'button',submit:'button',range:'slider',file:'file'}[el.type]||'textbox'):'generic');
  }
  function row(el) {
    let id=state.ids.get(el);if(!id){id=String(++state.seq);state.ids.set(el,id);state.nodes.set(id,new WeakRef(el));}
    const r=el.getBoundingClientRect(),css=getComputedStyle(el),privateField=sensitive(el);
    const label=privateField?'[sensitive]':name(el);
    return {id,role:role(el),truncated:label.length>256,name:label.slice(0,256),value:privateField?null:('value'in el?String(el.value):null),enabled:!el.matches(':disabled,[aria-disabled=true]'),visible:r.width>0&&r.height>0&&css.display!=='none'&&css.visibility!=='hidden'&&r.bottom>0&&r.right>0&&r.x<innerWidth&&r.y<innerHeight,focused:el===el.getRootNode().activeElement,selected:el.matches('option')?el.selected:el.matches('input[type=checkbox],input[type=radio]')?el.checked:el.hasAttribute('aria-selected')?el.getAttribute('aria-selected')==='true':null,sensitive:privateField,selector:el.id?'#'+CSS.escape(el.id):null,bounds:{x:r.x,y:r.y,width:r.width,height:r.height}};
  }
  function signature(r){return JSON.stringify([r.role,r.name,r.value,r.enabled,r.visible,r.bounds]);}
  function element(id){const el=state.nodes.get(id)?.deref();if(!el?.isConnected)throw Error('target expired');return el;}
  if(operation==='sensitive') {
    const queue=[...document.querySelectorAll('*')];let checked=0;
    while(queue.length){const el=queue.shift();if(++checked>10000||sensitive(el))return true;if(el.shadowRoot)queue.push(...el.shadowRoot.querySelectorAll('*'));}return false;
  }
  if(operation==='snapshot') {
    for(const [id,ref]of state.nodes)if(!ref.deref()?.isConnected)state.nodes.delete(id);
    const rows=[],queue=[...document.querySelectorAll(args.selector||'*')];let complete=true;
    const seen=new Set();
    while(queue.length){const el=queue.shift();if(seen.has(el)||el.matches('head,title,script,style,noscript,template,meta,link'))continue;seen.add(el);if(rows.length>=(args.limit||1000)){complete=false;break;}const r=row(el);r.signature=signature(r);rows.push(r);if(el.shadowRoot)queue.push(...el.shadowRoot.querySelectorAll('*'));}
    return {nodes:rows,complete,viewport:{width:innerWidth,height:innerHeight},url:location.origin+location.pathname,title:document.title};
  }
  if(operation==='element')return element(args.id);
  if(operation==='probe') {
    const el=element(args.id),r=row(el);
    if(signature(r)!==args.signature)throw Error('target changed since observation');
    if(!r.enabled)throw Error('target disabled');
    if(args.scrollIntoView){el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});return true;}
    if(!r.visible)throw Error('target offscreen or hidden');
    const x=r.bounds.x+r.bounds.width/2,y=r.bounds.y+r.bounds.height/2;
    const top=(el.getRootNode().elementFromPoint?.(x,y))||document.elementFromPoint(x,y);
    if(!top||(top!==el&&!el.contains(top)))throw Error('target occluded');
    if(args.focus){el.focus();if(el.getRootNode().activeElement!==el)throw Error('target did not receive focus');}
    return r;
  }
  if(operation==='select') {
    const el=element(args.id);if(!(el instanceof HTMLSelectElement))throw Error('select requires native select');
    const options=[...el.options].filter(o=>o.value===args.value);
    if(options.length!==1||options[0].disabled)throw Error('choice missing, disabled or ambiguous');
    el.value=args.value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));return true;
  }
  throw Error('unsupported DOM operation');
}
