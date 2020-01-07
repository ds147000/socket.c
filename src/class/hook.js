// 钩子类
class app {
    // 收到后端发送的消息
    onMessage(res) { }
    // 当连接已超过最大重连次数或被手动关闭
    onClose() { }
    // 当socket重新连接前触发的钩子,参数 this
    onRes(el) { }
    // 当销毁前触发钩子
    onDestroy() {}

    parse() { }
    ify() { }
}

export default app