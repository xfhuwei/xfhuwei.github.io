/**
 * Author: laohu
 * Date: 2018-08-20
 * Describe: 分页组件
 * 调用：
 * 父组件传入总页数，子组件传出当前页，不参与数据展示
 * <pagination :pages="Data.length" @nowpage="nowDataFn"></pagination>
 */

Vue.component('pagination', {
    // 模板
    template: `
    <div class="page" v-show="show">
        <div class="pagelist">
            <span class="jumppoint">共{{pages}}页&nbsp;&nbsp;&nbsp;</span>
        
            <span class="jump" v-show="current_page>1" @click="{current_page = 1}">首页</span>
            <span class="jump" v-show="current_page>1" @click="{current_page--}">上一页</span>

            <span class="jump" v-for="num in indexs" 
                :class="{bgprimary:current_page==num}" 
                @click="jumpPage(num)">{{num}}
            </span>

            <span v-show="current_page<pages" class="jump" @click="{current_page++}">下一页</span>
            <span v-show="current_page<pages" class="jump" @click="{current_page = pages}">末页</span>

            <span class="jumppoint">&nbsp;&nbsp;&nbsp;跳转到：</span>            
            <span class="jumpinp">
                <input type="text" v-model="changePage" @keyup.enter="jumpPage(changePage)">
            </span>
            <span class="jumppoint">页</span>
            <span class="jump gobtn" @click="jumpPage(changePage)">确定</span>
        </div>
    </div>
    `,
    props: ['pages'], //总页数 由外界传入
    data: function() {
        return {
            current_page: 1, //当前页
            // pages: 0,
            changePage: '' //跳转页
        }
    },
    watch: {
        // 监听当前页的变化,传出当前页给父组件以显示当前页数据
        current_page: function(newVal, oldVal) {
            this.$emit('nowpage', this.current_page)
        },

        // 监听跳转页码数据变化，限制输入的值
        changePage: function(newVal,oldVal){
            if (newVal === '') return
            var num =  newVal*1
            if (isNaN(num) || num < 1 || num > this.pages) {
                this.changePage = oldVal //恢复原值
            }
        }
    },
    computed: {
        // 用于判定分页条是否显示
        show: function() {
            return this.pages && this.pages != 1
        },

        // 分页项计算
        indexs: function() {
            var sp = 7, // 分页条最大显示几个页码
                zhong = Math.floor(sp/2) // 中数

            var left = 1, // 起步
                right = this.pages, // 结束步
                ar = []
            if (this.pages >= sp) { // 总页数大于最大显示页码时才进入判断
                if ( // 两边都有盈余的情况
                    this.current_page > zhong &&
                    this.current_page < this.pages - zhong
                ) {
                    left = Number(this.current_page) - zhong
                    right = Number(this.current_page) + zhong
                } else {
                    if (this.current_page <= zhong) { // 左边无盈余
                        left = 1
                        right = sp
                    } else { // 右边无盈余
                        right = this.pages
                        left = this.pages - sp - 1
                    }
                }
            }
            // 导入数组
            while (left <= right) {
                ar.push(left)
                left++
            }
            return ar
        }
    },
    methods: {
        // 跳转
        jumpPage: function(id) {
            if (id <= this.pages && id > 0) {
                this.current_page = id
            }
        }
    }
})
