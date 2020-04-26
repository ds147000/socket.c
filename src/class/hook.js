import { getSendFun, getMessageFun } from './parse'
import { getId } from '../utils/index'

// 钩子类
class app {
    constructor(config) {
        this.ID = getId()
        this.setSendType(config.sendType)
        this.setMessageType(config.messageType)
    }
    // 连接成功回调
    onOpen() {}
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

    setSendType(type) {
        this.ify = getSendFun(type)
    }
    setMessageType(type) {
        this.parse = getMessageFun(type)
    }
}

export default app