const connection = document.querySelector('#connection');
const description = document.querySelector('#description');
const sessions = document.querySelector('#sessions');
const connect = document.querySelector('#connect');
const diagnostics = document.querySelector('#diagnostics');
const error = document.querySelector('#error');
let pending = false;
let lastStatus;

function render(status) {
  const snapshot = JSON.stringify(status);
  if (lastStatus === snapshot) return;
  lastStatus = snapshot;
  const state = status.connected ? 'connected' : status.connecting ? 'connecting' : 'offline';
  document.body.dataset.state = state;
  connection.textContent = {
    connected: '已连接',
    connecting: '正在连接',
    offline: '未连接',
  }[state];
  description.textContent = {
    connected: '可以开始浏览器自动化。',
    connecting: '正在等待本机桥接响应。',
    offline: '连接本机桥接后即可开始测试。',
  }[state];
  sessions.textContent = status.sessions ?? '—';
  connect.hidden = status.connected === true;
  connect.disabled = state !== 'offline';
  diagnostics.hidden = !status.error;
  error.textContent = status.error || '';
}

async function refresh(type = 'status') {
  if (pending) return;
  pending = true;
  if (type === 'connect') {
    lastStatus = undefined;
    connect.disabled = true;
  }
  try {
    render(await chrome.runtime.sendMessage({ type }));
  } catch (failure) {
    render({ error: failure.message });
  } finally {
    pending = false;
  }
}

connect.addEventListener('click', () => refresh('connect'));
document.querySelector('#reload').addEventListener('click', () => chrome.runtime.reload());
refresh();
setInterval(refresh, 1000);
