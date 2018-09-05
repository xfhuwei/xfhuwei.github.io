/**
 * Author: laohu
 * Date: 2018-09-04
 * Describe: 广州塔登塔人员动态js
 */

var dynamic = new Vue({
    el: '#dynamic',
    data: {
        DYData: '',

        showDate: false,
        date: '',
        nowDate: '',
        timer: null,

        rightType: 1,

        dayDateData: ''
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
                .get('./data/getDynamic.json', {
                    params: {
                        date: this.date
                    }
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

                        // 格式化时间
                        _.forEach(res.data.attPopleList, function (v, i) {
                            if (v) {
                                v.dtTime && ( res.data.attPopleList[i].dtTime = formatDate(v.dtTime, 'hh:mm:ss') )
                            }
                        });

                        this.DYData = res.data

                        var a = this.DYData.attPople - (this.DYData.narPople+this.DYData.thePople+this.DYData.menPople);
                        var items = [
                            {value: this.DYData.narPople, name:'涉毒人员 ' + this.DYData.narPople},
                            {value: this.DYData.thePople, name:'涉盗人员 ' + this.DYData.thePople},
                            {value: this.DYData.menPople, name:'精神病人员 ' + this.DYData.menPople},
                            {value: a, name:'其他关注人员 ' + a}
                        ]
                        console.log(items)
                        this.scBChart(items)


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
            if (type == 2) { // 为了图表撑开
                if (this.dayDateData.length > 0) {
                    this.rightType = type
                    setTimeout(() => {
                        this.scChart(this.dayDateData);
                    }, 100)
                } else {
                    alert('图表数据尚未返回。')
                    return;
                }
            } else {
                this.rightType = type
            }
        },

        // 获取30天 每日登塔人数数据
        getDayDate: function() {
            axios
                .get('./data/getDayDate.json')
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

                        this.dayDateData = res.data


                    }.bind(this)
                )
                .catch(
                    function(err) {
                        console.log(err)
                    }.bind(this)
                )
        },

        // 生成登塔人数图表
        scChart: function (data) {

            var t = 86400000;
            var now = new Date();
            var items = [], valus = [];
            _.forEach(data, function (v, i) {
                items.push(formatDate(new Date(now - t * i), 'MM-DD'));
                valus.push(v)
            });

            // echarts 图表
            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('DayDate-chart'));

            // 指定图表的配置项和数据
            var option = {
                title: {
                    text: '每日登塔人数统计',
                    textStyle: {
                        color: '#fff'
                    }
                },
                tooltip: {},
                legend: {
                    data:['登塔人数'],
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
                series: [{
                    name: '登塔人数',
                    type: 'bar',
                    data: valus,
                    itemStyle:{
                        normal:{
                            color:'#4dd0da'
                        }
                    }
                }]
            };

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        },

        // 生成关注人饼状图表
        scBChart: function (items) {
            // echarts 图表
            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('gz-chart'));

            // 指定图表的配置项和数据
            option = {
                series : [
                    {
                        name: '关注人员',
                        type: 'pie',
                        radius: '55%',
                        data: items
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
