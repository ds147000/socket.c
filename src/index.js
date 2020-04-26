import socket from './class/socket'
import { scoketConfig } from './config/index'

/**
 * 
 * @param { scoketConfig } config 
 */
const createConnection = function(config) {
    if (window.WebSocket) {
        return new socket(config)
    } else {
        
    }
}

const closeConnection = function(socket) {
    socket.close()
}

const destroyConnection = function(socket) {
    socket.destroy()
}

const app = {
    createConnection,
    closeConnection,
    destroyConnection
}

export default app

export {
    createConnection,
    closeConnection,
    destroyConnection
}