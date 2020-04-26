const server = require('./http/main')
const socket = require('./socket/main')

socket.listen(9999, '192.168.1.141', () => {
    console.log('启动成功')
})
server.listen(8081)