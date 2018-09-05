/**
 * Author: laohu
 * Date: 2018-09-04
 * Describe: 广州塔停车场动态js
 */

var car = new Vue({
    el: '#car',
    data: {
        DYData: '',

        showDate: false,
        date: '',
        nowDate: '',
        timer: null,

        rightType: 1,

        dayData: ''
    },
    watch: {
        date: function() {
            if (this.date == this.nowDate) {
                this.timer = setInterval(() => {
                    this.getCTData()
                }, 5000)
            } else {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    },
    methods: {
        // 获取数据函数
        getCTData: function() {
            axios
                .get('./data/getCar.json', {
                    // params: {
                    //     date: this.date
                    // }
                })
                // .get('/getDynamic')
                .then(
                    function(res) {
                        console.log(res)
                        res = res.data
                        if (res.code !== 0) {
                            console.log('状态码不为零')
                            return
                        }
                        if (res.data.length <= 0) {
                            console.log('数据集data为空数组')
                            return
                        }

                        this.DYData = res.data

                        this.scChart(res.data.allCarList);

                    }.bind(this)
                )
                .catch(
                    function(err) {
                        console.log(err)
                    }.bind(this)
                )
        },

        // 点击显示日期框
        showDateFn: function() {
            this.showDate = true
        },
        
        // 切换标签页
        qhTags: function (type) {
            this.rightType = type
        },

        // 生成登塔人数图表
        scChart: function (data) {
            var t = 3600000;
            var now = new Date();
            var items = [], valus1 = [], valus2 = [];
            _.forEach(data, function (v, i) {
                items.push(formatDate(new Date(now - t * i), 'hh时'));
                valus1.push(v.inCar)
                valus2.push(v.outCar)
            });
            // echarts 图表
            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('DayDate-chart'));

            // 指定图表的配置项和数据
            var option = {
                tooltip: {},
                legend: {
                    data:['进场车辆', '离场车辆'],
                    textStyle: {
                        color: '#fff'
                    }
                },
                xAxis: {
                    data: items,
                    axisLabel: {
                        textStyle: {
                            color: '#fff'
                        }
                    }
                },
                yAxis: {
                    axisLabel: {
                        textStyle: {
                            color: '#fff'
                        }
                    }
                },
                series: [
                    {
                        name: '进场车辆',
                        type: 'bar',
                        data: valus1,
                        itemStyle:{
                            normal:{
                                color:'#4dd0da'
                            }
                        }
                    },{
                        name: '离场车辆',
                        type: 'bar',
                        data: valus2,
                        itemStyle:{
                            normal:{
                                color:'#3EDD2F'
                            }
                        }
                    }
                ]
            };

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        },


     
    },
    created: function() {
        this.date = formatDate(new Date(), 'YY-MM-DD')
        this.nowDate = this.date

        this.getCTData()
        this.getDayDate()

        // laydate时间选择器
        var _this = this
        laydate.render({
            elem: '#date-box'
            ,position: 'static'
            ,btns: ['now']
            ,theme: '#4dd0da'
            ,done: function(value, date, endDate){
                _this.showDate = false;
                _this.date = value;

                _this.getCTData();

            }
        });



    },
    mounted: function () {


    }
})
