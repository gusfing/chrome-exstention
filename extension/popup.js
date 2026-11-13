const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const logBox = document.getElementById('logBox');
const btnTestScreenshot = document.getElementById('btnTestScreenshot');
const btnListTabs = document.getElementById('btnListTabs');

function log(msg) {
  logBox.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
}

async function checkStatus() {
  try {
    const res = await fetch('http://127.0.0.1:8765/status', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      statusDot.classList.add('connected');
      statusText.textContent = 'Agent Connected';
      log(`Bridge online. Connected tabs: ${data.tabsCount || 0}`);
    } else {
      throw new Error();
    }
  } catch (e) {
    statusDot.classList.remove('connected');
    statusText.textContent = 'Waiting for Agent';
    log('Local agent bridge server is offline or starting...');
  }
}

btnTestScreenshot.addEventListener('click', async () => {
  log('Triggering active tab capture (Silent Mode)...');
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab) return log('No active tab found.');

    chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        return log('Capture error: ' + chrome.runtime.lastError.message);
      }
      if (dataUrl) {
        const kb = (dataUrl.length * 0.75 / 1024).toFixed(1);
        log(`Captured silently! Size: ${kb} KB (Zero debug banner)`);
      } else {
        log('Failed to capture screenshot.');
      }
    });
  } catch (err) {
    log('Error: ' + err.message);
  }
});

btnListTabs.addEventListener('click', async () => {
  const tabs = await chrome.tabs.query({});
  log(`Found ${tabs.length} tabs in this Chrome window.`);
  checkStatus();
});

checkStatus();
setInterval(checkStatus, 3000);
