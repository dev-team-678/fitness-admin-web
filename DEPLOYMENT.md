# Fitness Admin Web 前端部署文档

## 1. 项目概述

| 项目 | 说明 |
|------|------|
| 项目名称 | 运动健身助手管理后台 |
| 技术栈 | Vue 3 + TypeScript + Vite + Element Plus |
| 构建工具 | Vite 8.x |
| 包管理器 | npm |

## 2. 环境配置

### 2.1 环境变量文件

#### 开发环境 `.env.development`
```
VITE_APP_TITLE=运动健身助手管理后台
VITE_APP_BASE_API=/api/admin/v1
VITE_APP_ENV=development
```

#### 生产环境 `.env.production`
```
VITE_APP_TITLE=运动健身助手管理后台
VITE_APP_BASE_API=/api/admin/v1
VITE_APP_ENV=production
```

### 2.2 后端 API 配置

| 环境 | API 基础路径 | 说明 |
|------|-------------|------|
| 开发 | `/api/admin/v1` | 通过 Vite 代理转发 |
| 生产 | `/api/admin/v1` | 由 Nginx/网关统一代理到后端服务 |

后端服务部署地址：`https://tech-vance.top`

## 3. 本地开发

### 3.1 安装依赖

```bash
cd fitness-admin-web
npm install
```

### 3.2 启动开发服务器

```bash
npm run dev
```

默认启动地址：`http://localhost:5173`

### 3.3 构建生产包

```bash
npm run build
```

构建输出目录：`./dist`

## 4. 部署流程

### 4.1 部署目标

| 项目 | 值 |
|------|-----|
| 平台 | 腾讯云 CloudBase 静态网站托管 |
| 环境 ID | `tech-vance-d3g4nuoqse6b67920` |
| 访问域名 | `https://tech-vance-d3g4nuoqse6b67920-1258886224.tcloudbaseapp.com` |

### 4.2 前置要求

- 安装 CloudBase CLI (`tcb`)
- 已登录 CloudBase 账号 (`tcb login`)
- 静态网站托管服务已启用

### 4.3 部署步骤

```bash
# 1. 进入项目目录
cd fitness-admin-web

# 2. 安装依赖
npm install

# 3. 构建生产包
npm run build

# 4. 确认目标环境
# tcb env list

# 5. 检查静态托管状态
# tcb hosting detail --env-id tech-vance-d3g4nuoqse6b67920

# 6. 部署到 CloudBase 静态托管
tcb hosting deploy ./dist --env-id tech-vance-d3g4nuoqse6b67920 --yes
```

### 4.4 部署验证

部署完成后，访问以下地址验证：

```
https://tech-vance-d3g4nuoqse6b67920-1258886224.tcloudbaseapp.com
```

> CDN 缓存提示：如页面未更新，可使用浏览器无痕模式验证，CDN 通常在数分钟内刷新。

## 5. 已知问题与修复记录

### 5.1 TypeScript 类型兼容性问题

**问题描述**：Element Plus 的 `<el-tag>` 组件 `type` 属性只接受 `'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined`，但项目中多处使用了空字符串 `''` 或宽泛的 `string` 类型，导致构建失败。

**涉及文件**：
- `src/views/ai/safety/list.vue`
- `src/views/ai/knowledge/list.vue`
- `src/views/ai/plans/detail.vue`
- `src/views/ai/plans/list.vue`
- `src/views/community/posts.vue`
- `src/views/community/reports.vue`
- `src/views/system/announcement.vue`
- `src/views/system/operation-log.vue`

**修复方案**：

将类型定义从 `Record<string, string>` 改为精确联合类型：

```typescript
// 修复前
const statusTagType: Record<number, string> = {
  0: 'warning',
  1: 'success',
  2: 'danger',
}

// 修复后
const statusTagType: Record<number, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  0: 'warning',
  1: 'success',
  2: 'danger',
}
```

将空字符串改为 `undefined`：

```typescript
// 修复前
const typeTagMap: Record<string, string> = {
  notice: '',
  update: 'success',
}

// 修复后
const typeTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined> = {
  notice: undefined,
  update: 'success',
}
```

### 5.2 TypeScript 6.0 弃用警告

**问题描述**：`tsconfig.app.json` 中的 `baseUrl` 选项在 TypeScript 7.0 中将被弃用，导致构建报错。

**修复方案**：在 `tsconfig.app.json` 的 `compilerOptions` 中添加：

```json
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0"
  }
}
```

## 6. 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产包（含类型检查） |
| `npm run preview` | 预览生产构建 |
| `tcb hosting deploy ./dist --env-id <envId> --yes` | 部署到 CloudBase |
| `tcb hosting list --env-id <envId>` | 查看已部署文件列表 |
| `tcb hosting detail --env-id <envId>` | 查看静态托管服务信息 |

## 7. 相关资源

| 资源 | 链接 |
|------|------|
| CloudBase 控制台 | https://tcb.cloud.tencent.com/dev?envId=tech-vance-d3g4nuoqse6b67920 |
| 静态托管管理 | https://tcb.cloud.tencent.com/dev?envId=tech-vance-d3g4nuoqse6b67920#/static-hosting |
| 前端访问地址 | https://tech-vance-d3g4nuoqse6b67920-1258886224.tcloudbaseapp.com |
| 后端 API | https://tech-vance.top/api/admin/v1 |
