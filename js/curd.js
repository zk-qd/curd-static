
function Curd({ data, key, storage, fuzzy }) {
    // 初始化数据
    var localData;
    // 切换模式
    this.storage = storage;
    if (this.storage) {
        // 如果有storage那么开启storage模式
        localData = window.localStorage.getItem(this.storage)
        this.data = localData && JSON.parse(localData) || this.sCopy(data);
    } else {
        this.data = this.sCopy(data);
    }
    // 唯一标识
    this.id = key;
    // 控制模糊查询
    this.fuzzy = fuzzy;
    this.common = {
        code: 200,
        success: true,
    };

}
Curd.prototype = {
    constructor: Curd,
    // 新增数据一般在开头
    create(row) {
        // 修改
        row = this.sCopy(row);

        row[this.id] = new Date().getTime();
        this.data.unshift(row);
        // 创建不可能失败
        this.operationStorage();
        return Object.assign({
            message: '创建成功',
            type: 1,
        })
    },
    // 需要先查再改
    update(row) {
        row = this.sCopy(row);
        return this.updateOrDel(row);
    },
    // 分页条件查询
    read(condition) {
        // 筛选数据
        var datas = this.data.filter(item => {
            for (let key in condition) {
                //排除index以及count后 且不匹配undefined和null以及空字符串 且库中有该字段 如果其中有一个值不等，那么就不要
                if (key != 'index' && key != 'count'
                    && condition[key] != undefined
                    && condition[key] !== ''
                    && item.hasOwnProperty(key)) {
                    var result;
                    switch (this.fuzzy) {
                        case Object.prototype.toString.call(this.fuzzy) === '[object Function]':
                            // 条件 和 库数据
                            result = this.fuzzy(condition[key], item[key]);
                            // 如果匹配成功 返回为true 和下面相反
                            if (result) return false;
                            break;
                        case 'all':
                            // 匹配任意位置
                            result = new RegExp(condition[key]).test(item[key]);
                            if (!result) return false;
                            break;
                        case 'begin':
                            // 匹配开始位置
                            result = new RegExp('^' + condition[key]).test(item[key]);
                            if (!result) return false;
                            break;
                        case 'end':
                            // 匹配结束位置
                            result = new RegExp(condition[key] + '$').test(item[key]);
                            if (!result) return false;
                            break;
                        default:
                            // 不模糊查询
                            result = new RegExp('^' + condition[key] + '$').test(item[key]);
                            if (!result) return false;
                            break;

                    }

                }
            }
            // 说明没有不等的
            return true;
        });
        // 分页
        var size = datas.length;
        var index = condition.index,
            count = condition.count,
            pages = Math.ceil(size / count),
            rows = size,
            start = (index - 1) * count,
            end = start + count;
        //返回数据 
        return Object.assign({
            data: {
                datas: this.sCopy(datas.slice(start, end)),
                pages: pages,
                rows: rows,
                count: count,
                index: index,
            }
        }, this.common);
    },
    // 返回一个数组
    readRow(val) {
        var row = this.query(val).row;
        return Object.assign({
            data: {
                // 存在返回有数据的数组 不存在返回空数组
                datas: [this.sCopy(row)] || [],
            }
        }, this.common)
    },
    // 直接删
    delete(val) {
        return this.updateOrDel(null, val);
    },
    // 根据keyval获取行数据以及索引 内部方法
    query(val) {
        var index, row;
        row = this.data.find((item, i) => {
            if (item[this.id] == val) {
                index = i;
                return true;
            }
        });
        return {
            row: row,
            index: index == undefined ? -1 : index,
        }
    },
    // 内部方法 存取localstorage
    operationStorage() {
        // 每次增删改都存入storage中去
        if (this.storage) {
            window.localStorage.setItem(this.storage, JSON.stringify(this.data))
        }
    },
    // 内部方法  
    updateOrDel(row, val) {
        var message, index, result = [];
        if (row) {
            message = '修改';

            index = this.query(row[this.id]).index;
            // 如果index=-1那么修改失败
            if (index != -1) {
                // row没有传入的字段不做修改
                for (var key in row) {
                    this.data[index][key] = row[key];
                }
                result = [this.data[index]];
            }
        } else if (val) {
            message = '删除';

            index = this.query(val).index;
            // 如果index=-1那么删除失败
            if (index != -1) {
                result = this.data.splice(index, 1);
            }
        }
        if (result.length) {
            this.operationStorage();
            return Object.assign({ message: message + '成功', type: 1 }, this.common);
        }
        else return Object.assign({ message: message + '失败', type: 0 }, this.common);
    },
    sCopy: function (obj) {
        var o;
        if (Object.prototype.toString.call(obj) === '[object Object]') {
            o = {};
            for (var key in obj) {
                o[key] = this.sCopy(obj[key]);
            };
        } else if (Object.prototype.toString.call(obj) === '[object Array]') {
            o = [];
            for (var [i, v] of obj.entries()) {
                o[i] = this.sCopy(obj[i]);
            }
        } else {
            // 保持原型  不然会转成对象
            o = obj.valueOf();
        }
        return o;
    }

}






