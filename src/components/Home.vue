<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" height="30px">
        <span>电商管理后台 - 用户主页</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="menucoll ?'64px':'200px'">
        <div class="toggle-button" @click="toggleColl">|||</div>
        <el-menu router :collapse="menucoll" class="el-menu-vertical-demo" background-color="#545c64" text-color="#fff"
          active-text-color="#ffd04b" :default-active="activepath">
          <!-- 一级菜单 -->
          <el-submenu :index="'/'+item.path" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{item.authName}}</span>
            </template>

            <el-menu-item @click="saveState('/home/'+subItem.path)" :index="'/home/'+subItem.path"
              v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>

          </el-submenu>

        </el-menu>

      </el-aside>
      <!-- Main -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      menucoll: false,
      activepath: ''
    }
  },
  created() {
    this.getMenus()
    this.activepath = window.sessionStorage.getItem('activepath')
  },
  methods: {
    async getMenus() {
      const {
        data: res
      } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    },
    logout() {
      window.sessionStorage.clear()
      this.$message.success('已经退出')
      this.$router.push('/login')
    },
    toggleColl() {
      this.menucoll = !this.menucoll
    },
    //  保存激活状态
    saveState(path) {
      this.activepath = path
      window.sessionStorage.setItem('activepath', path)
    }
  }
}

</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #333744;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: white;
    font-size: 20px;

    >div {
      display: flex;
      align-items: center;

      >span {
        margin: 0 0 0 10px;
      }

    }

  }

  .el-aside {
    background-color: #545c64;
  }

  .el-main {
    background-color: rgb(209, 230, 245);
  }

  .toggle-button {
    text-align: center;
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: white;
    letter-spacing: 0.2em;
    cursor: pointer;
  }

</style>
