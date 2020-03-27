
function generateId(data, identifier) {
    identifier = identifier || 'id';
    if (data.length && !(identifier in data[0])) {
        return data.map((item, index) => {
            item[identifier] = index;
            return item;
        })
    } else {
        // data长度为0 或者已有id
        return data;
    }
}