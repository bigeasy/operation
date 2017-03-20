var assert = require('assert')
var redux = require('./redux')

function variadic (vargs, options) {
    options || (options = {})
    var operation = null
    switch (typeof vargs[0]) {
    case 'object':
        if (Array.isArray(vargs[0])) {
            return variadic(vargs.shift(), options)
        } else {
            switch (typeof vargs[1]) {
            case 'function':
            case 'string':
                operation = { object: vargs.shift(), method: vargs.shift() }
                break
            default:
                assert(false, 'expecting function or method name')
            }
        }
        break
    case 'function':
        operation = { object: null, method: vargs.shift() }
        break
    case 'string':
        if (options.object == null) {
            assert(false, 'implicit object requires default object')
        }
        operation = { object: options.object, method: vargs.shift() }
        break
    default:
        assert(false, 'unable to determine desired operation')
    }
    return redux(operation, options)
}

module.exports = variadic
