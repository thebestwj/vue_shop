<template>
<div>
  <el-row :gutter="20" style="height:60%">
    <el-col :span="18">
      <el-card>
        欢迎界面主信息
        <div id="main" style="width: 100%;height:400px;"></div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card>
          消息
          <div id="main2" style="width: 100%;height:500px;"></div>
      </el-card>
    </el-col>
  </el-row>
  <el-row style="height:40%">
    <el-card>
        副信息
    </el-card>
  </el-row>
  </div>
</template>

<script>
import echarts from 'echarts'
export default {
  mounted() {
    var myChart = echarts.init(document.getElementById('main'))
    var option = {
      legend: {},
      tooltip: {
        trigger: 'axis',
        showContent: false
      },
      dataset: {
        source: [
          ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
          ['Matcha Latte', 41.1, 30.4, 65.1, 53.3, 83.8, 98.7],
          ['Milk Tea', 86.5, 92.1, 85.7, 83.1, 73.4, 55.1],
          ['Cheese Cocoa', 24.1, 67.2, 79.5, 86.4, 65.2, 82.5],
          ['Walnut Brownie', 55.2, 67.1, 69.2, 72.4, 53.9, 39.1]
        ]
      },
      xAxis: { type: 'category' },
      yAxis: { gridIndex: 0 },
      grid: { top: '55%' },
      series: [
        { type: 'line', smooth: true, seriesLayoutBy: 'row' },
        { type: 'line', smooth: true, seriesLayoutBy: 'row' },
        { type: 'line', smooth: true, seriesLayoutBy: 'row' },
        { type: 'line', smooth: true, seriesLayoutBy: 'row' },
        {
          type: 'pie',
          id: 'pie',
          radius: '30%',
          center: ['50%', '25%'],
          label: {
            formatter: '{b}: {@2012} ({d}%)'
          },
          encode: {
            itemName: 'product',
            value: '2012',
            tooltip: '2012'
          }
        }
      ]
    }

    myChart.on('updateAxisPointer', function (event) {
      var xAxisInfo = event.axesInfo[0]
      if (xAxisInfo) {
        var dimension = xAxisInfo.value + 1
        myChart.setOption({
          series: {
            id: 'pie',
            label: {
              formatter: '{b}: {@[' + dimension + ']} ({d}%)'
            },
            encode: {
              value: dimension,
              tooltip: dimension
            }
          }
        })
      }
    })

    myChart.setOption(option)

    // 第二个图
    myChart = echarts.init(document.getElementById('main2'))
    var data = []

    for (var i = 0; i <= 100; i++) {
      var theta = i / 100 * 360
      var r = 5 * (1 + Math.sin(theta / 180 * Math.PI))
      data.push([r, theta])
    }

    option = {
      title: {
        text: '极坐标双数值轴'
      },
      legend: {
        data: ['line']
      },
      polar: {},
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      angleAxis: {
        type: 'value',
        startAngle: 0
      },
      radiusAxis: {
      },
      series: [{
        coordinateSystem: 'polar',
        name: 'line',
        type: 'line',
        data: data
      }]
    }

    myChart.setOption(option)
  }
}

</script>

<style scoped>
div,.el-card{
height: 99%;
}
.el-row{
    margin:0 0 1% 0;
}
</style>
