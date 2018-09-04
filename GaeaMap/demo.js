/**
 * gaea地图操作逻辑
 * 
 */

$(function () {
    gaea.init();

})

// 地图自身业务
var gaea = {
    map: '', // 地图
    vectorLayer: '',  // 图层
    cameraArr: [], // 上了地图标准的摄像机集合

    //
    init: function() {
        // 地图初始化
        GL.init(gaea.initMap, './conf.json');

        // var timer = setInterval(() => {
        //     var n = Math.floor(Math.random() * (gaea.cameraArr.length-1))
        //     gaea.focusCamera(gaea.cameraArr[n].info.id);
        // }, 5000);

    },
    // 地图初始化函数
    initMap: function() {
        gaea.map = new GL.Map('map',{
            center: [113.4552600033, 23.1741652396],
            zoom: 6
        });
        // 加载地图
        var baseLayer = GL.LayerLookup.lookup('tdt');
        gaea.map.addBaseLayer(baseLayer);

        // 加减缩放控件放左下角
        gaea.map._delegate.zoomControl.setPosition('bottomright')
        
        /*
        var url = 'http://172.16.23.52/8090/arcgis/rest/services/PGIS_SL/MapServer';
        var opts = { zoomOffset: 11 };
        var crs = {
            origin: '113, 23',
            resolutions: [
                0.0009765625,
                0.00048828125,
                0.000244140625,
                0.0001220703125,
                0.00006103515625,
                0.000030517578125,
                0.0000152587890625,
                0.00000762939453125,
                0.000003814697265625,
                0.0000019073486328125
            ]
        };
        var baseLayer = GL.LayerLookup.createEsriTiledLayer(url, opts, crs);
        map.addBaseLayer(baseLayer);
        */

        gaea.getCamera();

        // 创建矢量图层
        gaea.vectorLayer = new GL.VectorLayer();
        gaea.map.addLayer(gaea.vectorLayer);
        gaea.vectorLayer.cluster();   // 坐标聚合

        // 单击地图事件
        gaea.map.on('click', function (e) {
            gaea.vectorLayer.clearHighlight();
        });

     
    },

    // 获取设备数据
    getCamera: function() {
        $.ajax({
            type: 'GET',
            url: './data/camera.json',
            success: function(res) {
                console.log(res)
                gaea.placeWards(res)                
            }
        })
    },

    // 插眼
    placeWards: function(data) {
        $.each(data, function(i, v) {
            if (
                v.gpsX != '' && 
                v.gpsY != '' && 
                v.gpsX != null && 
                v.gpsY != null
            ) {
                var iconUrl = './img/facade_point'; // 默认枪头摄像机
                v.facade == '1' && ( iconUrl = './img/circle_point' ); // 圆头
                v.isHighPoint == '1' && ( iconUrl = './img/hight_point' ); // 高点
                v.status == 'ONLINE'? iconUrl += '.png': iconUrl += '_off.png';

                var icon = new GL.Icon.Smart(iconUrl, [32,32]);                        
                var zb = v.gpsX + ',' + v.gpsY;
                var point = new GL.Point(zb, icon);
                gaea.vectorLayer.addOverlay(point); // 添加至图层中

                var obj = {
                    point: point,
                    info: v
                }
                gaea.cameraArr.push(obj)

                gaea.bindCameraClick(point, obj); // 绑定点击事件

                point.bindTooltip(v.name);
            }
        })

        search.init(gaea.cameraArr);                
             
    },

    // 摄像头需绑定的点击事件 --- 点击触发客户端函数
    bindCameraClick: function(dom, data) {
        dom.on('click', function() {
            if (data.info.status == 'ONLINE') {
                alert('客户端打开摄像头：' + data.info.name + '， id = ' + data.info.id);
            } else {
                gaea.alertMsg('此设备不在线~');
            }
        })
    },

    // 自定义消息弹框
    alertTimer: null,
    alertMsg: function(msg, time) {
        time || ( time = 3000 );        
        gaea.alertTimer = null;
        clearTimeout(gaea.alertTimer);
        var dom = $('#msg-box');
        dom.html(msg).stop().show();
        gaea.alertTimer = setTimeout(() => {
            dom.fadeOut();
        }, time);
    },

    // 客户端挑选某个摄像头 --- 地图则聚焦居中显示此摄像头
    focusCamera: function(id) {
        gaea.vectorLayer.clearHighlight();

        var a = gaea.cameraArr;
        var pd = true
        for (var i = 0; i < a.length; i++) {
            if (a[i].info.id == id || a[i].info.name == id) {
                gaea.map.setView([a[i].info.gpsX, a[i].info.gpsY] ,16);
                a[i].point.highlight(); // 高亮
                pd = false
                break;
            }
        }
        if (pd) { // 放这里判断似有不妥
            gaea.alertMsg('没有找到设备~');
        }
        
    }

}

// 搜索框业务
var search = {
    data: [], // 搜索集

    init: function(initData) {
        $.each(initData, function(i, v) {
            
            var obj = {
                label : v.info.name,
				id : v.info.id
            }
            search.data.push(obj)
        })
        $("#search-input").autocompleter({
            source : search.data,
            limit : 2000,
            focusOpen : true,
            highlightMatches : true, // 高亮匹配的值
            // customValue : "label", // 显示在input上的value
            cache : false,
            callback : function(label, index, selected) {
                
                gaea.focusCamera(selected.id);

                $('#search-clear-span').css('display', 'flex');

            },
            template : "<span data-val='{{ id }}'>{{ label }}</span>",

        });


        $('#search-button').click(function() {
            var val = $('#search-input').val()
            if (val) {
                gaea.focusCamera(val.trim());
            }
        });

        $('#search-input')
            .keyup(function(e) {
                if (e.keyCode == 13) {
                    var val = $(this).val()
                    if (val) {
                        gaea.focusCamera(val.trim());
                    }
                }
            })
            .bind("input propertychange",function(){
                if ( $(this).val() ) {
                    $('#search-clear-span').css('display', 'flex');
                } else {
                    $('#search-clear-span').css('display', 'none');
                }
            });
        
        $('#search-clear').click(function() {
            $('#search-clear-span').css('display', 'none');            
            $('#search-input').val('')
        });

        
    },


}
