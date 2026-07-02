const http = require('http');

const data = JSON.stringify({ teamName: 'Test Team', logo: 'test.png' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/teams',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
