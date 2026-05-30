# 运动健身助手管理后台 - 部署文档

## 部署架构

```
用户浏览器
    ↓ HTTP/HTTPS
Nginx (轻量应用服务器 101.34.203.217)
    ├── 前端静态文件 (Vue SPA) → /usr/share/nginx/html
    └── API 代理 → 后端 Java 服务 (localhost:8080)
```

## 服务器信息

| 项目 | 值 |
|------|-----|
| 服务器 IP | 101.34.203.217 |
| 服务器类型 | 腾讯云轻量应用服务器 |
| 实例 ID | lhins-dn6pnqem |
| 操作系统 | Ubuntu |
| Nginx 版本 | 1.24.0 |
| 后端服务 | Spring Boot (端口 8080) |

## 前端访问地址

- **主地址**: http://101.34.203.217
- **域名地址**: https://tech-vance.top (如已配置域名)

## 管理员测试账号

| 字段 | 值 |
|------|-----|
| 用户名 | admin |
| 密码 | 123456 |
| 昵称 | 系统管理员 |
| 邮箱 | admin@tech-vance.top |

## 部署步骤

### 1. 环境准备

确保服务器已安装：
- Nginx
- Java 运行时 (用于后端服务)
- MySQL (或已配置远程数据库)

### 2. 前端构建

在本地开发环境执行：

```bash
# 进入前端项目目录
cd fitness-admin-web

# 安装依赖
npm install

# 生产环境构建
npm run build
```

构建完成后，会在 `dist` 目录生成静态文件。

### 3. 上传前端文件到服务器

使用 SCP 或 FTP 工具上传：

```bash
# 使用 SCP 上传
cd fitness-admin-web
scp -r dist/* root@101.34.203.217:/usr/share/nginx/html/

# 或使用 rsync
rsync -avz dist/ root@101.34.203.217:/usr/share/nginx/html/
```

### 4. 配置 Nginx

编辑 `/etc/nginx/nginx.conf`：

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    upstream fitness_admin {
        server 127.0.0.1:8080;
    }

    server {
        listen 80;
        server_name localhost;

        # 前端静态资源（SPA应用）
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
            expires 1d;
        }

        # 前端静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            root /usr/share/nginx/html;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # API代理 - 处理 /api/admin/v1/ 路径
        location /api/admin/v1/ {
            proxy_pass http://fitness_admin/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket代理
        location /ws/ {
            proxy_pass http://fitness_admin/ws/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_read_timeout 86400s;
        }

        # 登录接口限流
        location /api/admin/v1/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://fitness_admin/auth/login;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }

    # 限流区域定义
    limit_req_zone $binary_remote_addr zone=login:10m rate=10r/m;
}
```

### 5. 测试配置并重启 Nginx

```bash
# 测试配置语法
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### 6. 验证部署

1. 访问前端页面：
   ```
   http://101.34.203.217
   ```

2. 测试登录接口：
   ```bash
   curl -X POST "http://101.34.203.217/api/admin/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"123456"}'
   ```

3. 预期返回：
   ```json
   {"code":0,"message":"登录成功","data":{"token":"xxx"}}
   ```

## 数据库初始化

如果后端返回 `系统异常` (code: 9999)，可能是数据库未初始化。

### 初始化步骤

1. 连接 MySQL 数据库
2. 执行 `db-init.sql` 脚本：

```sql
-- 创建角色表
CREATE TABLE IF NOT EXISTS `admin_role` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `description` VARCHAR(256) DEFAULT NULL,
  `permissions` JSON NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
);

-- 插入超级管理员角色
INSERT INTO `admin_role` (`name`, `code`, `description`, `permissions`) VALUES
('超级管理员', 'super_admin', '拥有所有权限', '["dashboard","user","content","workout","achievement","community","ai","system"]');

-- 创建管理员表
CREATE TABLE IF NOT EXISTS `admin_user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL,
  `password` VARCHAR(256) NOT NULL,
  `nickname` VARCHAR(64) DEFAULT NULL,
  `avatar` VARCHAR(256) DEFAULT NULL,
  `email` VARCHAR(128) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `role_id` INT UNSIGNED DEFAULT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `last_login_ip` VARCHAR(45) DEFAULT NULL,
  `last_login_time` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role` (`role_id`)
);

-- 插入测试账号 (用户名: admin, 密码: 123456)
INSERT INTO `admin_user` (`username`, `password`, `nickname`, `email`, `role_id`, `status`, `deleted`) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', 'admin@tech-vance.top', 1, 1, 0);
```

## 后端服务管理

### 查看服务状态
```bash
systemctl status fitness-admin
```

### 重启后端服务
```bash
systemctl restart fitness-admin
```

### 查看后端日志
```bash
journalctl -u fitness-admin -n 100
```

## 常见问题

### 1. 404 Not Found
- 检查前端文件是否正确上传到 `/usr/share/nginx/html/`
- 检查 nginx 配置中的 `root` 路径是否正确

### 2. 系统异常 (code: 9999)
- 检查后端服务是否正常运行
- 检查数据库是否已初始化
- 查看后端日志获取详细错误信息

### 3. CORS 错误
- 确保前端请求地址与 nginx 配置一致
- 检查 `location /api/admin/v1/` 配置是否正确

### 4. 静态资源加载失败
- 检查文件权限：`chmod -R 755 /usr/share/nginx/html/`
- 检查 nginx 用户是否有读取权限

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite + Element Plus
- **后端**: Spring Boot + Java
- **数据库**: MySQL (腾讯云 CynosDB)
- **服务器**: Nginx + Ubuntu
- **部署方式**: 轻量应用服务器

## 更新记录

| 日期 | 更新内容 |
|------|----------|
| 2026-05-29 | 初始部署文档 |
| 2026-05-30 | 更新为 nginx 部署方式，添加后端服务配置 |
