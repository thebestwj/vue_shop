<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: 'welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
        <el-col>
          <el-table :data="rolesList" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row :class="['vcenter','bd-bottom', i1 ===0?'bd-top':'']"
                  v-for="( item1 , i1 ) in scope.row.children" :key="item1.id">
                  <!-- 一级权限 -->
                  <el-col :span="5">
                    <el-tag @close="removeRightById(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 2级权限 -->
                  <el-col :span="19">
                    <el-row :class="['vcenter',i2 ===0?'':'bd-top']" v-for="( item2 ,i2 ) in item1.children"
                      :key="item2.id">
                      <el-col :span="6">
                        <el-tag @close="removeRightById(scope.row,item2.id)" closable type="success">{{item2.authName}}
                        </el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                      <!-- 3级权限 -->
                      <el-col :span="18">
                        <el-tag @close="removeRightById(scope.row,item3.id)" closable
                          v-for="( item3  ) in item2.children" :key="item3.id" type="warning">{{item3.authName}}
                        </el-tag>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300px">
              <template slot-scope="scope">
                <el-button @click="showEditRightDialog(scope.row)" type="primary" icon="el-icon-edit" size="mini">编辑
                </el-button>
                <el-button @click="showEditRightDialog(scope.row)" type="warning" icon="el-icon-setting" size="mini">分配权限
                </el-button>
                <el-button @click="showEditRightDialog(scope.row)" type="danger" icon="el-icon-delete" size="mini">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-card>

    <!-- 分配权限 -->
    <el-dialog title="分配权限" :visible.sync="editRightDialogVisible" width="30%" @close="editRightDialogClosed">
      <!-- 树形控件 -->
        <el-tree show-checkbox default-expand-all
        :default-checked-keys="defKeys" ref="treeRef"
        :data="rightList" :props="treeProps" node-key="id"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRight">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  created() {
    this.getRolesList()
  },
  data() {
    return {
      rolesList: [],
      rightList: [],
      editRightDialogVisible: false,
      //  树形属性
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: [],
      roleId: ''
    }
  },
  methods: {
    async getRolesList() {
      const {
        data: res
      } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rolesList = res.data
    },
    async removeRightById(role, rightId) {
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
      } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('已删除')
      role.children = res.data
    },
    async showEditRightDialog(role) {
      this.roleId = role.id
      const {
        data: res
      } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightList = res.data
      this.getDefKeys(role, this.defKeys)
      this.editRightDialogVisible = true
    },
    getDefKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getDefKeys(item, arr)
      })
    },
    editRightDialogClosed() {
      this.defKeys = []
    },
    async editRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const str = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: str })

      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      this.$message.success('分配权限成功')
      this.getRolesList()
      this.editRightDialogVisible = false
    }
  }
}

</script>

<style lang="less">
  .el-tag {
    margin: 7px;
  }

  .bd-top {
    border-top: 1px solid lightgray;
  }

  .bd-bottom {
    border-bottom: 1px solid lightgray;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }

</style>
