require('proof')(7, prove)

function prove (assert) {
    var operation = require('../redux')
    var object = {
        method: function (one, two, three) {
            return one + two + three
        }
    }
    var f = operation({ object: object, method: 'method' }, 3, { properties: { vargs: [ 1, 2, 3 ] } })
    assert(f.vargs, [ 1, 2, 3 ], 'properties')
    assert(f(1, 2, 3), 6, 'fixed arity named')
    f = operation({ object: object, method: object.method }, 3)
    assert(f(1, 2, 3), 6, 'fixed arity method')
    f = operation({ object: object, method: 'method' })
    assert(f(1, 2, 3), 6, 'variadic named')
    f = operation({ object: object, method: object.method })
    assert(f(1, 2, 3), 6, 'variadic method')
    f = operation(object.method)
    assert(f(1, 2, 3), 6, 'variadic function')
    f = operation('method', 3, { object: object })
    assert(f(1, 2, 3), 6, 'default object')
}
