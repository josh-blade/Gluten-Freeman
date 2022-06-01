// making an error catcher for async function instead of writing
// try and catch each function

module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(e => next(e))
    }
}