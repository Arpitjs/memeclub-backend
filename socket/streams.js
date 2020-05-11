module.exports = function(io, User) {
    let user = new User()
    io.on('connection', socket => {
        socket.on('refresh', () => {
            io.emit('refreshPage', {})
        })
        socket.on('online', data => {
            socket.join(data.room)
            user.enterRoom(socket.id, data.user, data.room)
            var list = []
            user.getOnlineUsersNames(data.room).forEach(el => {
                if(!list.includes(el)) list.push(el)
            })
            io.emit('usersOnline', list)
        })
        socket.on('disconnect', () => {
            let userToDel = user.removeUser(socket.id)
            if(userToDel) {
                var userArray = []
                user.getOnlineUsersNames(userToDel.room).forEach(el =>{
                    if(!userArray.includes(el)) userArray.push(el)
                })
                userArray.splice(userToDel, 1)
            }
            io.emit('usersOnline', userArray)
        })
    })
}