const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const models = require('../db/models');

// 处理express.json的
app.use(express.json());
// 对URL的参数进行encode
app.use(express.urlencoded());
// 对body参数进行encode
app.use(bodyParser.urlencoded({ extended: true }));

// 1.所有的错误，http status == 500


//创建一个TODO
app.post('/create', async (req, res, next) => {
    try {
        let { name, deadline, content } = req.body;
        // 数据持久化到数据库
        let todo = models.Todo.create({//返回的是一个promiss对象，用await来接收
            name,
            deadline,
            content,

        });
        res.json({
            todo,
            message: '创建成功'
        });
    } catch (error) {
        next(error);
    }
});

// 修改
app.post('/update', async (req, res, next) => {
    try {
        let { id, name, deadline, content } = req.body;
        let todo = await models.Todo.findOne({
            where: {
                id
            }
        });
        if (todo) {
            todo = await todo.update({
                name,
                deadline,
                content
            });
        }
        res.json({
            todo

        });
    } catch (error) {
        next(error);
    }
});

// 修改状态，删除
app.post('/update_status', async (req, res, next) => {
    let { id, status } = req.body;
    let todo = await models.Todo.findOne({
        where: {
            id
        }
    });
    if (todo && status != todo.status) {
        // 执行更新
        todo = await todo.update({
            status
        });
    }
    res.json({
        todo,
        name,
        deadline,
        content
    });
});


// 查询任务列表
app.get('/list/:status/:page', async (req, res, next) => {
    // next(new Error('自定义错误')
    let { status, page } = req.params;
    let limit = 10;
    let offset = (page - 1) * limit;
    let where = {};
    if(status != -1){
        where.status = status;
    }
    // 1.状态：1：表示代办，2：完成，3：删除,-1:全部
    // 2.分页的处理
    let list = await models.Todo.findAndCountAll({
        where,
        offset,
        limit
    });
    res.json({
        list
    });
});
// 错误处理
app.use((err, req, res, next) => {
    if (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

app.listen(3000, () => {
    console.log('服务器启动成功');
});