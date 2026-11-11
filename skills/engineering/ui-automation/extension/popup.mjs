async function status(type){const result=await chrome.runtime.sendMessage({type});document.querySelector('#status').textContent=JSON.stringify(result,null,2);}
document.querySelector('#connect').onclick=()=>status('connect');
document.querySelector('#reload').onclick=()=>chrome.runtime.reload();
status('status');
setInterval(()=>status('status'),1000);
