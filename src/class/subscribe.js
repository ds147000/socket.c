const loop = {}

export const subscribe = (id, callBack) => {
    loop[id] ? loop[id].push(callBack) : loop[id] = [ callBack ]
    return loop[id].length -1
}

export const unSubscribe = (id, subscribeID) => {
    loop[id].splice(subscribeID, 1)
}

export const runSubscribe = (id, msg) => {
    loop[id].forEach(e => {
        e(msg)
    })
}