<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: 'welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="只允许选择三级分类" type="warning" effect="dark" :closable="false">
      </el-alert>

      <el-row class="cat_opt">
        <el-col>
          <span>选择分类</span>
          <el-cascader select-on-change filterable v-model="selectedKeys" :options="cateList" :props="cateListProps"
            @change="cateListChanged" clearable></el-cascader>
        </el-col>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button @click="addDialogVisible =true" type="primary" :disabled="isBtnDisabled">
            添加参数
          </el-button>

          <!--动态参数-->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag @close="handleClose(i,scope.row)" closable v-for="(item,i) in scope.row.attr_vals" :key="i">
                  {{item}}
                </el-tag>
                <!-- 可编辑tag -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                  @keyup.enter.native="handleInputConfirm(scope)" @blur="handleInputConfirm(scope)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button @click="showEditDialog(scope.row.attr_id)" icon="el-icon-edit" size="mini" type="primary">编辑
                </el-button>
                <el-button @click="deleteParam(scope.row.attr_id)" icon="el-icon-edit" size="mini" type="danger">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态参数" name="only">
          <el-button @click="addDialogVisible =true" type="primary" :disabled="isBtnDisabled">添加属性</el-button>
          <!--静态参数-->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag @close="handleClose(i,scope.row)" closable v-for="(item,i) in scope.row.attr_vals" :key="i">
                  {{item}}
                </el-tag>
                <!-- 可编辑tag -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                  @keyup.enter.native="handleInputConfirm(scope)" @blur="handleInputConfirm(scope)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button @click="showEditDialog(scope.row.attr_id)" icon="el-icon-edit" size="mini" type="primary">编辑
                </el-button>
                <el-button icon="el-icon-edit" size="mini" type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

        </el-tab-pane>
      </el-tabs>

    </el-card>

    <!-- 对话框 -->
    <el-dialog :title="'添加'+ dialogText" :visible.sync="addDialogVisible" width="50%" :before-close="addDialogClosed">
      <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="120px">
        <el-form-item :label="dialogText+'名称'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogClosed">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog :title="'修改'+ dialogText" :visible.sync="editDialogVisible" width="50%" :before-close="editDialogClosed">
      <el-form ref="editFormRef" :rules="editFormRules" :model="editForm" label-width="120px">
        <el-form-item :label="dialogText+'名称'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogClosed">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

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
      editDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{
          required: true,
          message: '请输入属性名称',
          trigger: 'blur'
        }]
      },
      editForm: {},
      editFormRules: {
        attr_name: [{
          required: true,
          message: '请输入属性名称',
          trigger: 'blur'
        }]
      },
      cateList: [],
      total: 0,
      selectedKeys: [],
      cateListProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      activeName: 'many',
      manyTableData: [],
      onlyTableData: []
    }
  },
  methods: {
    async getCateList() {
      const {
        data: res
      } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.cateList = res.data
      this.total = res.data.total
    },
    cateListChanged() {
      this.getParamsData()
    },
    handleTabClick() {
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      const {
        data: res
      } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      }
      if (this.activeName === 'only') {
        this.onlyTableData = res.data
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
    },
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const {
          data: res
        } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }

        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
      this.editDialogVisible = false
    },
    async showEditDialog(id) {
      const {
        data: res
      } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
      this.editDialogVisible = true
      this.editId = id
    },
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const {
          data: res
        } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }

        this.$message.success('修改参数成功')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    async deleteParam(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
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
        this.doDeleteParam(id)
      }
    },
    async doDeleteParam(id) {
      const {
        data: res
      } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    handleInputConfirm(scope) {
      if (scope.row.inputValue.trim().length === 0) {
        scope.row.inputValue = ''
        scope.row.inputVisible = false
      }
      scope.row.attr_vals.push(scope.row.inputValue.trim())
      scope.row.inputVisible = false
      scope.row.inputValue = ''
      // 保存
      this.saveAttrVals(scope.row)
    },
    async saveAttrVals(row) {
      const {
        data: res
      } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('操作参数成功')
    },
    showInput(scope) {
      scope.row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId() {
      if (this.selectedKeys.length !== 3) {
        return null
      }
      return this.selectedKeys[this.selectedKeys.length - 1]
    },
    dialogText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}

</script>

<style scoped>
  .cat_opt {
    margin: 15px;
  }
 .input-new-tag{
   width: 100px;
 }
</style>
