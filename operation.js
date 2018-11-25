var assert = require('assert')

// This is a doodle of a library, but I find it very useful because I use this
// logic everywhere in my code.
exports.shift = function operation (vargs) {
    switch (typeof vargs[0]) {
    case 'function':
        if (this === exports) {
            return vargs.shift()
        }
        return vargs.shift().bind(this)
    case 'object':
        if (Array.isArray(vargs[0])) {
            return operation(vargs.shift())
        } else {
            var object = vargs.shift()
            switch (typeof vargs[0]) {
            case 'function':
                return vargs.shift().bind(object)
            case 'string':
                return object[vargs.shift()].bind(object)
            default:
                assert(false, 'expecting function or method name')
            }
        }
    case 'string':
        assert(this !== exports, 'implicit object required')
        return this[vargs.shift()].bind(this)
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
