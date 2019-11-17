<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: 'welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false"
        show-index>
        <template slot="isok" slot-scope="scope">
          <i style="color:lightgreen" v-if="!scope.row.cat_deleted" class="el-icon-success"></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <template slot="opt">
          <el-button icon="el-icon-edit" size="mini" type="primary">编辑</el-button>
          <el-button icon="el-icon-edit" size="mini" type="danger">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

      <!-- 对话框 -->
      <el-dialog title="添加分类" :close-on-click-modal="false" :visible.sync="addDialogVisible" width="50%" :before-close="addDialogClosed">
        <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级">
            <el-cascader
            select-on-change
            filterable
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="success" @click="addCate">添加</el-button>
          <el-button type="primary" @click="addDialogClosed">关闭</el-button>
        </span>
      </el-dialog>
    </el-card>

  </div>
</template>

<script>
export default {
  created() {
    this.getCateList()
  },
  data() {
    return {
      addDialogVisible: false,
      catelist: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        type: 'template',
        template: 'isok'
      },
      {
        label: '排序',
        type: 'template',
        template: 'sort'
      },
      {
        label: '操作',
        type: 'template',
        template: 'opt'
      }
      ],
      addForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addFormRules: {
        cat_name: [{
          required: true,
          trigger: 'blur',
          message: '请输入分类名称'
        }]
      },
      parentCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      selectedKeys: []
    }
  },
  methods: {
    async getCateList() {
      const {
        data: res
      } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 分页处理
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getCateList()
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getCateList()
    },
    // 对话框
    showAddDialog() {
      this.getParentCateList()
      this.addDialogVisible = true
    },
    addDialogClosed() {
      this.addDialogVisible = false
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },
    async getParentCateList() {
      const {
        data: res
      } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.parentCateList = res.data
    },
    parentCateChanged() {
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    addCate() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }

        this.$message.success('添加分类成功')
        this.getCateList()
        this.addDialogVisible = false
      })
    }
  }
}

</script>

<style>
  .treeTable {
    margin-bottom: 20px;
    margin-top: 20px;
  }
.el-cascader{
  width: 100%;
}
</style>
