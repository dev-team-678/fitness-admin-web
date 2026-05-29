const http = require('http');
const url = require('url');

// 后端服务器地址
const TARGET_HOST = '101.34.203.217';
const TARGET_PORT = 8080;

const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 解析请求路径
  // CloudBase HTTP 访问路径可能是: /api-proxy/api/admin/v1/xxx
  // 也可能是: /api/admin/v1/xxx (如果路由配置了通配符)
  // 需要转发到后端: /api/admin/v1/xxx
  const parsedUrl = url.parse(req.url, true);
  let targetPath = parsedUrl.pathname;

  // 移除 /api-proxy 前缀（如果存在）
  if (targetPath.startsWith('/api-proxy')) {
    targetPath = targetPath.substring('/api-proxy'.length) || '/';
  }

  console.log('Proxy request:', req.method, targetPath);

  // 构建请求选项
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: targetPath + (parsedUrl.search || ''),
    method: req.method,
    headers: {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': req.headers['accept'] || 'application/json',
    },
    timeout: 30000,
  };

  // 转发 Authorization 头
  if (req.headers['authorization']) {
    options.headers['Authorization'] = req.headers['authorization'];
  }

  // 创建到后端的请求
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': proxyRes.headers['content-type'] || 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error('Proxy error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      code: 9999,
      message: '代理请求失败: ' + error.message,
      data: null,
    }));
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    res.writeHead(504, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      code: 9999,
      message: '代理请求超时',
      data: null,
    }));
  });

  // 转发请求体
  req.pipe(proxyReq);
});

server.listen(9000, () => {
  console.log('API Proxy server running on port 9000');
});
