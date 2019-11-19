<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: 'welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/home/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 提示 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>

      <!-- steps -->
      <el-steps align-center :space="200" :active="activeIndex - 0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm"
        label-position="top">

        <el-tabs @tab-click="tabclicked" :before-leave="beforeTabLeave" v-model="activeIndex" :tab-position="'left'">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader select-on-change filterable v-model="addForm.goods_cat" :options="cateList"
                :props="cateListProps" @change="cateListChanged" clearable></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border v-for="(cb,i) in item.attr_vals" :key="i" :label="cb"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <!-- 上传 -->
            <el-upload :on-success="handleSuccess" :headers="headersObj" :action="uploadURL" :on-preview="handlePreview"
              :on-remove="handleRemove" list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>

          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>

            <el-button @click="addGoods" type="primary" class="btnAdd">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>

      </el-form>
    </el-card>

    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="preImg">
    </el-dialog>

  </div>
</template>

<script>
import _ from 'lodash'
export default {
  created() {
    this.getCateList()
  },
  data() {
    return {
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      previewPath: '',
      previewVisible: false,
      cateList: [],
      cateListProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      manyTableData: {},
      onlyTableData: {},
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [{
          required: true,
          message: '请输入',
          trigger: 'blur'
        }],
        goods_price: [{
          required: true,
          message: '请输入',
          trigger: 'blur'
        }],
        goods_weight: [{
          required: true,
          message: '请输入',
          trigger: 'blur'
        }],
        goods_number: [{
          required: true,
          message: '请输入',
          trigger: 'blur'
        }],
        goods_cat: [{
          required: true,
          message: '请输入',
          trigger: 'blur'
        }]
      }
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
    },
    cateListChanged() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      if (!(activeName === '1' && oldActiveName === '0')) return true
      if (this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    tabclicked() {
      if (this.activeIndex === '1') {
        this.getManyParam()
      }
      if (this.activeIndex === '2') {
        this.getOnlyParam()
      }
    },
    async getOnlyParam() {
      const {
        data: res
      } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: 'only'
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.onlyTableData = res.data
    },
    async getManyParam() {
      const {
        data: res
      } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: 'many'
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
      })
      this.manyTableData = res.data
    },
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x =>
        x.pic === filePath)
      this.addForm.pics.slice(i, 1)
    },
    handleSuccess(response) {
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(picInfo)
    },
    addGoods() {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) {
          return this.$message.error('未填写完整')
        }
      })

      const form = _.cloneDeep(this.addForm)
      form.goods_cat = this.addForm.goods_cat.join(',')

      // 处理动态参数和属性
      this.manyTableData.forEach(item => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        }
        this.addForm.attrs.push(newInfo)
      })

      this.onlyTableData.forEach(item => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        this.addForm.attrs.push(newInfo)
      })

      form.attrs = this.addForm.attrs

      this.doAddGood(form)
    },
    async doAddGood(form) {
      const {
        data: res
      } = await this.$http.post('goods', form)
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg)
      }

      this.$message.success('添加成功')
      this.$router.push('/home/goods')
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else return null
    }
  }
}

</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 5px 0 0 !important;
  }

  .preImg {
    width: 100%;
  }

.btnAdd{
  margin: 10px
}
</style>
