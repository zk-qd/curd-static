# 插件

### generateId

功能： 将数据添加 id 字段，初始化值为数组索引

### curd

功能： 增删改查

- 普通模式
  由于不能改变本地数据，所以刷新页面会导致数据还原

- storage 模式
  将数据传入 storage 中，同一台电脑可保证，数据不会还原

# 使用时注意事项

1. 删除数据后 需要再次分页请求数据 刷新页面数据

2. 修改数据后 需要再次分页请求数据 刷新页面数据

3. 新增数据后 需要再次分页请求数据 刷新页面数据

# 用法

```js
var curd = new Curd({
  //   传入数据  generateId方法为data添加id字段
  data: generateId(data),
  //   唯一标识字段
  key: "id",
  //   localStorage的key
  storage: "localDemo"
});

// 传入'不带'唯一标识的行数据 如唯一标识为id 那么不带id的新行数据
// 返回成功消息  需要判断是否成功
var result = curd.create(row);

// 传入唯一标识的值  查详情
// 返回行数据
var result = curd.readRow("id-val");

// 分页条件查询
// 返回多行数据
var result = curd.read({
  // 传入分页条件
  index: 1,
  count: 10,
  gender: "女",
  name: "赵紫薇"
});

// 传入需要修改的数据  该数据需要带原有id  建议先用 readRow查  然后再改
// 返回成功消息  需要判断是否成功
var result = curd.update(row);

// 传入唯一标识  删除数据
// 返回成功消息   需要判断是否成功
var result = curd.delete;
```

# 待修复问题
1. 不能时间段查询

# 已修复问题

1. 条件查询 为空的参数不会筛选

2. 条件查询 库中没有该字段不会筛选

3. condition[key]!='' 改成 condition[key]!=='' 排除 0 和 false

4. 第二页查询数据 出错
   start = (index - 1) \* count,
   end = start + count;

5. 新增模糊查询字段 fuzzy

- 默认不模糊查询
- 传入方法 自定义匹配 返回 true 则表示匹配成功 
-传入 all 匹配任意部分
- 传入 begin 只匹配开始部分
- 传入 end 只匹配结束部分


6. 修复 修改功能没有传入的字段不做修改

7. 修复 不能拷贝数组问题

8. 添加多个拷贝功能
