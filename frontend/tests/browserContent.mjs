// Integration check: run the app on 5176 and an isolated Chrome CDP session on 9333.
import assert from 'node:assert/strict';
const tabs = await (await fetch('http://127.0.0.1:9333/json')).json();
const socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map();
const errors = [];
let mode = 'failure';
let edited;
function send(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
}
socket.addEventListener('message', async event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const call = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) call.reject(new Error(message.error.message)); else call.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Fetch.requestPaused') {
    const requestId = message.params.requestId;
    try {
    if (mode === 'live') await send('Fetch.continueRequest', { requestId });
    else await send('Fetch.fulfillRequest', {
      requestId, responseCode: mode === 'failure' ? 503 : 200,
      responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
      body: Buffer.from(JSON.stringify(mode === 'failure' ? {} : edited)).toString('base64'),
    });
    } catch (error) {
      // React StrictMode intentionally aborts the first mount's request.
      if (!error.message.includes('Invalid InterceptionId')) throw error;
    }
  }
});
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
async function waitFor(expression) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error(`Timed out: ${expression}; body: ${(await evaluate('document.body.innerText')).slice(0, 500)}`);
}
try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*api/site-config*' }] });
  await send('Page.navigate', { url: 'http://127.0.0.1:5176/' });
  await waitFor("document.body.innerText.includes('We could not load the website.')");
  mode = 'live';
  await evaluate("[...document.querySelectorAll('button')].find(button => button.textContent === 'Try again').click()");
  await waitFor("document.querySelector('.catalog-hero h1') !== null");
  console.log('PASS: failed site config displays a retry screen and recovers without reloading');

  for (const route of ['/faq', '/technical-information', '/warranty-information', '/products', '/contact', '/services', '/industries', '/news', '/about/story']) {
    await send('Page.navigate', { url: 'http://127.0.0.1:5176' + route });
    await waitFor("!!document.querySelector('h1') && !document.body.innerText.includes('We could not load the website.')");
    console.log('PASS: rendered ' + route);
  }
  edited = await (await fetch('http://127.0.0.1:8001/api/site-config')).json();
  edited.publicContent.faqs = [['Backend test question', 'Backend test answer']];
  mode = 'edited';
  await send('Page.navigate', { url: 'http://127.0.0.1:5176/faq' });
  await waitFor("document.body.innerText.includes('Backend test question') && document.body.innerText.includes('Backend test answer')");
  edited.publicContent.heroSlides = [];
  await send('Page.navigate', { url: 'http://127.0.0.1:5176/' });
  await waitFor("!!document.querySelector('footer') && !document.querySelector('.catalog-hero')");
  console.log('PASS: changed backend FAQ renders, and an empty carousel does not crash');
  edited.publicContent.heroSlides = 'invalid';
  await send('Page.navigate', { url: 'http://127.0.0.1:5176/' });
  await waitFor("document.body.innerText.includes('We could not load the website.')");
  console.log('PASS: malformed configuration displays the retry screen');
  mode = 'live';
  await send('Page.navigate', { url: 'http://127.0.0.1:8001/faq' });
  await waitFor("document.body.innerText.includes('Frequently Asked Questions')");
  console.log('PASS: production build renders on a direct backend URL');
  assert.deepEqual(errors, []);
  console.log('PASS: no browser runtime exceptions');
} finally {
  await send('Fetch.disable');
  if (process.env.CLOSE_BROWSER === '1') await send('Browser.close');
  socket.close();
}
