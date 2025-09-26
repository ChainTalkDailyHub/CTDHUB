const { createProxyMiddleware } = require('http-proxy-middleware');

// Proxy for Next.js API routes in Netlify
exports.handler = async (event, context) => {
  const { path } = event;
  
  // Remove /api prefix for Netlify functions
  const apiPath = path.replace('/.netlify/functions', '');
  
  console.log(`Netlify Function called: ${apiPath}`);
  
  // Import and execute the corresponding Next.js API route
  try {
    // Dynamic import of API routes
    const apiModule = await import(`../../pages/api${apiPath}`);
    
    if (apiModule.default) {
      const req = {
        method: event.httpMethod,
        url: event.path,
        headers: event.headers,
        body: event.body ? JSON.parse(event.body) : undefined,
        query: event.queryStringParameters || {},
      };
      
      const res = {
        statusCode: 200,
        headers: {},
        setHeader: function(name, value) {
          this.headers[name] = value;
        },
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.headers['Content-Type'] = 'application/json';
          this.body = JSON.stringify(data);
          return this;
        },
        send: function(data) {
          this.body = data;
          return this;
        }
      };
      
      await apiModule.default(req, res);
      
      return {
        statusCode: res.statusCode,
        headers: res.headers,
        body: res.body || '',
      };
    }
  } catch (error) {
    console.error('Netlify Function Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
    };
  }
  
  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Not Found' }),
  };
};