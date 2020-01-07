import socket from './class/socket'

const createConnection = function(config) {
    return new socket(config)
}

const closeConnection = function(socket) {
    socket.close()
}

const destroyConnection = function(socket) {
    socket.destroy()
}

export default {
    createConnection,
    closeConnection,
    destroyConnection
}