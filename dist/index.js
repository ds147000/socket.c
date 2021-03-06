'use strict';

const getSendFun = function(type) {
    switch (type) {
        case 'STRING':
            return sendString
        case 'JSON':
            return sendJson
        case 'BUFF':
            return sendBuff
        default:
            return defaultFun
    }
};

const getMessageFun = function(type) {
    switch (type) {
        case 'STRING':
            return messageString
        case 'JSON':
            return messageJson
        default:
            return defaultFun
    }
};

const defaultFun = function(data) {
    return data
};

const sendString = function(data) {
    if (typeof data === 'string') {
        return data
    } else {
        return JSON.stringify(data)
    }
};

const sendJson = function(data) {
    if (typeof data === 'object') {
        return JSON.stringify(data)
    } else {
        console.error('警告：发送数据不为json，已屏蔽。数据为：', data);
    }
};

const sendBuff = function(data) {
    if (typeof data === 'object' && data.byteLength !== undefined) {
        return data
    } else {
        console.error('警告：发送数据不为buff，已屏蔽。数据为：', data);
    }
};

const messageString = function(data) {
    if (typeof data === 'string') {
        return data
    } else {
        return data.toString ? data.toString('utf8') : JSON.parse(data)
    }
};

const messageJson = function(data) {
    try {
        return JSON.parse(data)
    } catch (error) {
        console.error('警告：发送数据不为json，已屏蔽。数据为：', data);
    }
};

const getId = () => {
    return `ws_${new Date().getTime()}_4${Math.round()}`
};

// 钩子类
class app {
    constructor(config) {
        this.ID = getId;
        this.setSendType(config.sendType);
        this.setMessageType(config.messageType);
    }
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
        this.ify = getSendFun(type);
    }
    setMessageType(type) {
        this.parse = getMessageFun(type);
    }
}

const scoketConfig = {
    url: '', // url
    heartBeat: ['PING', 'PENG'], //心跳包字段
    heartMaxNumber: 3, //心跳包最大离线次数
    hearTinterval: 10000, //新跳包发生间隔
    sendType: 'JSON', //发送的数据格式
    messageType: 'JSON', //消息数据格式
    restartMaxNumber: 3, //最大重连数
    restartTinterval: 3000
};

const loop = {};

const subscribe = (id, callBack) => {
    loop[id] ? loop[id].push(callBack) : loop[id] = [ callBack ];
    return loop[id].length -1
};

const unSubscribe = (id, subscribeID) => {
    loop[id].splice(subscribeID, 1);
};

const runSubscribe = (id, msg) => {
    loop[id].forEach(e => {
        e(msg);
    });
};

class app$1 extends app {
    constructor(config = scoketConfig) {
        config = Object.assign(scoketConfig, config);
        super(config);
        this.cap = null;
        this.socket = null;
        this.url = config.url;
        // 当前网络状态，0~3
        this.networkStatus = 0;

        // 心跳包配置
        this.heartBeat = config.heartBeat;
        this.heartNumber = 0;
        this.heartMaxNumber = config.heartMaxNumber;
        this.hearTinterval = config.hearTinterval;

        // 重连配置
        this.resatrtNumber = 0;
        this.restartMaxNumber = config.restartMaxNumber;
        this.restartTinterval = config.restartTinterval;

        this.init();
    }
    
    init() {
        this.client(this.url);
        this.listenOpen();
        this.linstenMessage();
        // this.listenError()
        this.listenClose();
    }
    client(url=this.url) {
        this.socket = new WebSocket(url);
        this.url = url;
    }
    listenOpen() {
        this.socket.onopen = () => {
            console.log('连接成功');
            this.startHeart();
            this.resatrtNumber = 0;
        };
    }
    listenError() {
        this.socket.onerror = () => {
            console.log('网络连接发生错误已断开');
            this.restartClient();
        };
    }
    listenClose() {
        this.socket.onclose = () => {
            console.log('网络连接已断开');
            if (this.resatrtNumber > 0) {
                clearTimeout(this.cap);
                this.cap = setTimeout(this.restartClient.bind(this), this.restartTinterval);
            } else {
                this.restartClient();
            }
        };
    }
    linstenMessage() {
        this.socket.onmessage = (res) => {
            res = res.data;
            // 心跳包
            if (res === this.heartBeat[1]) {
                this.heartNumber = 0;
                return
            } else {
                let result = this.parse(res);
                return result && this.onMessage(result) && runSubscribe(this.id, result)
            }
        };
    }
    startHeart() {
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(() => {
                this.send(this.heartBeat[0]);
                setTimeout(this.startHeart.bind(this), this.hearTinterval);
            });
        } else {
            this.send(this.heartBeat[0]);
            setTimeout(this.startHeart.bind(this), this.hearTinterval);
        }
    }
    send(msg) {
        if (this.socket.readyState !== 0 && this.socket.readyState !== 1) {
            console.error('socket未连接');
            return
        }
        if (msg === this.heartBeat[0]) {
            this.socket.send(msg);
            this.setHeartNumber(1);
        } else {
            this.socket.send(this.ify(msg));
            return true
        }
    }
    // 未发送至服务器的字节数
    getSendBufferedAmount() {
        return this.socket.bufferedAmount
    }
    // 手动关闭连接
    close() {
        this.resatrtNumber = this.restartMaxNumber;
        this.socket.close();
    }
    destroy() {
        this.onDestroy();
        this.close();
        this.socket = null;
        for (let i in this) {
            delete this[i];
        }
    }
    subscribe(callback = function() {}) {
        return subscribe(this.ID, callback)
    }
    unSubscribe(id) {
        unSubscribe(this.id, id);
    }
    // 重新连接
    restartClient() {
        this.networkStatus = 0;
        this.heartNumber = 0;
        this.resatrtNumber += 1;
        
        if (this.restartMaxNumber < this.resatrtNumber) {
            this.onClose();
            console.error('无法进行重新连接，原因：已超过最大重连次数或被手动关闭');
            return
        }
        this.onRes(this);
        this.init();
    }
    setHeartNumber(num) {
        this.heartNumber += num;
        this.networkStatus = 4 - this.heartNumber; 
        if (this.heartNumber > this.heartMaxNumber) {
            this.socket.close();
        }
    }
}

/**
 * 
 * @param { scoketConfig } config 
 */
const createConnection = function(config) {
    if (window.WebSocket) {
        return new app$1(config)
    }
};

const closeConnection = function(socket) {
    socket.close();
};

const destroyConnection = function(socket) {
    socket.destroy();
};

var app$2 = {
    createConnection,
    closeConnection,
    destroyConnection
};

module.exports = app$2;
