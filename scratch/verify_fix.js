const { SignJWT } = require('jose');
const { TextEncoder } = require('util');
const http = require('http');

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 
  process.env.AUTH_SECRET || 
  "default_fallback_secret_change_me"
);

async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

async function testCreateTask() {
  const token = await signToken({ userId: "mock_user_id", email: "test@example.com" });
  
  // We need a boardId. In a real test we'd fetch one, but here we can try to find one or just use a mock.
  // Since we hardened boardId validation, we must provide a valid one if possible.
  
  console.log("Mock Token Generated:", token);
  
  const postData = JSON.stringify({
    title: "Test Verification Task",
    description: "Testing if the fix works.",
    boardId: "65d4f1e1e1e1e1e1e1e1e1e1", // Example ObjectId
    status: "To Do"
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/kanban/tasks',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

testCreateTask();
