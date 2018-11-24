// This is a doodle of a library, but I find it very useful because I use this
// logic everywhere in my code.
exports.shift = function operation (vargs) {
    switch (typeof vargs[0]) {
    case 'function':
        if (object === module) {
            return vargs.shift()
        }
        return vargs.shift().bind(object)
    case 'object':
        if (Array.isArray(vargs[0])) {
            return operation(vargs.shift())
        } else {
            var object = vargs.shift()
            switch (typeof vargs[0]) {
            case 'function':
                return vargs.shift().bind(object)
                break
            case 'string':
                return object[vargs.shift()].bind(object)
                break
            default:
                assert(false, 'expecting function or method name')
            }
        }
        break
    case 'string':
        assert(object === module, 'implicit object required')
        return object[vargs.shift()].bind(object)
        break
    default:
        assert(false, 'unable to determine desired operation')
    }
}

exports.vargs = function () {
    var vargs = []
    vargs.push.apply(vargs, arguments)
    vargs.unshift(exports.shift.call(this, vargs))
    return vargs
}

var f = operation.vargs.apply(operation, arguments).shift()
var f = vargs.shift()
