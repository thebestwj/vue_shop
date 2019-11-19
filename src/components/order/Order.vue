<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: 'welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input @change="getOrderList" clearable placeholder="请输入内容" v-model="queryInfo.query"
            class="input-with-select">
            <el-button @click="getOrderList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">添加</el-button>
        </el-col>
      </el-row>
      <!-- 用戶列表区 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="70px"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay" width="100px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay === '0'" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="200px">
          <template slot-scope="scope">
            <span>{{scope.row.create_time | dateFormat}}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" prop="mg_state" width="200px">
          <template >
            <el-tooltip :enterable="false" class="item" effect="dark" content="编辑" placement="top">
              <el-button @click="showBox()" type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip :enterable="false" class="item" effect="dark" content="物流" placement="top">
              <el-button @click="showProgress()" type="success" icon="el-icon-location" size="mini">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 对话框 -->
    <el-dialog title="添加分类" :close-on-click-modal="false" :visible.sync="addDialogVisible" width="50%"
      :before-close="addDialogClosed">
      <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="80px">
        <el-form-item label="省市区" prop="address1">
          <el-cascader select-on-change filterable v-model="addForm.address1" :options="cityData" :props="cascaderProps"
            clearable></el-cascader>

        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addForm.address2"></el-input>
        </el-form-item>

      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="addCate">确定</el-button>
        <el-button type="info" @click="this.$refs.addFormRef.resetFields()">重置</el-button>
        <el-button type="primary" @click="addDialogClosed">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 物流 -->
    <!-- 对话框 -->
    <el-dialog title="物流信息" :close-on-click-modal="false" :visible.sync="progressDialogVisible" width="50%">
        <!-- 时间线 -->
        <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in progressInfo"
      :key="index"
      :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getOrderList()
  },
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      cityData: [{
        value: '北京市',
        label: '北京市'
      }, {
        value: '浙江省',
        label: '浙江省',
        children: [{
          value: '杭州市',
          label: '杭州市'
        }]
      }],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'value',
        label: 'label',
        children: 'children',
        checkStrictly: true
      },
      orderList: [],
      addForm: {
        address1: [],
        address2: ''
      },
      addFormRules: {
        address1: [{
          required: true,
          trigger: 'blur'
        }],
        address2: [{
          required: true,
          trigger: 'blur'
        }]
      },
      addDialogVisible: false,
      progressDialogVisible: false,
      progressInfo: []
    }
  },
  methods: {
    async getOrderList() {
      const {
        data: res
      } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    async removeOrderById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message({
          type: 'info',
          message: '已取消删除'
        })
      } else {
        this.doDeleteOrder(id)
      }
    },
    async doDeleteOrder(id) {
      const {
        data: res
      } = await this.$http.delete(`orders/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('删除商品成功')
      this.getOrderList()
    },
    // 分页处理
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getOrderList()
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getOrderList()
    },
    showBox() {
      this.addDialogVisible = true
    },
    addDialogClosed() {
      this.addDialogVisible = false
      this.$refs.addFormRef.resetFields()
    },
    async showProgress() {
      const {
        data: res
      } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.progressInfo = res.data
      this.progressDialogVisible = true
    }

  }
}

</script>

<style lang="less" scoped>

</style>
