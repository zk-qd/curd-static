
/** 
 * CURD 
 * @param {Object} 数据data唯一字段id本地storageid
 * @returns {Curd} 
 * create： 创建一行数据 随机生成key
 * update：传入row替换数据
 * read：分页条件查询
 * readRow: 通过keyval返回一个数组
 * delete：根据keyval删除数据
 * 
 * query： 根据keyval获取行数据以及索引 内部方法
 * operationStorage: 将修改的数据存入到本地storage
 * updateOrDel： 内部方法 update和delete逻辑抽取
 * sCopy: 内部方法 拷贝对象而非数组
 * 注意事项: 该插件增删改只操作内存的数据 对于本地数据数据还是不会变化的
 * 不过还可以将数据存入localstorage中，从中读取，
 * */


function Curd({ data, key, storage }) {
    // 初始化数据
    var localData;
    this.storage = storage;
    if (this.storage) {
        // 如果有storage那么开启storage模式
        localData = window.localStorage.getItem(this.storage)
        this.data = localData && JSON.parse(localData) || data;
    } else {
        this.data = data;
    }
    this.id = key;
    this.common = {
        code: 200,
        success: true,
    };
}
Curd.prototype = {
    constructor: Curd,
    // 新增数据一般在开头
    create(row) {
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
        return this.updateOrDel(row);
    },
    // 分页条件查询
    read(condition) {
        // 筛选数据
        var datas = this.data.filter(item => {
            for (let key in condition) {
                //排除index以及count后 如果其中有一个值不等，那么就不要
                if (key != 'index' && key != 'count' && item[key] != condition[key]) return false;
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
            cdatas = [];
        //返回数据 
        datas.slice((index - 1) * count, count).forEach(item => {
            cdatas.push(this.sCopy(item));
        })
        return Object.assign({
            data: {
                datas: cdatas,
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
                datas: row ? [this.sCopy(row)] : [],
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
                result = this.data.splice(index, 1, row);
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
    // 拷贝
    sCopy(obj) {
        var o = {};
        if (obj instanceof Object) {
            for (var key in obj) {
                o[key] = this.sCopy(obj[key]);
            };
        } else {
            o = obj;
        }
        return o;
    },
}






