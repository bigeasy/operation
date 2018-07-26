require('proof')(16, prove)

function prove (okay) {
    var operation = require('../redux')
    var object = {
        method: function (one, two, three, four) {
            return one + two + three
        }
    }
    var f = operation({
        object: object, method: 'method'
    }, {
        arity: 3, properties: { vargs: [ 1, 2, 3 ] }
    })
    okay(f.length, 3, 'set arity named')
    okay(f.vargs, [ 1, 2, 3 ], 'properties')
    okay(f(1, 2, 3), 6, 'fixed arity named')
    f = operation({
        object: object, method: object.method
    }, {
        arity: 3
    })
    okay(f.length, 3, 'set arity method')
    okay(f(1, 2, 3), 6, 'fixed arity method')
    f = operation({ object: object, method: 'method' })
    okay(f.length, 4, 'variadic arity named')
    okay(f(1, 2, 3), 6, 'variadic named')
    f = operation({ object: object, method: object.method })
    okay(f.length, 4, 'variadic arity method')
    okay(f(1, 2, 3), 6, 'variadic method')
    f = operation(object.method)
    okay(f.length, 4, 'variadic arity function')
    okay(f(1, 2, 3), 6, 'variadic function')
    f = operation('method', { arity: 3, object: object })
    okay(f.length, 3, 'fixed arity default object')
    okay(f(1, 2, 3), 6, 'default object')
    f = operation({ object: object, method: 'missing' })
    okay(f.length, 0, 'arity missing method')
    object.missing = object.method
    okay(f(1, 2, 3), 6, 'missing method assigned')
    try {
        operation({ method: object.method }, 4)
    } catch (error) {
        okay(error.message, 'arity set through options array', 'arity as argument')
    }
}
