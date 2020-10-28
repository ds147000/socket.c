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
}

const getMessageFun = function(type) {
    switch (type) {
        case 'STRING':
            return messageString
        case 'JSON':
            return messageJson
        default:
            return defaultFun
    }
}

const defaultFun = function(data) {
    return data
}

const sendString = function(data) {
    if (typeof data === 'string') {
        return data
    } else {
        return JSON.stringify(data)
    }
}

const sendJson = function(data) {
    if (typeof data === 'object') {
        return JSON.stringify(data)
    } else {
        console.warn('警告：发送数据不为json，已屏蔽。数据为：', data)
    }
}

const sendBuff = function(data) {
    if (typeof data === 'object' && data.byteLength !== undefined) {
        return data
    } else {
        console.warn('警告：发送数据不为buff，已屏蔽。数据为：', data)
    }
}

const messageString = function(data) {
    if (typeof data === 'string') {
        return data
    } else {
        return data.toString ? data.toString('utf8') : JSON.parse(data)
    }
}

const messageJson = function(data) {
    try {
        return JSON.parse(data)
    } catch (error) {
        console.warn('警告：结束数据不为json，已屏蔽。数据为：', data)
    }
}

export {
    getSendFun,
    getMessageFun
}