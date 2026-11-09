// Self-contained Playwright MCP expression. Pass project-owned cases explicitly.
async (page, cases = []) => {
  return await page.evaluate((items) => {
    const rgba = value => {
      const match = value.match(/^rgba?\(([^)]+)\)$/);
      if (!match) throw new Error(`Unsupported computed color: ${value}`);
      const channels = match[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
      if (channels.length < 3 || channels.some(v=>!Number.isFinite(v))) throw new Error('Invalid computed color');
      return [...channels.slice(0,3).map(v=>v/255),channels[3]??1];
    };
    const over = (top,bottom) => {
      const alpha=top[3]+bottom[3]*(1-top[3]);
      return [...top.slice(0,3).map((v,i)=>alpha ? (v*top[3]+bottom[i]*bottom[3]*(1-top[3]))/alpha : 0),alpha];
    };
    const luminance = c => c.slice(0,3).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[0.2126,0.7152,0.0722][i],0);
    return items.map(item => {
      try {
        const nodes = document.querySelectorAll(item.selector);
        if (nodes.length !== 1) throw new Error(`Expected one element; found ${nodes.length}`);
        const element=nodes[0];
        const style=getComputedStyle(element);
        if (item.kind === 'text') return {id:item.id,passed:element.textContent.includes(item.expected),actual:element.textContent};
        if (item.kind === 'visible') {
          const r=element.getBoundingClientRect();
          return {id:item.id,passed:r.width>0&&r.height>0&&style.visibility!=='hidden'&&style.display!=='none'};
        }
        if (item.kind !== 'contrast' || !Number.isFinite(item.minimum) || item.minimum <= 1) throw new Error('Unknown case kind or missing explicit contrast threshold');
        const layers=[];
        for(let current=element; current; current=current.parentElement) {
          const s=getComputedStyle(current);
          if(s.backgroundImage!=='none'||Number(s.opacity)!==1||s.filter!=='none'||s.mixBlendMode!=='normal') throw new Error('Complex painted background needs project-specific measurement');
          layers.push(rgba(s.backgroundColor));
        }
        // Browser canvas defaults to white. Walk actual painted ancestors, including alpha.
        let background=[1,1,1,1];
        for(const layer of layers.reverse()) background=over(layer,background);
        const foreground=over(rgba(style.color),background);
        const values=[luminance(foreground),luminance(background)].sort((a,b)=>a-b);
        const ratio=(values[1]+0.05)/(values[0]+0.05);
        return {id:item.id,passed:ratio>=item.minimum,ratio,minimum:item.minimum,foreground,background};
      } catch(error) {return {id:item.id,passed:false,error:error.message};}
    });
  },cases);
}
