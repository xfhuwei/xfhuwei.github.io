/**
 * Author: laohu
 * Date: 2018-08-17
 * Describe: 广州塔警员报备表格js
 */

var policeReported = new Vue({
    el: '#policeReported',
    data: {
        CTData: '',
        nowData: ''
    },
    methods: {
        // 获取登塔数据函数
        getCTData: function() {
//            var params = 'laohu'
            axios
                // .get('../static/data/climbTower.json')
                .get('/getPoliceAffairs')
                .then(
                    function(res) {
                        console.log(res)
                        res = res.data
                        this.nowData = 'empty'                        
                        if (res.code !== 0) {
                            console.log('状态码不为零')
                            return
                        }
                        if (res.data.length <= 0) {
                            console.log('数据集data为空数组')
                            return
                        }

                        // 格式化时间
                        _.forEach(res.data, function (v, i) {
                            if (v) {
                                v.reportDate && ( res.data[i].reportDate = formatDate(v.reportDate) )
                                v.watchBegin && ( res.data[i].watchBegin = formatDate(v.watchBegin) )
                                v.watchEnd && ( res.data[i].watchEnd = formatDate(v.watchEnd) )
                            }
                        });

                        this.CTData = _.chunk(res.data, 14)
                        this.nowData = this.CTData[0]
                    }.bind(this)
                )
                .catch(
                    function(err) {
                        this.nowData = 'empty'                        
                        console.log(err)
                    }.bind(this)
                )
        },

        nowDataFn: function(n) {
            this.nowData = this.CTData[n - 1]
        }
    },
    created: function() {
        this.getCTData()
    }
})
