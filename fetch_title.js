const https = require('https');

https.get('https://www.youtube.com/watch?v=j_JcHWkpdjA', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const match = data.match(/<title>(.*?)<\/title>/);
    if (match) {
      console.log('Title:', match[1]);
    } else {
      console.log('Title not found');
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
