<template>
  <div>
<!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: 'welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <el-row :gutter="20">
        <el-col :span="7">
          <el-input @change="getGoodsList" clearable placeholder="请输入内容" v-model="queryInfo.query"
            class="input-with-select">
            <el-button @click="getGoodsList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 用戶列表区 -->
      <el-table :data="goods" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="70px"></el-table-column>
        <el-table-column label="商品数量" prop="goods_number" width="70px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="200px">
            <template slot-scope="scope">
                <span>{{scope.row.add_time | dateFormat}}</span>
            </template>
        </el-table-column>

        <el-table-column label="操作" prop="mg_state" width="200px">
          <template slot-scope="scope" >
            <el-tooltip :enterable="false" class="item" effect="dark" content="编辑" placement="top">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip :enterable="false" class="item" effect="dark" content="删除" placement="top">
              <el-button @click="removeGoodById(scope.row.goods_id)" type="danger" icon="el-icon-delete" size="mini"></el-button>
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
  </div>
</template>

<script>
export default {
  created() {
    this.getGoodsList()
  },
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      goods: [],
      total: 0
    }
  },
  methods: {
    async getGoodsList() {
      const {
        data: res
      } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.goods = res.data.goods
      this.total = res.data.total
    },
    async  removeGoodById(id) {
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
        this.doDeleteGood(id)
      }
    },
    async doDeleteGood(id) {
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },
    // 分页处理
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getGoodsList()
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getGoodsList()
    },
    goAddPage() {
      this.$router.push('goods/add')
    }
  }
}

</script>

<style scoped>

</style>
