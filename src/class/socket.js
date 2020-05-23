import hook from './hook'
import { scoketConfig } from '../config/index'
import { subscribe, unSubscribe, runSubscribe } from './subscribe'

class app extends hook {
    constructor(config = scoketConfig) {
        config = Object.assign(scoketConfig, config)
        super(config)
        this.cap = null
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
        this.restartTinterval = config.restartTinterval

        this.init()
    }
    
    init() {
        this.client(this.url)
        this.listenOpen()
        this.linstenMessage()
        // this.listenError()
        this.listenClose()
    }
    client(url=this.url) {
        this.socket = new WebSocket(url)
        this.url = url
    }
    listenOpen() {
        this.socket.onopen = () => {
            this.startHeart()
            this.resatrtNumber = 0
            this.onOpen()
        }
    }
    listenError() {
        this.socket.onerror = () => {
            this.restartClient()
        }
    }
    listenClose() {
        this.socket.onclose = () => {
            if (this.resatrtNumber > 0) {
                clearTimeout(this.cap)
                this.cap = setTimeout(this.restartClient.bind(this), this.restartTinterval)
            } else {
                this.restartClient()
            }
        }
    }
    linstenMessage() {
        this.socket.onmessage = (res) => {
            res = res.data
            // 心跳包
            if (res === this.heartBeat[1]) {
                this.heartNumber = 0
                return
            } else {
                let result = this.parse(res)
                return result && this.onMessage(result) && runSubscribe(this.id, result)
            }
        }
    }
    startHeart() {
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(() => {
                this.send(this.heartBeat[0])
                setTimeout(this.startHeart.bind(this), this.hearTinterval)
            })
        } else {
            this.send(this.heartBeat[0])
            setTimeout(this.startHeart.bind(this), this.hearTinterval)
        }
    }
    send(msg) {
        if (this.socket.readyState !== 0 && this.socket.readyState !== 1) {
            console.error('socket未连接')
            return
        }
        if (msg === this.heartBeat[0]) {
            this.socket.send(msg)
            this.setHeartNumber(1)
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
    subscribe(callback = function() {}) {
        return subscribe(this.ID, callback)
    }
    unSubscribe(id) {
        unSubscribe(this.id, id)
    }
    // 重新连接
    restartClient() {
        this.networkStatus = 0
        this.heartNumber = 0
        this.resatrtNumber += 1
        
        if (this.restartMaxNumber < this.resatrtNumber) {
            this.onClose()
            console.error('无法进行重新连接，原因：已超过最大重连次数或被手动关闭')
            return
        }
        this.onRes(this)
        this.init()
    }
    setHeartNumber(num) {
        this.heartNumber += num
        this.networkStatus = 4 - this.heartNumber 
        if (this.heartNumber > this.heartMaxNumber) {
            this.socket.close()
        }
    }
}

export default app