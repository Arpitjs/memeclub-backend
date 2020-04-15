module.exports = function(io) {
    io.on('connection', socket => {
        socket.on('refresh', () => {
            io.emit('refreshPage', {})
        })
    })
}