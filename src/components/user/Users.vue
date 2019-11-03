<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: 'welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input @change="getUserList" clearable v-model="queryInfo.query" placeholder="请输入内容"
            class="input-with-select">
            <el-button @click="getUserList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible =true">添加</el-button>
        </el-col>
      </el-row>
      <!-- 用戶列表区 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch @change="userStateChange(scope.row)" v-model="scope.row.mg_state">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="mg_state" width="200px">
          <template slot-scope="scope" >
            <el-tooltip :enterable="false" class="item" effect="dark" content="编辑" placement="top">
              <el-button @click="showEditDialog(scope.row.id)" type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip :enterable="false" class="item" effect="dark" content="分配角色" placement="top">
              <el-button @click="showSetRoleDialog(scope.row)" type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip :enterable="false" class="item" effect="dark" content="删除" placement="top">
              <el-button @click="removeUserById(scope.row.id)" type="danger" icon="el-icon-delete" size="mini"></el-button>
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

    <!-- 添加对话框 -->
    <el-dialog @close="addDialogClosed()" title="添加用户" :visible.sync="addDialogVisible" width="50%" >
            <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px" class="add_form">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username">
                    </el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password">
                    </el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email">
                    </el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile">
                    </el-input>
                </el-form-item>
            </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
        <el-button type="info" @click="resetaddForm()">重置</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <!-- 对话框 -->
    <el-dialog @close="editDialogClosed()" title="修改用户" :visible.sync="editDialogVisible" width="50%" >
            <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="70px" class="edit_form">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" disabled>
                    </el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="editForm.password" disabled>
                    </el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email">
                    </el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile">
                    </el-input>
                </el-form-item>
            </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser()">确 定</el-button>
        <el-button type="info" @click="reseteditForm()">重置</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog @close="setRoleDialogClosed()" title="分配角色"
    :visible.sync="setRoleDialogVisible" width="50%" >
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>分配</p>
        <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
          v-for="item in rolesList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id">
        </el-option>
        </el-select>
      </div>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRole()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList()
  },
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userlist: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      setRoleDialogVisible: false,
      userInfo: {},
      rolesList: [],
      selectedRoleId: '',
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {},
      addFormRules: {
        username: [
          { required: true, message: '用户名不为空', trigger: 'blur' },
          { min: 3, max: 10, message: '长度3-10', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不为空', trigger: 'blur' },
          { min: 3, max: 10, message: '长度3-10', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱不为空', trigger: 'blur' },
          { min: 3, max: 10, message: '长度3-10', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号不为空', trigger: 'blur' },
          { min: 3, max: 10, message: '长度3-10', trigger: 'blur' }
        ]
      },
      editFormRules: {
        username: [
          { required: true, message: '用户名不为空', trigger: 'blur' },
          { min: 3, max: 10, message: '长度3-10', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱不为空', trigger: 'blur' },
          { min: 3, max: 10, message: '长度3-10', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号不为空', trigger: 'blur' },
          { min: 3, max: 10, message: '长度3-10', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getUserList() {
      const {
        data: res
      } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 分页处理
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getUserList()
    },

    // 修改state
    async userStateChange(userInfo) {
      const {
        data: res
      } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('更新用户状态成功')
    },

    // 添加
    resetaddForm() {
      this.addForm = {
        username: '',
        password: '',
        email: '',
        mobile: ''
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('参数错误')
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getUserList()
      })
    },

    // 修改
    async showEditDialog(id) {
      const {
        data: res
      } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('参数错误')
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('修改用户成功')
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    reseteditForm() {
      this.$refs.editFormRef.resetFields()
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const {
        data: res
      } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('已删除')
      this.getUserList()
    },
    async showSetRoleDialog(userInfo) {
      this.userInfo = userInfo

      const {
        data: res
      } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    async setRole() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择角色')
      }

      const {
        data: res
      } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.$message.success('分配角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}

</script>

<style lang="less" scoped>

</style>
