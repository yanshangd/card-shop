<template>
  <div class="admin-container">
    <div class="admin-header">
      <div class="admin-logo">发卡商城 · 管理后台</div>
      <div style="display:flex;gap:12px;align-items:center;">
        <div class="back" @click="goHome">返回首页</div>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </div>

    <TheCard>
      <div class="stat-row">
        <div class="stat-item">
          <div class="stat-label">总订单数</div>
          <div class="stat-value">{{ stats.totalOrders }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">总成交额</div>
          <div class="stat-value">¥{{ stats.totalAmount.toFixed(2) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">商品总数</div>
          <div class="stat-value">{{ stats.totalGoods }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">卡密总数</div>
          <div class="stat-value">{{ stats.totalCards }}</div>
        </div>
      </div>
    </TheCard>

    <TheCard>
      <div class="tab-group">
        <div
          v-for="tab in tabs"
          :key="tab"
          class="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </div>
      </div>

      <div v-if="activeTab === '订单管理'">
        <div class="toolbar">
          <input 
            v-model="orderSearch.keyword" 
            type="text" 
            class="search-input" 
            placeholder="搜索订单号/邮箱"
            @keyup.enter="handleSearchOrders"
          >
          <select v-model="orderSearch.status" class="filter-select">
            <option value="">全部状态</option>
            <option value="pending">待支付</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
          </select>
          <button class="admin-btn admin-btn-blue" @click="handleSearchOrders">搜索</button>
          <button class="admin-btn" @click="handleResetOrders">重置</button>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>商品名称</th>
              <th>购买邮箱</th>
              <th>金额</th>
              <th>状态</th>
              <th>下单时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.order_no }}</td>
              <td>{{ order.goods_name }}</td>
              <td>{{ order.email || '-' }}</td>
              <td>¥{{ order.total_amount }}</td>
              <td>
                <span :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td>{{ formatDate(order.created_at) }}</td>
              <td>
                <button
                  v-if="order.status === 'pending'"
                  class="admin-btn admin-btn-blue"
                  @click="handleProcessOrder(order)"
                >
                  处理
                </button>
                <button
                  v-if="order.status !== 'completed'"
                  class="admin-btn admin-btn-green"
                  @click="handleCompleteOrder(order)"
                >
                  完成
                </button>
                <button
                  v-if="order.card_id"
                  class="admin-btn admin-btn-blue"
                  @click="showCardInfo(order)"
                >
                  查看卡密
                </button>
                <button
                  class="admin-btn admin-btn-red"
                  @click="handleDeleteOrder(order)"
                >
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="orders.length === 0 && !loading">
              <td colspan="7" class="empty-text">暂无订单</td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="loading-text">加载中...</div>
      </div>

      <div v-if="activeTab === '商品管理'">
        <div class="toolbar">
          <input 
            v-model="goodsSearch.keyword" 
            type="text" 
            class="search-input" 
            placeholder="搜索商品名称"
            @keyup.enter="handleSearchGoods"
          >
          <select v-model="goodsSearch.categoryId" class="filter-select">
            <option value="">全部分类</option>
            <option v-for="category in categoriesList" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <select v-model="goodsSearch.status" class="filter-select">
            <option value="">全部状态</option>
            <option value="active">上架</option>
            <option value="inactive">下架</option>
          </select>
          <button class="admin-btn admin-btn-blue" @click="handleSearchGoods">搜索</button>
          <button class="admin-btn" @click="handleResetGoods">重置</button>
        </div>
        <div class="toolbar">
          <button class="admin-btn admin-btn-green" @click="showAddGoodsModal">
            + 添加商品
          </button>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>商品名称</th>
              <th>分类</th>
              <th>价格</th>
              <th>库存</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="goods in goodsList" :key="goods.id">
              <td>{{ goods.name }}</td>
              <td>{{ getCategoryName(goods.category_id) }}</td>
              <td>¥{{ goods.price }}</td>
              <td>{{ getAvailableCardCount(goods.id) }}</td>
              <td>
                <span :class="goods.status === 'active' ? 'status-active' : 'status-inactive'">
                  {{ goods.status === 'active' ? '上架' : '下架' }}
                </span>
              </td>
              <td>{{ formatDate(goods.created_at) }}</td>
              <td>
                <button
                  class="admin-btn admin-btn-blue"
                  @click="showEditGoodsModal(goods)"
                >
                  编辑
                </button>
                <button
                  class="admin-btn admin-btn-red"
                  @click="handleDeleteGoods(goods)"
                >
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="goodsList.length === 0 && !loading">
              <td colspan="7" class="empty-text">暂无商品</td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="loading-text">加载中...</div>
      </div>

      <div v-if="activeTab === '分类管理'">
        <div class="toolbar">
          <button class="admin-btn admin-btn-green" @click="showAddCategoryModal">
            + 添加分类
          </button>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>分类名称</th>
              <th>描述</th>
              <th>排序</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categoriesList" :key="category.id">
              <td>{{ category.name }}</td>
              <td>{{ category.description || '-' }}</td>
              <td>{{ category.sort_order }}</td>
              <td>
                <span :class="category.status === 'active' ? 'status-active' : 'status-inactive'">
                  {{ category.status === 'active' ? '启用' : '禁用' }}
                </span>
              </td>
              <td>{{ formatDate(category.created_at) }}</td>
              <td>
                <button
                  class="admin-btn admin-btn-blue"
                  @click="showEditCategoryModal(category)"
                >
                  编辑
                </button>
                <button
                  class="admin-btn admin-btn-red"
                  @click="handleDeleteCategory(category)"
                >
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="categoriesList.length === 0 && !loading">
              <td colspan="6" class="empty-text">暂无分类</td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="loading-text">加载中...</div>
      </div>

      <div v-if="activeTab === '卡密管理'">
        <div class="toolbar">
          <select v-model="filterCards.goodsId" class="filter-select">
            <option value="">全部商品</option>
            <option v-for="goods in goodsList" :key="goods.id" :value="goods.id">
              {{ goods.name }}
            </option>
          </select>
          <select v-model="filterCards.used" class="filter-select">
            <option value="">全部状态</option>
            <option value="false">未使用</option>
            <option value="true">已使用</option>
          </select>
          <button class="admin-btn admin-btn-green" @click="showAddCardModal">
            + 添加卡密
          </button>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>商品名称</th>
              <th>卡密</th>
              <th>状态</th>
              <th>使用时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="card in cardsList" :key="card.id">
              <td>{{ getGoodsName(card.goods_id) }}</td>
              <td class="card-code">{{ card.code }}</td>
              <td>
                <span :class="card.used ? 'status-inactive' : 'status-active'">
                  {{ card.used ? '已使用' : '未使用' }}
                </span>
              </td>
              <td>{{ card.used ? formatDate(card.updated_at) : '-' }}</td>
              <td>
                <button
                  class="admin-btn admin-btn-red"
                  @click="handleDeleteCard(card)"
                >
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="cardsList.length === 0 && !loading">
              <td colspan="5" class="empty-text">暂无卡密</td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="loading-text">加载中...</div>
      </div>

      <div v-if="activeTab === 'V免签管理'">
        <div class="settings-section">
          <div class="settings-title">收款码管理</div>
          <div class="toolbar">
            <select v-model="vmqQrFilter" class="filter-select">
              <option value="">全部</option>
              <option value="wxpay">微信支付</option>
              <option value="alipay">支付宝</option>
            </select>
            <button class="admin-btn admin-btn-green" @click="showAddVmqQrModal">
              + 添加收款码
            </button>
          </div>
          <table class="admin-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
                <th>状态</th>
                <th>使用次数</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="qr in filteredVmqQrList" :key="qr.id">
                <td>{{ qr.name }}</td>
                <td>
                  <span :class="qr.pay_type === 'wxpay' ? 'status-active' : 'status-processing'">
                    {{ qr.pay_type === 'wxpay' ? '微信支付' : '支付宝' }}
                  </span>
                </td>
                <td>
                  <span :class="qr.is_active ? 'status-active' : 'status-inactive'">
                    {{ qr.is_active ? '启用' : '禁用' }}
                  </span>
                </td>
                <td>{{ qr.use_count || 0 }}</td>
                <td>{{ formatDate(qr.created_at) }}</td>
                <td>
                  <button
                    class="admin-btn admin-btn-blue"
                    @click="toggleVmqQrStatus(qr)"
                  >
                    {{ qr.is_active ? '禁用' : '启用' }}
                  </button>
                  <button
                    class="admin-btn admin-btn-red"
                    @click="handleDeleteVmqQr(qr)"
                  >
                    删除
                  </button>
                </td>
              </tr>
              <tr v-if="filteredVmqQrList.length === 0 && !loading">
                <td colspan="6" class="empty-text">暂无收款码</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="settings-section">
          <div class="settings-title">使用说明</div>
          <div class="help-content">
            <p><strong>1. 准备工作</strong></p>
            <ul>
              <li>准备一部安卓手机（用于安装监控端APP）</li>
              <li>下载V免签监控端APK（开源版本）</li>
              <li>准备好微信/支付宝收款码图片</li>
            </ul>
            <p><strong>2. 配置步骤</strong></p>
            <ul>
              <li>在上方添加收款码，上传微信和支付宝的收款码图片</li>
              <li>在系统设置中启用V免签支付，配置通信密钥</li>
              <li>复制"监控端配置地址"到监控端APP</li>
              <li>开启监控端APP的辅助服务，开始监听收款通知</li>
            </ul>
            <p><strong>3. 工作原理</strong></p>
            <ul>
              <li>用户下单时，系统会在原价基础上添加随机金额（如10.23元）</li>
              <li>用户扫码支付时，必须支付完全一致的金额</li>
              <li>监控端APP监听到收款通知后，将金额信息发送给系统</li>
              <li>系统根据金额匹配订单，自动完成发卡</li>
            </ul>
            <p><strong>4. 注意事项</strong></p>
            <ul>
              <li>请确保监控端手机保持网络畅通</li>
              <li>请将微信/支付宝和监控端APP添加到后台白名单</li>
              <li>建议定期检查监控端是否正常运行</li>
            </ul>
          </div>
        </div>
      </div>

      <div v-if="activeTab === '系统设置'">
        <div class="settings-section">
          <div class="settings-title">基本设置</div>
          <div class="settings-item">
            <label>网站名称</label>
            <input v-model="settings.site_name" type="text" class="search-input" placeholder="请输入网站名称">
          </div>
          <div class="settings-item">
            <label>商城公告</label>
            <textarea v-model="settings.site_notice" class="search-input" rows="3" placeholder="请输入商城公告"></textarea>
          </div>
          <div class="settings-item">
            <label>客服信息</label>
            <input v-model="settings.customer_service" type="text" class="search-input" placeholder="请输入客服信息">
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-title">易支付设置</div>
          <div class="settings-item">
            <label>
              <input type="checkbox" v-model="settings.epay_enabled"> 启用易支付
            </label>
          </div>
          <div class="settings-item" v-if="settings.epay_enabled">
            <label>易支付应用ID</label>
            <input v-model="settings.epay_app_id" type="text" class="search-input" placeholder="请输入易支付应用ID">
          </div>
          <div class="settings-item" v-if="settings.epay_enabled">
            <label>易支付应用密钥</label>
            <input v-model="settings.epay_app_secret" type="text" class="search-input" placeholder="请输入易支付应用密钥">
          </div>
          <div class="settings-item" v-if="settings.epay_enabled">
            <label>易支付网关地址</label>
            <input v-model="settings.epay_gateway" type="text" class="search-input" placeholder="请输入易支付网关地址">
          </div>
          <div class="settings-item" v-if="settings.epay_enabled">
            <label>异步回调地址</label>
            <div class="callback-url-box">
              <input :value="epayCallbackUrl" type="text" class="search-input" readonly>
              <button class="admin-btn admin-btn-blue" @click="copyCallbackUrl">复制</button>
            </div>
            <div class="hint-text">请将此地址配置到易支付后台的异步通知URL</div>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-title">V免签支付设置</div>
          <div class="settings-item">
            <label>
              <input type="checkbox" v-model="settings.vmq_enabled"> 启用V免签支付
            </label>
            <div class="hint-text">V免签是个人免签收款方案，无需申请商户，资金直接到账</div>
          </div>
          <template v-if="settings.vmq_enabled">
            <div class="settings-item">
              <label>
                <input type="checkbox" v-model="settings.vmq_wxpay_enabled"> 启用微信支付
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="checkbox" v-model="settings.vmq_alipay_enabled"> 启用支付宝支付
              </label>
            </div>
            <div class="settings-item">
              <label>通信密钥</label>
              <input v-model="settings.vmq_key" type="text" class="search-input" placeholder="请输入通信密钥，用于验证通知">
              <div class="hint-text">用于验证监控端发送的通知，建议设置复杂字符串</div>
            </div>
            <div class="settings-item">
              <label>监控端配置地址</label>
              <div class="callback-url-box">
                <input :value="vmqNotifyUrl" type="text" class="search-input" readonly>
                <button class="admin-btn admin-btn-blue" @click="copyVmqUrl">复制</button>
              </div>
              <div class="hint-text">请将此地址配置到V免签监控端的回调URL</div>
            </div>
          </template>
        </div>

        <div class="settings-section">
          <div class="settings-title">邮件设置</div>
          <div class="settings-item">
            <label>
              <input type="checkbox" v-model="settings.email_enabled"> 启用邮件通知
            </label>
          </div>
          <div class="settings-item" v-if="settings.email_enabled">
            <label>SMTP服务器地址</label>
            <input v-model="settings.email_smtp_host" type="text" class="search-input" placeholder="例如: smtp.qq.com">
          </div>
          <div class="settings-item" v-if="settings.email_enabled">
            <label>SMTP端口</label>
            <input v-model="settings.email_smtp_port" type="text" class="search-input" placeholder="例如: 587">
          </div>
          <div class="settings-item" v-if="settings.email_enabled">
            <label>邮箱账号</label>
            <input v-model="settings.email_username" type="text" class="search-input" placeholder="请输入邮箱账号">
          </div>
          <div class="settings-item" v-if="settings.email_enabled">
            <label>邮箱密码/授权码</label>
            <input v-model="settings.email_password" type="password" class="search-input" placeholder="请输入邮箱密码或授权码">
          </div>
          <div class="settings-item" v-if="settings.email_enabled">
            <label>发件人邮箱</label>
            <input v-model="settings.email_send_from" type="text" class="search-input" placeholder="请输入发件人邮箱">
          </div>
          <div class="settings-item" v-if="settings.email_enabled">
            <label>
              <input type="checkbox" v-model="settings.auto_send_card_email"> 支付后自动发卡到邮箱
            </label>
          </div>
          <div class="settings-item" v-if="settings.email_enabled">
            <label>邮件主题</label>
            <input v-model="settings.email_subject" type="text" class="search-input" placeholder="请输入邮件主题">
          </div>
          <div class="settings-item" v-if="settings.email_enabled">
            <label>邮件模板（HTML，支持变量：{goods_name}, {order_no}, {card_code}）</label>
            <textarea v-model="settings.email_template" class="search-input" rows="12" placeholder="请输入邮件模板"></textarea>
          </div>
          <div class="settings-item" v-if="settings.email_enabled">
            <label>测试邮件</label>
            <div style="display:flex;gap:8px;">
              <input v-model="testEmail" type="text" class="search-input" placeholder="请输入测试邮箱">
              <button class="admin-btn admin-btn-blue" @click="handleSendTestEmail">发送测试</button>
            </div>
          </div>
        </div>

        <div class="settings-actions">
          <button class="admin-btn admin-btn-blue" @click="handleSaveSettings">保存设置</button>
        </div>
      </div>
    </TheCard>

    <div v-if="showGoodsModal" class="modal-overlay" @click.self="closeGoodsModal">
      <div class="modal-content">
        <div class="modal-title">{{ editingGoods ? '编辑商品' : '添加商品' }}</div>
        <div class="modal-item">
          <label>商品名称</label>
          <input v-model="goodsForm.name" type="text" class="search-input" placeholder="请输入商品名称">
        </div>
        <div class="modal-item">
          <label>商品分类</label>
          <select v-model="goodsForm.category_id" class="search-input">
            <option value="">请选择分类</option>
            <option v-for="category in categoriesList" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="modal-item">
          <label>商品价格</label>
          <input v-model.number="goodsForm.price" type="number" class="search-input" placeholder="请输入价格">
        </div>
        <div class="modal-item">
          <label>商品描述</label>
          <textarea v-model="goodsForm.description" class="search-input" rows="3" placeholder="请输入描述"></textarea>
        </div>
        <div class="modal-item">
          <label>库存说明</label>
          <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 8px; color: #666; font-size: 13px;">
            库存自动与卡密数量挂钩，请在"卡密管理"中添加卡密
          </div>
        </div>
        <div class="modal-item">
          <label>状态</label>
          <select v-model="goodsForm.status" class="search-input">
            <option value="active">上架</option>
            <option value="inactive">下架</option>
          </select>
        </div>
        <div class="modal-btns">
          <button class="modal-btn btn-cancel" @click="closeGoodsModal">取消</button>
          <button class="modal-btn btn-pay" @click="handleSaveGoods">保存</button>
        </div>
      </div>
    </div>

    <div v-if="showCardModal" class="modal-overlay" @click.self="closeCardModal">
      <div class="modal-content">
        <div class="modal-title">批量添加卡密</div>
        <div class="modal-item">
          <label>选择商品</label>
          <select v-model="cardForm.goodsId" class="search-input">
            <option value="">请选择商品</option>
            <option v-for="goods in goodsList" :key="goods.id" :value="goods.id">
              {{ goods.name }}
            </option>
          </select>
        </div>
        <div class="modal-item">
          <label>卡密内容（每行一个卡密，格式：代码 或 代码|密码）</label>
          <textarea v-model="cardForm.content" class="search-input" rows="8" placeholder="ABC123-DEF456"></textarea>
        </div>
        <div class="modal-btns">
          <button class="modal-btn btn-cancel" @click="closeCardModal">取消</button>
          <button class="modal-btn btn-pay" @click="handleSaveCards">添加</button>
        </div>
      </div>
    </div>

    <div v-if="showCardInfoModal" class="modal-overlay" @click.self="closeCardInfoModal">
      <div class="modal-content">
        <div class="modal-title">订单卡密信息</div>
        <div class="card-info-box">
          <div class="card-info-item">
            <span class="label">卡密：</span>
            <span class="value">{{ currentOrderCard?.code }}</span>
          </div>
          <div v-if="currentOrderCard?.password" class="card-info-item">
            <span class="label">密码：</span>
            <span class="value">{{ currentOrderCard.password }}</span>
          </div>
        </div>
        <div class="modal-btns">
          <button class="modal-btn btn-pay" @click="closeCardInfoModal">关闭</button>
        </div>
      </div>
    </div>

    <div v-if="showCategoryModal" class="modal-overlay" @click.self="closeCategoryModal">
      <div class="modal-content">
        <div class="modal-title">{{ editingCategory ? '编辑分类' : '添加分类' }}</div>
        <div class="modal-item">
          <label>分类名称</label>
          <input v-model="categoryForm.name" type="text" class="search-input" placeholder="请输入分类名称">
        </div>
        <div class="modal-item">
          <label>分类描述</label>
          <textarea v-model="categoryForm.description" class="search-input" rows="3" placeholder="请输入描述"></textarea>
        </div>
        <div class="modal-item">
          <label>排序</label>
          <input v-model.number="categoryForm.sort_order" type="number" class="search-input" placeholder="数字越小越靠前">
        </div>
        <div class="modal-item">
          <label>状态</label>
          <select v-model="categoryForm.status" class="search-input">
            <option value="active">启用</option>
            <option value="inactive">禁用</option>
          </select>
        </div>
        <div class="modal-btns">
          <button class="modal-btn btn-cancel" @click="closeCategoryModal">取消</button>
          <button class="modal-btn btn-pay" @click="handleSaveCategory">保存</button>
        </div>
      </div>
    </div>

    <!-- V免签收款码添加弹窗 -->
    <div v-if="showVmqQrModal" class="modal-overlay" @click.self="closeVmqQrModal">
      <div class="modal-content">
        <div class="modal-title">添加收款码</div>
        <div class="modal-item">
          <label>收款码名称</label>
          <input v-model="vmqQrForm.name" type="text" class="search-input" placeholder="例如：微信收款码1">
        </div>
        <div class="modal-item">
          <label>支付类型</label>
          <select v-model="vmqQrForm.pay_type" class="search-input">
            <option value="wxpay">微信支付</option>
            <option value="alipay">支付宝</option>
          </select>
        </div>
        <div class="modal-item">
          <label>上传收款码图片</label>
          <input 
            ref="qrImageInput"
            type="file" 
            accept="image/*" 
            class="search-input file-input"
            @change="handleQrImageUpload"
          >
          <div class="hint-text">上传收款码图片后，系统会自动解析二维码内容</div>
        </div>
        <div class="modal-item" v-if="vmqQrForm.qr_content">
          <label>解析结果</label>
          <div class="qr-content-preview">{{ vmqQrForm.qr_content }}</div>
        </div>
        <div class="modal-item" v-if="qrPreviewUrl">
          <label>预览</label>
          <img :src="qrPreviewUrl" class="qr-preview-image" />
        </div>
        <div class="modal-btns">
          <button class="modal-btn btn-cancel" @click="closeVmqQrModal">取消</button>
          <button class="modal-btn btn-pay" @click="handleSaveVmqQr" :disabled="!vmqQrForm.qr_content">保存</button>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">© 2026 {{ siteName }} 后台管理系统</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { goodsApi, cardsApi, ordersApi, categoriesApi, settingsApi } from '@/api/supabaseApi'
import { vmqQrCodeApi } from '@/api/vmqApi'
import TheCard from '@/components/TheCard.vue'
import jsQR from 'jsqr'

const router = useRouter()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

const siteName = computed(() => settingsStore.settings.site_name || '自动发卡商城')

const epayCallbackUrl = computed(() => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://umvcqkigklidfaomvnwd.supabase.co'
  return `${supabaseUrl}/functions/v1/epay-callback`
})

const copyCallbackUrl = async () => {
  try {
    await navigator.clipboard.writeText(epayCallbackUrl.value)
    ElMessage.success('回调地址已复制')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const tabs = ref(['订单管理', '商品管理', '分类管理', '卡密管理', 'V免签管理', '系统设置'])
const activeTab = ref('订单管理')
const loading = ref(false)

const orders = ref([])
const goodsList = ref([])
const categoriesList = ref([])
const cardsList = ref([])
const filterCards = ref({
  goodsId: '',
  used: ''
})

const orderSearch = ref({
  keyword: '',
  status: ''
})

const goodsSearch = ref({
  keyword: '',
  categoryId: '',
  status: ''
})

const showCategoryModal = ref(false)
const editingCategory = ref(null)
const categoryForm = ref({
  name: '',
  description: '',
  sort_order: 0,
  status: 'active'
})

const stats = computed(() => ({
  totalOrders: orders.value.length,
  totalAmount: orders.value.reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
  totalGoods: goodsList.value.length,
  totalCards: cardsList.value.length
}))

const showGoodsModal = ref(false)
const showCardModal = ref(false)
const showCardInfoModal = ref(false)
const editingGoods = ref(null)
const currentOrderCard = ref(null)

const goodsForm = ref({
  name: '',
  description: '',
  price: '',
  category_id: '',
  stock: 0,
  status: 'active'
})

const cardForm = ref({
  goodsId: '',
  content: ''
})

const testEmail = ref('')

// V免签相关
const vmqQrList = ref([])
const vmqQrFilter = ref('')
const showVmqQrModal = ref(false)
const qrPreviewUrl = ref('')
const qrImageInput = ref(null)
const vmqQrForm = ref({
  name: '',
  pay_type: 'wxpay',
  image_url: '',
  qr_content: ''
})

const filteredVmqQrList = computed(() => {
  if (!vmqQrFilter.value) return vmqQrList.value
  return vmqQrList.value.filter(qr => qr.pay_type === vmqQrFilter.value)
})

const vmqNotifyUrl = computed(() => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://umvcqkigklidfaomvnwd.supabase.co'
  return `${supabaseUrl}/functions/v1/vmq-notify`
})

const settings = ref({
  site_name: '',
  site_notice: '',
  customer_service: '',
  payment_methods: [],
  epay_enabled: false,
  epay_app_id: '',
  epay_app_secret: '',
  epay_gateway: '',
  vmq_enabled: false,
  vmq_wxpay_enabled: false,
  vmq_alipay_enabled: false,
  vmq_key: '',
  email_enabled: false,
  email_smtp_host: '',
  email_smtp_port: '587',
  email_username: '',
  email_password: '',
  email_send_from: '',
  auto_send_card_email: false,
  email_subject: '您的卡密已发货',
  email_template: '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="utf-8">\n</head>\n<body style="font-family: Arial, sans-serif; padding: 20px;">\n    <h2 style="color: #1677ff;">感谢您的购买！</h2>\n    <p>您好，您的卡密信息如下：</p>\n    <div style="background: #f5f7fa; padding: 16px; border-radius: 8px; margin: 16px 0;">\n        <p><strong>商品名称：</strong>{goods_name}</p>\n        <p><strong>订单号：</strong>{order_no}</p>\n        <p><strong>卡密：</strong></p>\n        <pre style="background: #fff; padding: 12px; border-radius: 4px; border: 1px solid #e8e8e8;">{card_code}</pre>\n    </div>\n    <p>如有问题，请联系客服。</p>\n    <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>\n</body>\n</html>'
})

const originalSettings = ref({})

const fetchSettings = async () => {
  try {
    await settingsStore.fetchSettings()
    settings.value = { ...settings.value, ...settingsStore.settings }
    originalSettings.value = JSON.parse(JSON.stringify(settings.value))
  } catch (error) {
    console.error('获取设置失败:', error)
  }
}

const getChangedSettings = () => {
  const changes = {}
  for (const key in settings.value) {
    const originalValue = originalSettings.value[key]
    const currentValue = settings.value[key]
    if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
      changes[key] = currentValue
    }
  }
  return changes
}

const handleSaveSettings = async () => {
  try {
    const changes = getChangedSettings()
    if (Object.keys(changes).length === 0) {
      ElMessage.info('没有变化需要保存')
      return
    }
    const res = await settingsStore.updateSettings(changes)
    if (res.success) {
      originalSettings.value = JSON.parse(JSON.stringify(settings.value))
      ElMessage.success('设置保存成功')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  }
}

const handleSendTestEmail = async () => {
  if (!testEmail.value) {
    ElMessage.warning('请输入测试邮箱')
    return
  }
  if (!settings.value.email_smtp_host || !settings.value.email_username || !settings.value.email_password) {
    ElMessage.warning('请先配置完整的SMTP信息')
    return
  }
  
  try {
    ElMessage.info('正在发送测试邮件...')
    
    const template = settings.value.email_template
      .replace('{goods_name}', '测试商品')
      .replace('{order_no}', 'ORD' + Date.now())
      .replace('{card_code}', 'TEST-1234-ABCD-5678')
    
    const res = await settingsApi.sendEmail({
      to: testEmail.value,
      subject: settings.value.email_subject,
      html: template,
      smtpConfig: {
        host: settings.value.email_smtp_host,
        port: settings.value.email_smtp_port,
        user: settings.value.email_username,
        pass: settings.value.email_password,
        from: settings.value.email_send_from || settings.value.email_username
      }
    })
    
    if (res.success) {
      ElMessage.success(res.message || '测试邮件发送成功')
    } else {
      ElMessage.error(res.message || '发送失败')
    }
  } catch (error) {
    console.error('发送测试邮件失败:', error)
    ElMessage.error('发送测试邮件失败')
  }
}

onMounted(() => {
  if (!userStore.isAdminLoggedIn) {
    router.push('/login')
    return
  }
  fetchOrders()
  fetchGoods()
  fetchCategories()
  fetchCards()
  settingsStore.fetchSettings()
  fetchSettings()
})

const goHome = () => {
  router.push('/')
}

const handleLogout = async () => {
  await userStore.adminLogout()
  ElMessage.success('已退出后台')
  router.push('/login')
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const filter = {}
    if (orderSearch.value.keyword) {
      filter.keyword = orderSearch.value.keyword
    }
    if (orderSearch.value.status) {
      filter.status = orderSearch.value.status
    }
    const res = await ordersApi.getOrders(filter)
    if (res.success) {
      orders.value = res.data
    }
  } catch (error) {
    console.error('获取订单失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearchOrders = () => {
  fetchOrders()
}

const handleResetOrders = () => {
  orderSearch.value = {
    keyword: '',
    status: ''
  }
  fetchOrders()
}

const fetchGoods = async () => {
  loading.value = true
  try {
    const params = {}
    if (goodsSearch.value.keyword) {
      params.search = goodsSearch.value.keyword
    }
    if (goodsSearch.value.categoryId) {
      params.categoryId = goodsSearch.value.categoryId
    }
    if (goodsSearch.value.status) {
      params.status = goodsSearch.value.status
    }
    const res = await goodsApi.getGoods(params)
    if (res.success) {
      goodsList.value = res.data
    }
  } catch (error) {
    console.error('获取商品失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearchGoods = () => {
  fetchGoods()
}

const handleResetGoods = () => {
  goodsSearch.value = {
    keyword: '',
    categoryId: '',
    status: ''
  }
  fetchGoods()
}

const fetchCards = async () => {
  loading.value = true
  try {
    const filter = {}
    if (filterCards.value.goodsId) {
      filter.goodsId = filterCards.value.goodsId
    }
    if (filterCards.value.used !== '') {
      filter.used = filterCards.value.used === 'true'
    }
    const res = await cardsApi.getCards(filter)
    if (res.success) {
      cardsList.value = res.data
    }
  } catch (error) {
    console.error('获取卡密失败:', error)
  } finally {
    loading.value = false
  }
}

const handleProcessOrder = async (order) => {
  try {
    await ordersApi.updateOrder(order.id, { status: 'processing' })
    ElMessage.success('已标记为处理中')
    fetchOrders()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleCompleteOrder = async (order) => {
  try {
    const card = await cardsApi.getAvailableCard(order.goods_id)
    if (!card.success) {
      ElMessage.error('该商品没有可用卡密')
      return
    }
    await cardsApi.updateCard(card.data.id, { used: true, order_id: order.id })
    await ordersApi.updateOrder(order.id, {
      status: 'completed',
      card_id: card.data.id
    })
    ElMessage.success('订单已完成')
    fetchOrders()
    fetchCards()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDeleteOrder = async (order) => {
  try {
    await ElMessageBox.confirm('确定要删除这个订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await ordersApi.deleteOrder(order.id)
    ElMessage.success('删除成功')
    fetchOrders()
  } catch {
  }
}

const showAddGoodsModal = () => {
  editingGoods.value = null
  goodsForm.value = {
    name: '',
    description: '',
    price: '',
    category_id: '',
    status: 'active'
  }
  showGoodsModal.value = true
}

const showEditGoodsModal = (goods) => {
  editingGoods.value = goods
  goodsForm.value = {
    name: goods.name,
    description: goods.description,
    price: goods.price,
    category_id: goods.category_id,
    status: goods.status
  }
  showGoodsModal.value = true
}

const closeGoodsModal = () => {
  showGoodsModal.value = false
}

const handleSaveGoods = async () => {
  if (!goodsForm.value.name || !goodsForm.value.price) {
    ElMessage.warning('请填写完整信息')
    return
  }
  try {
    const saveData = {
      ...goodsForm.value,
      category_id: goodsForm.value.category_id || null
    }
    if (editingGoods.value) {
      const res = await goodsApi.updateGoods(editingGoods.value.id, saveData)
      if (!res.success) {
        throw new Error(res.message)
      }
      ElMessage.success('更新成功')
    } else {
      const res = await goodsApi.createGoods(saveData)
      if (!res.success) {
        throw new Error(res.message)
      }
      ElMessage.success('添加成功')
    }
    closeGoodsModal()
    fetchGoods()
    fetchCards()
  } catch (error) {
    console.error('保存商品失败:', error)
    ElMessage.error('保存失败: ' + (error.message || '未知错误'))
  }
}

const handleDeleteGoods = async (goods) => {
  try {
    await ElMessageBox.confirm('删除商品会同时删除所有关联卡密，确定吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await goodsApi.deleteGoods(goods.id)
    ElMessage.success('删除成功')
    fetchGoods()
    fetchCards()
  } catch {
  }
}

const showAddCardModal = () => {
  cardForm.value = {
    goodsId: '',
    content: ''
  }
  showCardModal.value = true
}

const closeCardModal = () => {
  showCardModal.value = false
}

const handleSaveCards = async () => {
  if (!cardForm.value.goodsId || !cardForm.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }
  try {
    const lines = cardForm.value.content.trim().split('\n').filter(line => line.trim())
    let count = 0
    for (const line of lines) {
      const parts = line.trim().split('|')
      const code = parts[0].trim()
      const password = parts[1]?.trim() || null
      await cardsApi.updateCard(null, {
        goods_id: cardForm.value.goodsId,
        code,
        password,
        used: false
      })
      count++
    }
    ElMessage.success(`成功添加 ${count} 个卡密`)
    closeCardModal()
    fetchCards()
    fetchGoods()
  } catch (error) {
    ElMessage.error('添加失败')
    console.error(error)
  }
}

const handleDeleteCard = async (card) => {
  try {
    await ElMessageBox.confirm('确定要删除这个卡密吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cardsApi.deleteCard(card.id)
    ElMessage.success('删除成功')
    fetchCards()
  } catch {
  }
}

const showCardInfo = async (order) => {
  try {
    const res = await cardsApi.getCards({ id: order.card_id })
    if (res.success && res.data.length > 0) {
      currentOrderCard.value = res.data[0]
      showCardInfoModal.value = true
    }
  } catch (error) {
    console.error(error)
  }
}

const closeCardInfoModal = () => {
  showCardInfoModal.value = false
  currentOrderCard.value = null
}

const getGoodsName = (goodsId) => {
  const goods = goodsList.value.find(g => g.id === goodsId)
  return goods ? goods.name : '-'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'status-pending',
    processing: 'status-processing',
    completed: 'status-completed'
  }
  return classes[status] || 'status-pending'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待支付',
    processing: '处理中',
    completed: '已完成'
  }
  return texts[status] || status
}

const getCategoryName = (categoryId) => {
  if (!categoryId) return '-'
  const category = categoriesList.value.find(c => c.id === categoryId)
  return category ? category.name : '-'
}

const getAvailableCardCount = (goodsId) => {
  return cardsList.value.filter(card => card.goods_id === goodsId && !card.used).length
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await categoriesApi.getCategories()
    if (res.success) {
      categoriesList.value = res.data
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  } finally {
    loading.value = false
  }
}

const showAddCategoryModal = () => {
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    description: '',
    sort_order: 0,
    status: 'active'
  }
  showCategoryModal.value = true
}

const showEditCategoryModal = (category) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    description: category.description,
    sort_order: category.sort_order,
    status: category.status
  }
  showCategoryModal.value = true
}

const closeCategoryModal = () => {
  showCategoryModal.value = false
}

const handleSaveCategory = async () => {
  if (!categoryForm.value.name) {
    ElMessage.warning('请填写分类名称')
    return
  }
  try {
    if (editingCategory.value) {
      await categoriesApi.updateCategory(editingCategory.value.id, categoryForm.value)
      ElMessage.success('更新成功')
    } else {
      await categoriesApi.createCategory(categoryForm.value)
      ElMessage.success('添加成功')
    }
    closeCategoryModal()
    fetchCategories()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleDeleteCategory = async (category) => {
  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await categoriesApi.deleteCategory(category.id)
    ElMessage.success('删除成功')
    fetchCategories()
  } catch {
  }
}

// V免签收款码管理
const fetchVmqQrCodes = async () => {
  loading.value = true
  try {
    const res = await vmqQrCodeApi.getQrCodes()
    if (res.success) {
      vmqQrList.value = res.data
    }
  } catch (error) {
    console.error('获取收款码列表失败:', error)
  } finally {
    loading.value = false
  }
}

const showAddVmqQrModal = () => {
  vmqQrForm.value = {
    name: '',
    pay_type: 'wxpay',
    image_url: '',
    qr_content: ''
  }
  qrPreviewUrl.value = ''
  showVmqQrModal.value = true
}

const closeVmqQrModal = () => {
  showVmqQrModal.value = false
  qrPreviewUrl.value = ''
  if (qrImageInput.value) {
    qrImageInput.value.value = ''
  }
}

// 解析二维码图片
const handleQrImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    // 创建预览URL
    qrPreviewUrl.value = URL.createObjectURL(file)

    // 读取图片并解析二维码
    const imageData = await loadImageFromFile(file)
    const qrContent = parseQRCode(imageData)

    if (qrContent) {
      vmqQrForm.value.qr_content = qrContent
      ElMessage.success('二维码解析成功')
    } else {
      ElMessage.error('未能识别二维码，请确保图片清晰')
    }
  } catch (error) {
    console.error('解析二维码失败:', error)
    ElMessage.error('解析二维码失败: ' + error.message)
  }
}

// 加载图片文件
const loadImageFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        resolve(imageData)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target.result
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

// 解析二维码
const parseQRCode = (imageData) => {
  const code = jsQR(imageData.data, imageData.width, imageData.height)
  return code ? code.data : null
}

const handleSaveVmqQr = async () => {
  if (!vmqQrForm.value.name || !vmqQrForm.value.qr_content) {
    ElMessage.warning('请填写完整信息并上传收款码图片')
    return
  }
  try {
    const res = await vmqQrCodeApi.createQrCode({
      name: vmqQrForm.value.name,
      pay_type: vmqQrForm.value.pay_type,
      qr_content: vmqQrForm.value.qr_content,
      image_url: vmqQrForm.value.image_url || ''
    })
    if (res.success) {
      ElMessage.success('添加成功')
      closeVmqQrModal()
      fetchVmqQrCodes()
    } else {
      ElMessage.error(res.message || '添加失败')
    }
  } catch (error) {
    console.error('添加收款码失败:', error)
    ElMessage.error('添加失败')
  }
}

const toggleVmqQrStatus = async (qr) => {
  try {
    const res = await vmqQrCodeApi.updateQrCode(qr.id, {
      is_active: !qr.is_active
    })
    if (res.success) {
      ElMessage.success(qr.is_active ? '已禁用' : '已启用')
      fetchVmqQrCodes()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDeleteVmqQr = async (qr) => {
  try {
    await ElMessageBox.confirm('确定要删除这个收款码吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await vmqQrCodeApi.deleteQrCode(qr.id)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchVmqQrCodes()
    }
  } catch {
  }
}

const copyVmqUrl = async () => {
  try {
    await navigator.clipboard.writeText(vmqNotifyUrl.value)
    ElMessage.success('回调地址已复制')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 监听标签页切换
watch(activeTab, (newVal) => {
  if (newVal === 'V免签管理') {
    fetchVmqQrCodes()
  }
})
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.filter-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  min-width: 140px;
}

.empty-text {
  text-align: center;
  color: #999;
  padding: 40px;
}

.loading-text {
  text-align: center;
  color: #666;
  padding: 20px;
}

.status-pending {
  color: #faad14;
}

.status-processing {
  color: #1677ff;
}

.status-completed {
  color: #00c48c;
}

.status-active {
  color: #00c48c;
}

.status-inactive {
  color: #ff4d4f;
}

.card-code {
  font-family: monospace;
  font-size: 13px;
  word-break: break-all;
}

.system-info {
  max-width: 600px;
}

.info-item {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  width: 120px;
  color: #666;
  font-weight: 500;
}

.info-value {
  color: #333;
  flex: 1;
}

.card-info-box {
  padding: 16px 0;
}

.card-info-item {
  display: flex;
  margin-bottom: 12px;
}

.card-info-item .label {
  width: 60px;
  color: #666;
  font-weight: 500;
}

.card-info-item .value {
  flex: 1;
  color: #333;
  word-break: break-all;
}

.settings-section {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(22, 119, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(22, 119, 255, 0.08);
}

.settings-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.settings-item {
  margin-bottom: 16px;
}

.settings-item label {
  display: block;
  color: #666;
  font-weight: 500;
  margin-bottom: 8px;
}

.settings-item input[type="text"],
.settings-item input[type="password"],
.settings-item textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.25s ease;
}

.settings-item input[type="text"]:focus,
.settings-item input[type="password"]:focus,
.settings-item textarea:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.1);
}

.settings-item input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

.settings-actions {
  margin-top: 24px;
}

.callback-url-box {
  display: flex;
  gap: 8px;
}

.callback-url-box .search-input {
  flex: 1;
  background: #f5f7fa;
  cursor: not-allowed;
}

.hint-text {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.help-content {
  line-height: 1.8;
  color: #666;
}

.help-content p {
  margin: 16px 0 8px;
  color: #333;
}

.help-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.help-content li {
  margin: 4px 0;
}

.help-content strong {
  color: #1677ff;
}

.file-input {
  padding: 8px;
  font-size: 14px;
}

.qr-content-preview {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  font-family: monospace;
  font-size: 13px;
  word-break: break-all;
  color: #333;
  border: 1px solid #e8e8e8;
}

.qr-preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}
</style>
