import http from "http";

const req = http.request({
  method: 'POST',
  hostname: 'localhost',
  port: 3000,
  path: '/api/generate',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk.toString()}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({
  messages: [{role: 'user', content: 'Say hello in 5 words'}],
  generator: 'gemini'
}));
req.end();
