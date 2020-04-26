const ws = require('nodejs-websocket')

const app = ws.createServer()

app.on('connection' ,conn => {


    conn.on('text', msg => {
        if (msg === "PING") {
            conn.sendText("PENG")
        } else {
            conn.sendText(msg)
        }
    })
    conn.on('close', () => {
        console.log('关闭')
    })
    conn.on('error', function(code, reason) {
        console.log('异常关闭');
    })

})

const startPush = () => {
    setTimeout(() => {
        app.connections.forEach(e => {
            let msg = {
                title: '通知',
                body: `服务端测试消息来自-${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
                url: '/goodsOrderedManage/storeManagement'
            }
            e.sendText(JSON.stringify(msg))
        })
        startPush()
    }, 60000)
}

startPush()

module.exports = app
