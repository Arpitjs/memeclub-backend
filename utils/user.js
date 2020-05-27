class User {
    constructor() {
        this.globalRoom = []
    }
    enterRoom(socketId, name, room) {
        let user = {
            socketId, name, room
        }
        this.globalRoom.push(user)
        return user
    }
    getUser(id) {
        return this.globalRoom.filter(userId => userId.socketId === id)[0]
    }
    removeUser(id) {
        let user = this.getUser(id)
        if(user) {
        this.globalRoom = this.globalRoom.filter(user => user.socketId !== id)
    }
    return user
}
    getOnlineUsersNames(room) {
        let roomName = this.globalRoom.filter(user => user.room === room)
        return roomName.map(user => user.name)
    }
}

module.exports = { User }