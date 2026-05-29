<template>
  <div class="error-page">
    <h1>403</h1>
    <p>抱歉，您没有权限访问此页面</p>
    <el-button type="primary" @click="$router.push('/dashboard')">返回首页</el-button>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}
.error-page h1 {
  font-size: 96px;
  color: #F56C6C;
  margin-bottom: 16px;
}
.error-page p {
  font-size: 16px;
  color: #909399;
  margin-bottom: 24px;
}
</style>
