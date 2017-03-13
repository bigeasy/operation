require('proof')(16, prove)

function prove (assert) {
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
    assert(f.length, 3, 'set arity named')
    assert(f.vargs, [ 1, 2, 3 ], 'properties')
    assert(f(1, 2, 3), 6, 'fixed arity named')
    f = operation({
        object: object, method: object.method
    }, {
        arity: 3
    })
    assert(f.length, 3, 'set arity method')
    assert(f(1, 2, 3), 6, 'fixed arity method')
    f = operation({ object: object, method: 'method' })
    assert(f.length, 4, 'variadic arity named')
    assert(f(1, 2, 3), 6, 'variadic named')
    f = operation({ object: object, method: object.method })
    assert(f.length, 4, 'variadic arity method')
    assert(f(1, 2, 3), 6, 'variadic method')
    f = operation(object.method)
    assert(f.length, 4, 'variadic arity function')
    assert(f(1, 2, 3), 6, 'variadic function')
    f = operation('method', { arity: 3, object: object })
    assert(f.length, 3, 'fixed arity default object')
    assert(f(1, 2, 3), 6, 'default object')
    f = operation({ object: object, method: 'missing' })
    assert(f.length, 0, 'arity missing method')
    object.missing = object.method
    assert(f(1, 2, 3), 6, 'missing method assigned')
    try {
        operation({ method: object.method }, 4)
    } catch (error) {
        assert(error.message, 'arity set through options array', 'arity as argument')
    }
}
