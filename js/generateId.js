
/**
 * @param {Array} 传入没有id字段的数据
 * @return {Array} 返回添加id字段的数据
 *  */ 
function generateId(data) {
    if (data.length && !('id' in data[0])) {
        return data.map((item, index) => {
            item.id = index;
            return item;
        })
    } else {
        // data长度为0 或者已有id
        return data;
    }
}