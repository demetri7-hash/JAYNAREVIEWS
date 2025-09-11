import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Debug Users - The Pass</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .container { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 10px 0; }
        button { background: #0070f3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0051cc; }
        .result { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #0070f3; }
        input { padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; width: 300px; }
        pre { background: #f0f0f0; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔧 The Pass - Debug Users</h1>
    <p>Use this page to debug authentication issues and activate your first manager account.</p>
    
    <div class="container">
        <h3>Step 1: Check Database Schema</h3>
        <button onclick="setupSchema()">Setup Database Schema</button>
        <div id="schema-result" class="result" style="display:none;"></div>
    </div>
    
    <div class="container">
        <h3>Step 2: List All Users</h3>
        <button onclick="listUsers()">List All Users</button>
        <div id="users-result" class="result" style="display:none;"></div>
    </div>
    
    <div class="container">
        <h3>Step 3: Activate First Manager</h3>
        <input type="email" id="email-input" placeholder="Enter your email address" />
        <button onclick="activateManager()">Activate as Manager</button>
        <div id="activate-result" class="result" style="display:none;"></div>
    </div>

    <script>
        async function setupSchema() {
            const resultDiv = document.getElementById('schema-result');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<p>Setting up database schema...</p>';
            
            try {
                const response = await fetch('/api/auth/setup-schema', { method: 'POST' });
                const data = await response.json();
                resultDiv.innerHTML = \`<pre>\${JSON.stringify(data, null, 2)}</pre>\`;
            } catch (error) {
                resultDiv.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
            }
        }
        
        async function listUsers() {
            const resultDiv = document.getElementById('users-result');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<p>Loading users...</p>';
            
            try {
                const response = await fetch('/api/debug-users');
                const data = await response.json();
                resultDiv.innerHTML = \`<pre>\${JSON.stringify(data, null, 2)}</pre>\`;
            } catch (error) {
                resultDiv.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
            }
        }
        
        async function activateManager() {
            const email = document.getElementById('email-input').value;
            const resultDiv = document.getElementById('activate-result');
            
            if (!email) {
                alert('Please enter an email address');
                return;
            }
            
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<p>Activating manager account...</p>';
            
            try {
                const response = await fetch('/api/debug-users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, action: 'activate_manager' })
                });
                const data = await response.json();
                resultDiv.innerHTML = \`<pre>\${JSON.stringify(data, null, 2)}</pre>\`;
                
                if (data.success) {
                    resultDiv.innerHTML += '<p style="color: green; font-weight: bold;">✅ Success! You can now try signing in again.</p>';
                }
            } catch (error) {
                resultDiv.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
            }
        }
    </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
