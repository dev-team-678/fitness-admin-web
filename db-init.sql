-- ========================================================
-- Fitness Admin 数据库初始化脚本
-- 请在服务器 MySQL 数据库中执行
-- 数据库名: fitness
-- ========================================================

USE fitness;

-- --------------------------------------------------------
-- 先删除有外键依赖的表，再删除被依赖的表
-- --------------------------------------------------------
DROP TABLE IF EXISTS `admin_operation_log`;
DROP TABLE IF EXISTS `admin_login_log`;
DROP TABLE IF EXISTS `announcement`;
DROP TABLE IF EXISTS `sys_config`;
DROP TABLE IF EXISTS `admin_user`;
DROP TABLE IF EXISTS `admin_role`;


-- --------------------------------------------------------
-- 1. 管理角色表
-- --------------------------------------------------------
CREATE TABLE `admin_role` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL COMMENT '角色名称',
  `code` VARCHAR(64) NOT NULL COMMENT '角色编码',
  `description` VARCHAR(256) DEFAULT NULL,
  `permissions` JSON NOT NULL COMMENT '权限配置JSON',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理角色';

-- 插入超级管理员角色
INSERT INTO `admin_role` (`name`, `code`, `description`, `permissions`) VALUES
('超级管理员', 'super_admin', '拥有所有权限', '["dashboard","user","content","workout","achievement","community","ai","system"]');


-- --------------------------------------------------------
-- 2. 管理员账号表
-- --------------------------------------------------------
CREATE TABLE `admin_user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL COMMENT '管理员登录用户名',
  `password` VARCHAR(256) NOT NULL COMMENT '密码(MD5)',
  `nickname` VARCHAR(64) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(256) DEFAULT NULL COMMENT '头像',
  `email` VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `role_id` INT UNSIGNED DEFAULT NULL COMMENT '角色ID(关联 admin_role.id)',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1-正常 2-禁用',
  `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-正常 1-已删除',
  `last_login_ip` VARCHAR(45) DEFAULT NULL,
  `last_login_time` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员账号';

-- 插入测试管理员账号
-- 用户名: admin, 密码: 123456 (MD5: e10adc3949ba59abbe56e057f20f883e)
INSERT INTO `admin_user` (`username`, `password`, `nickname`, `email`, `role_id`, `status`, `deleted`) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', 'admin@tech-vance.top', 1, 1, 0);


-- --------------------------------------------------------
-- 3. 操作日志表
-- --------------------------------------------------------
CREATE TABLE `admin_operation_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_user_id` BIGINT UNSIGNED NOT NULL COMMENT '管理员ID(关联 admin_user.id)',
  `action` VARCHAR(16) NOT NULL COMMENT 'CREATE/UPDATE/DELETE/LOGIN/EXPORT',
  `module` VARCHAR(32) NOT NULL COMMENT '操作模块',
  `target_id` VARCHAR(64) DEFAULT NULL COMMENT '操作对象ID',
  `detail` JSON DEFAULT NULL COMMENT '变更详情',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(512) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin` (`admin_user_id`),
  KEY `idx_module_action` (`module`, `action`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志';


-- --------------------------------------------------------
-- 4. 登录日志表
-- --------------------------------------------------------
CREATE TABLE `admin_login_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '管理员ID(关联 admin_user.id)',
  `username` VARCHAR(64) DEFAULT NULL COMMENT '登录用户名',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(512) DEFAULT NULL,
  `login_status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1-成功 2-失败',
  `fail_reason` VARCHAR(256) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin` (`admin_user_id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录日志';


-- --------------------------------------------------------
-- 5. 系统公告表
-- --------------------------------------------------------
CREATE TABLE `announcement` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '内容',
  `type` VARCHAR(32) NOT NULL DEFAULT 'notice' COMMENT '类型: notice-通知, update-更新, event-活动',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1-已发布 0-草稿',
  `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间',
  `created_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统公告';


-- --------------------------------------------------------
-- 6. 系统配置表
-- --------------------------------------------------------
CREATE TABLE `sys_config` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `config_key` VARCHAR(128) NOT NULL COMMENT '配置键',
  `config_value` TEXT COMMENT '配置值',
  `description` VARCHAR(256) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置';


-- --------------------------------------------------------
-- 验证数据
-- --------------------------------------------------------
SELECT '角色数据' as check_item, COUNT(*) as count FROM admin_role
UNION ALL
SELECT '管理员数据', COUNT(*) FROM admin_user
UNION ALL
SELECT '操作日志数据', COUNT(*) FROM admin_operation_log
UNION ALL
SELECT '登录日志数据', COUNT(*) FROM admin_login_log
UNION ALL
SELECT '公告数据', COUNT(*) FROM announcement
UNION ALL
SELECT '配置数据', COUNT(*) FROM sys_config;
