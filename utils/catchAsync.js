module.exports = function(thatFunction) {
    return (req, res, next) => {
        thatFunction(req, res, next).catch(err => next(err))
    }
}