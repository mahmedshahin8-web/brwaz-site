import http from 'http';
http.get('http://127.0.0.1:3000/api/trends/public', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data));
}).on('error', console.error);
