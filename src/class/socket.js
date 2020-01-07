import hook from './hook'
import { scoketConfig } from '../config/index'
import { getSendFun, getMessageFun } from './parse'

class app extends hook {
    constructor(config = scoketConfig) {
        super(config)
        this.socket = null
        this.url = config.url
        // 当前网络状态，0~3
        this.networkStatus = 0

        // 心跳包配置
        this.heartBeat = config.heartBeat
        this.heartNumber = 0
        this.heartMaxNumber = config.heartMaxNumber
        this.hearTinterval = config.hearTinterval

        // 重连配置
        this.resatrtNumber = 0
        this.restartMaxNumber = config.restartMaxNumber

        this.setSendType(config.sendType)
        this.setMessageType(config.messageType)

        this.init()
    }
    init() {
        this.client(this.url)
        this.linstenMessage()
        this.listenOpen()
        this.listenError()
        this.listenClose()
    }
    client(url=this.url) {
        this.socket = new WebSocket(url)
        this.url = url
    }
    listenOpen() {
        this.startHeart()
        setTimeout(() => {
            if (this.socket.readyState === 0 || this.socket.readyState === 1) {
                this.networkStatus = 3
                this.resatrtNumber = 0
            }
        }, 1000)
    }
    listenError() {
        this.socket.onerror = () => {
            console.log('网络连接发生错误已断开')
            this.restartClient()
        }
    }
    listenClose() {
        this.socket.onclose = () => {
            console.log('网络连接已断开')
            this.restartClient()
        }
    }
    linstenMessage() {
        this.socket.onmessage = (res) => {
            // 心跳包
            if (res === this.heartBeat[1]) {
                this.heartNumber = 0
                return
            } else {
                let result = this.parse(res)
                return result && this.onMessage(result)
            }
        }
    }
    startHeart() {
        if (window.requestIdleCallback) {
            window.requestIdleCallback = () => {
                this.send(this.heartBeat[0])
                setTimeout(() => this.startHeart(), this.hearTinterval)
            }
        } else {
            this.send(this.heartBeat[0])
            setTimeout(() => this.startHeart(), this.hearTinterval)
        }
    }
    send(msg) {
        if (this.socket.readyState !== 0 && this.socket.readyState !== 1) {
            console.error('socket未连接')
            return false
        }
        if (msg === this.heartBeat[0]) {
            this.setHeartNumber(1)
            this.socket.send(msg)
        } else {
            this.socket.send(this.ify(msg))
            return true
        }
    }
    // 未发送至服务器的字节数
    getSendBufferedAmount() {
        return this.socket.bufferedAmount
    }
    // 手动关闭连接
    close() {
        this.resatrtNumber = this.restartMaxNumber
        this.socket.close()
    }
    destroy() {
        this.onDestroy()
        this.close()
        this.socket = null
        for (let i in this) {
            delete this[i]
        }
    }
    // 重新连接
    restartClient() {
        this.networkStatus = 0
        this.heartNumber = 0
        this.resatrtNumber += 1
        if (this.restartMaxNumber < this.resatrtNumber) {
            this.onClose()
            return console.log('无法进行重新连接，原因：已超过最大重连次数或被手动关闭')
        }
        this.onRes(this)
        this.init()
    }
    setSendType(type = config.sendType) {
        this.ify = getSendFun(type)
    }
    setMessageType(type = config.sendType) {
        this.parse = getMessageFun(type)
    }
    setHeartNumber(data) {
        this.heartNumber += data
        this.networkStatus = 4 - this.heartNumber 
        if (this.heartNumber > this.heartMaxNumber) {
            this.socket.close()
        }
    }
}

export default app