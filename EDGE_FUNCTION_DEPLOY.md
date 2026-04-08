# Supabase Edge Functions 部署指南

## 邮件发送功能部署

---

## 方案A：通过 Supabase 控制面板部署 (最简单，无需CLI)

### 步骤：

1. **打开 Supabase 控制台**
   - 访问 https://supabase.com/dashboard
   - 选择你的项目

2. **进入 Edge Functions 页面**
   - 左侧菜单 → **Edge Functions**
   - 点击 **+ New Function**

3. **创建新函数**
   - 函数名称: `send-email`
   - 复制 `supabase/functions/send-email/index.ts` 的全部内容
   - 粘贴到代码编辑器
   - 点击 **Save & Deploy**

4. **配置函数设置**
   - 在函数详情页，确保 **JWT Verification** 设置为 **OFF** (或者保持ON并在请求中传递正确的JWT token)
   - 记录函数的 URL，格式类似:
     `https://<project-ref>.supabase.co/functions/v1/send-email`

---

## 方案B：使用 Scoop 安装 CLI 部署 (Windows推荐)

### 前置要求
1. Windows PowerShell

### 步骤：

#### 1. 安装 Scoop (Windows包管理器)
```powershell
# 允许执行脚本
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# 安装 Scoop
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

#### 2. 安装 Supabase CLI
```powershell
# 添加 Supabase bucket
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git

# 安装
scoop install supabase

# 验证安装
supabase --version
```

#### 3. 登录并关联项目
```powershell
# 登录 (会打开浏览器)
supabase login

# 关联项目 (从 Supabase 控制台获取 Project Ref)
supabase link --project-ref YOUR_PROJECT_REF
```

#### 4. 部署 Edge Function
```powershell
supabase functions deploy send-email
```

---

## 方案C：直接下载二进制文件

如果不想安装包管理器：

1. 访问 https://github.com/supabase/cli/releases
2. 下载最新的 `supabase_windows_x86_64.zip`
3. 解压到目录（如 `C:\supabase`）
4. 将该目录添加到系统 PATH 环境变量
5. 打开新的 PowerShell 窗口，运行 `supabase --version` 验证

---

## 本地测试 Edge Function (如果使用CLI)

#### 1. 启动本地开发环境
```bash
supabase functions serve
```

#### 2. 测试函数
```bash
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "测试邮件",
    "html": "<h1>这是一封测试邮件</h1>",
    "smtpConfig": {
      "host": "smtp.example.com",
      "port": "587",
      "user": "your-email@example.com",
      "pass": "your-password",
      "from": "your-email@example.com"
    }
  }'
```

### 本地测试 Edge Function

#### 1. 启动本地开发环境
```bash
supabase functions serve
```

#### 2. 测试函数
```bash
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "测试邮件",
    "html": "<h1>这是一封测试邮件</h1>",
    "smtpConfig": {
      "host": "smtp.example.com",
      "port": "587",
      "user": "your-email@example.com",
      "pass": "your-password",
      "from": "your-email@example.com"
    }
  }'
```

### 常用邮箱 SMTP 配置

#### QQ 邮箱
- SMTP 服务器: `smtp.qq.com`
- 端口: `587` (STARTTLS) 或 `465` (SSL/TLS)
- 需要开启 SMTP 服务并获取授权码

#### 163 邮箱
- SMTP 服务器: `smtp.163.com`
- 端口: `587` 或 `465`
- 需要开启 SMTP 服务并获取授权码

#### Gmail
- SMTP 服务器: `smtp.gmail.com`
- 端口: `587`
- 需要使用应用专用密码 (开启 2FA 后)

#### Outlook/Hotmail
- SMTP 服务器: `smtp.office365.com`
- 端口: `587`

### 故障排除

1. **部署失败**: 检查网络连接，确保 Supabase CLI 版本最新
2. **邮件发送失败**: 
   - 检查 SMTP 配置是否正确
   - 确认邮箱已开启 SMTP 服务
   - 检查是否使用授权码而非登录密码
3. **CORS 错误**: Edge Function 已配置 CORS 头，如仍有问题检查 Supabase 项目设置

### 项目结构
```
supabase/
└── functions/
    └── send-email/
        ├── index.ts          # 主函数代码
        └── import_map.json   # 导入映射
```
