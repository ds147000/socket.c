const scoketConfig = {
    url: '', // url
    heartBeat: ['PING', 'PENG'], //心跳包字段
    heartMaxNumber: 3, //心跳包最大离线次数
    hearTinterval: 10000, //新跳包发生间隔
    sendType: 'JSON', //发送的数据格式
    messageType: 'JSON', //消息数据格式
    restartMaxNumber: 3, //最大重连数
    restartTinterval: 3000
}

export {
    scoketConfig
}