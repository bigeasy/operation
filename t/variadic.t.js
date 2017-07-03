require('proof')(22, prove)

function prove (assert) {
    var Operation = require('../variadic')
    var object = {
        method: function (one, two, three, four) {
            return one + two + three
        }
    }
    var f = Operation([ object, 'method' ], { arity: 3, properties: { vargs: [ 1, 2, 3 ] } })
    assert(f.vargs, [ 1, 2, 3 ], 'properties')
    assert(f.length, 3, 'specified arity named arity')
    assert(f(1, 2, 3), 6, 'specified arity named')
    var f = Operation([ object, 'method', [ 1, 2, 3 ] ], { vargs: true })
    assert(f.vargs, [ 1, 2, 3 ], 'vargs')
    assert(f.length, 4, 'specified arity named arity')
    assert(f(1, 2, 3), 6, 'specified arity named')
    var f = Operation([ object, 'method' ], { vargs: true })
    assert(f.vargs, [], 'empty vargs')
    f = Operation([ object, object.method ], { arity: 3 })
    assert(f.length, 3, 'specified arity method arity')
    assert(f(1, 2, 3), 6, 'specified arity method')
    f = Operation([ object, 'method' ])
    assert(f.length, 4, 'variadic named arity')
    assert(f(1, 2, 3), 6, 'variadic named')
    f = Operation([ object, object.method ])
    assert(f.length, 4, 'variadic method arity')
    assert(f(1, 2, 3), 6, 'variadic method')
    f = Operation([ object.method ])
    assert(f.length, 4, 'variadic function arity')
    assert(f(1, 2, 3), 6, 'variadic function')
    f = Operation([ 'method' ], { arity: 3, object: object })
    assert(f.length, 3, 'default object arity')
    assert(f(1, 2, 3), 6, 'default object')
    f = Operation([ [ object, 'method' ] ], { arity: 3, object: object })
    assert(f.length, 3, 'array assignment arity')
    assert(f(1, 2, 3), 6, 'array assignment')
    try {
        Operation([ object, 3 ])
    } catch (error) {
        assert(error.message, 'expecting function or method name', 'function or method')
    }
    try {
        Operation([ 'method' ])
    } catch (error) {
        assert(error.message, 'implicit object requires default object', 'default object')
    }
    try {
        Operation([ 3 ])
    } catch (error) {
        assert(error.message, 'unable to determine desired operation', 'way wrong')
    }
}
