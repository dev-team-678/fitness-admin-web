import type { RouteRecordRaw } from 'vue-router'

export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      // ============================================================
      // 📊 数据看板 (Dashboard)
      // ============================================================
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '📊 数据看板', icon: 'DataBoard', permission: 'dashboard:read' },
      },

      // ============================================================
      // 👥 用户管理 (User Management)
      // ============================================================
      {
        path: 'user',
        name: 'User',
        meta: { title: '👥 用户管理', icon: 'User', permission: 'user:read' },
        redirect: '/user/list',
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('@/views/user/list.vue'),
            meta: { title: '用户列表', permission: 'user:read' },
          },
          {
            path: 'detail/:id',
            name: 'UserDetail',
            component: () => import('@/views/user/detail.vue'),
            meta: { title: '用户详情', hidden: true, permission: 'user:read' },
          },
        ],
      },

      // ============================================================
      // 📋 内容管理 (Content Management)
      // 训练计划 + 动作库
      // ============================================================
      {
        path: 'content',
        name: 'Content',
        meta: { title: '📋 内容管理', icon: 'Document', permission: 'content:read' },
        redirect: '/content/plan',
        children: [
          // --- 训练计划 ---
          {
            path: 'plan',
            name: 'Plan',
            meta: { title: '训练计划', permission: 'plan:read' },
            redirect: '/content/plan/list',
            children: [
              {
                path: 'list',
                name: 'PlanList',
                component: () => import('@/views/content/plan/list.vue'),
                meta: { title: '计划列表', permission: 'plan:read' },
              },
              {
                path: 'create',
                name: 'PlanCreate',
                component: () => import('@/views/content/plan/edit.vue'),
                meta: { title: '创建计划', permission: 'plan:create' },
              },
              {
                path: 'edit/:id',
                name: 'PlanEdit',
                component: () => import('@/views/content/plan/edit.vue'),
                meta: { title: '编辑计划', hidden: true, permission: 'plan:update' },
              },
            ],
          },
          // --- 动作库 ---
          {
            path: 'exercise',
            name: 'Exercise',
            meta: { title: '动作库', permission: 'exercise:read' },
            redirect: '/content/exercise/list',
            children: [
              {
                path: 'list',
                name: 'ExerciseList',
                component: () => import('@/views/content/exercise/list.vue'),
                meta: { title: '动作列表', permission: 'exercise:read' },
              },
              {
                path: 'create',
                name: 'ExerciseCreate',
                component: () => import('@/views/content/exercise/edit.vue'),
                meta: { title: '新增动作', permission: 'exercise:create' },
              },
              {
                path: 'edit/:id',
                name: 'ExerciseEdit',
                component: () => import('@/views/content/exercise/edit.vue'),
                meta: { title: '编辑动作', hidden: true, permission: 'exercise:update' },
              },
              {
                path: 'category',
                name: 'Category',
                component: () => import('@/views/content/category/index.vue'),
                meta: { title: '分类管理', permission: 'exercise:read' },
              },
              {
                path: 'body-part',
                name: 'BodyPart',
                component: () => import('@/views/content/body-part/index.vue'),
                meta: { title: '部位管理', permission: 'exercise:read' },
              },
            ],
          },
        ],
      },

      // ============================================================
      // 📈 训练数据 (Workout Analytics)
      // ============================================================
      {
        path: 'workout',
        name: 'Workout',
        meta: { title: '📈 训练数据', icon: 'TrendCharts', permission: 'workout:read' },
        redirect: '/workout/analytics',
        children: [
          {
            path: 'analytics',
            name: 'WorkoutAnalytics',
            component: () => import('@/views/workout/analytics/index.vue'),
            meta: { title: '数据统计', permission: 'workout:read' },
          },
          {
            path: 'records',
            name: 'WorkoutRecords',
            component: () => import('@/views/workout/records/index.vue'),
            meta: { title: '训练记录', permission: 'workout:read' },
          },
        ],
      },

      // ============================================================
      // 📏 身体数据管理 (Body Metrics)
      // ============================================================
      {
        path: 'body',
        name: 'Body',
        meta: { title: '📏 身体数据', icon: 'Odometer', permission: 'body:read' },
        redirect: '/body/metrics',
        children: [
          {
            path: 'metrics',
            name: 'BodyMetrics',
            component: () => import('@/views/workout/body-metric/index.vue'),
            meta: { title: '数据管理', permission: 'body:read' },
          },
        ],
      },

      // ============================================================
      // 🏆 成就与打卡 (Achievement & Checkin)
      // ============================================================
      {
        path: 'achievement',
        name: 'Achievement',
        meta: { title: '🏆 成就打卡', icon: 'Medal', permission: 'achievement:read' },
        redirect: '/achievement/list',
        children: [
          {
            path: 'list',
            name: 'AchievementList',
            component: () => import('@/views/achievement/list.vue'),
            meta: { title: '成就列表', permission: 'achievement:read' },
          },
          {
            path: 'create',
            name: 'AchievementCreate',
            component: () => import('@/views/achievement/edit.vue'),
            meta: { title: '新增成就', permission: 'achievement:create' },
          },
          {
            path: 'edit/:id',
            name: 'AchievementEdit',
            component: () => import('@/views/achievement/edit.vue'),
            meta: { title: '编辑成就', hidden: true, permission: 'achievement:update' },
          },
          {
            path: 'checkin-stats',
            name: 'CheckinStats',
            component: () => import('@/views/achievement/checkin-stats.vue'),
            meta: { title: '打卡统计', permission: 'achievement:read' },
          },
        ],
      },

      // ============================================================
      // 🗣️ 社区管理 (Community Moderation)
      // ============================================================
      {
        path: 'community',
        name: 'Community',
        meta: { title: '🗣️ 社区管理', icon: 'ChatDotRound', permission: 'community:read' },
        redirect: '/community/posts',
        children: [
          {
            path: 'posts',
            name: 'CommunityPosts',
            component: () => import('@/views/community/posts.vue'),
            meta: { title: '动态管理', permission: 'community:read' },
          },
          {
            path: 'comments',
            name: 'CommunityComments',
            component: () => import('@/views/community/comments.vue'),
            meta: { title: '评论管理', permission: 'community:read' },
          },
          {
            path: 'reports',
            name: 'CommunityReports',
            component: () => import('@/views/community/reports.vue'),
            meta: { title: '举报处理', permission: 'community:read' },
          },
          {
            path: 'sensitive-words',
            name: 'SensitiveWords',
            component: () => import('@/views/community/sensitive-words.vue'),
            meta: { title: '敏感词管理', permission: 'community:read' },
          },
        ],
      },

      // ============================================================
      // 🤖 AI 管理 (AI Management)
      // ============================================================
      {
        path: 'ai',
        name: 'AI',
        meta: { title: '🤖 AI 管理', icon: 'Cpu', permission: 'ai:read' },
        redirect: '/ai/knowledge',
        children: [
          // --- 知识库管理 ---
          {
            path: 'knowledge',
            name: 'AiKnowledge',
            meta: { title: '知识库管理', permission: 'ai:knowledge:read' },
            redirect: '/ai/knowledge/list',
            children: [
              {
                path: 'list',
                name: 'AiKnowledgeList',
                component: () => import('@/views/ai/knowledge/list.vue'),
                meta: { title: '知识列表', permission: 'ai:knowledge:read' },
              },
              {
                path: 'create',
                name: 'AiKnowledgeCreate',
                component: () => import('@/views/ai/knowledge/edit.vue'),
                meta: { title: '新增知识', permission: 'ai:knowledge:create' },
              },
              {
                path: 'edit/:id',
                name: 'AiKnowledgeEdit',
                component: () => import('@/views/ai/knowledge/edit.vue'),
                meta: { title: '编辑知识', hidden: true, permission: 'ai:knowledge:update' },
              },
              {
                path: 'test',
                name: 'AiKnowledgeTest',
                component: () => import('@/views/ai/knowledge/rag-test.vue'),
                meta: { title: 'RAG 检索测试', permission: 'ai:knowledge:read' },
              },
            ],
          },
          // --- 对话监控 ---
          {
            path: 'chat-monitor',
            name: 'AiChatMonitor',
            meta: { title: '对话监控', permission: 'ai:chat:read' },
            redirect: '/ai/chat-monitor/list',
            children: [
              {
                path: 'list',
                name: 'AiChatMonitorList',
                component: () => import('@/views/ai/chat-monitor/list.vue'),
                meta: { title: '会话列表', permission: 'ai:chat:read' },
              },
              {
                path: 'detail/:id',
                name: 'AiChatDetail',
                component: () => import('@/views/ai/chat-monitor/detail.vue'),
                meta: { title: '对话详情', hidden: true, permission: 'ai:chat:read' },
              },
            ],
          },
          // --- AI 计划管理 ---
          {
            path: 'plans',
            name: 'AiPlans',
            meta: { title: 'AI 计划管理', permission: 'ai:plan:read' },
            redirect: '/ai/plans/list',
            children: [
              {
                path: 'list',
                name: 'AiPlansList',
                component: () => import('@/views/ai/plans/list.vue'),
                meta: { title: '计划列表', permission: 'ai:plan:read' },
              },
              {
                path: 'detail/:id',
                name: 'AiPlanDetail',
                component: () => import('@/views/ai/plans/detail.vue'),
                meta: { title: '计划详情', hidden: true, permission: 'ai:plan:read' },
              },
            ],
          },
          // --- 安全与规则 ---
          {
            path: 'safety',
            name: 'AiSafety',
            meta: { title: '安全与规则', permission: 'ai:safety:read' },
            redirect: '/ai/safety/rules',
            children: [
              {
                path: 'rules',
                name: 'AiSafetyRules',
                component: () => import('@/views/ai/safety/list.vue'),
                meta: { title: '安全规则', permission: 'ai:safety:read' },
              },
              {
                path: 'rules/create',
                name: 'AiSafetyCreate',
                component: () => import('@/views/ai/safety/edit.vue'),
                meta: { title: '新增规则', permission: 'ai:safety:create' },
              },
              {
                path: 'rules/edit/:id',
                name: 'AiSafetyEdit',
                component: () => import('@/views/ai/safety/edit.vue'),
                meta: { title: '编辑规则', hidden: true, permission: 'ai:safety:update' },
              },
              {
                path: 'prompts',
                name: 'AiPrompts',
                component: () => import('@/views/ai/prompts/list.vue'),
                meta: { title: 'Prompt 模板', permission: 'ai:prompt:read' },
              },
              {
                path: 'prompts/edit/:id',
                name: 'AiPromptEdit',
                component: () => import('@/views/ai/prompts/edit.vue'),
                meta: { title: '编辑 Prompt', hidden: true, permission: 'ai:prompt:update' },
              },
            ],
          },
          // --- AI 数据分析 ---
          {
            path: 'analytics',
            name: 'AiAnalytics',
            component: () => import('@/views/ai/analytics/index.vue'),
            meta: { title: 'AI 数据分析', permission: 'ai:analytics:read' },
          },
        ],
      },

      // ============================================================
      // ⚙️ 系统设置 (System Settings)
      // ============================================================
      {
        path: 'system',
        name: 'System',
        meta: { title: '⚙️ 系统设置', icon: 'Setting', permission: 'system:read' },
        redirect: '/system/config',
        children: [
          {
            path: 'config',
            name: 'SystemConfig',
            component: () => import('@/views/system/config.vue'),
            meta: { title: '系统参数', permission: 'system:read' },
          },
          {
            path: 'ai-config',
            name: 'AiConfig',
            component: () => import('@/views/system/ai-config.vue'),
            meta: { title: 'AI 模型配置', permission: 'system:ai:read' },
          },
          {
            path: 'announcement',
            name: 'Announcement',
            component: () => import('@/views/system/announcement.vue'),
            meta: { title: '公告管理', permission: 'system:read' },
          },
          {
            path: 'operation-log',
            name: 'OperationLog',
            component: () => import('@/views/system/operation-log.vue'),
            meta: { title: '操作日志', permission: 'system:log:read' },
          },
        ],
      },

      // ============================================================
      // 🔐 权限管理 (RBAC)
      // ============================================================
      {
        path: 'permission',
        name: 'Permission',
        meta: { title: '🔐 权限管理', icon: 'Lock', permission: 'permission:read' },
        redirect: '/permission/admin',
        children: [
          {
            path: 'admin',
            name: 'AdminUser',
            component: () => import('@/views/permission/admin.vue'),
            meta: { title: '管理员账号', permission: 'permission:read' },
          },
          {
            path: 'role',
            name: 'Role',
            component: () => import('@/views/permission/role.vue'),
            meta: { title: '角色管理', permission: 'permission:read' },
          },
          {
            path: 'login-log',
            name: 'LoginLog',
            component: () => import('@/views/permission/login-log.vue'),
            meta: { title: '登录日志', permission: 'permission:read' },
          },
        ],
      },
    ],
  },
]
