require('proof')(22, prove)

function prove (okay) {
    var Operation = require('..')
    var object = {
        method: function (one, two, three, four) {
            return one + two + three
        }
    }
    var f = Operation([ object, 'method' ], { arity: 3, properties: { vargs: [ 1, 2, 3 ] } })
    okay(f.vargs, [ 1, 2, 3 ], 'properties')
    okay(f.length, 3, 'specified arity named arity')
    okay(f(1, 2, 3), 6, 'specified arity named')
    var f = Operation([ object, 'method', [ 1, 2, 3 ] ], { vargs: true })
    okay(f.vargs, [ 1, 2, 3 ], 'vargs')
    okay(f.length, 4, 'specified arity named arity')
    okay(f(1, 2, 3), 6, 'specified arity named')
    var f = Operation([ object, 'method' ], { vargs: true })
    okay(f.vargs, [], 'empty vargs')
    f = Operation([ object, object.method ], { arity: 3 })
    okay(f.length, 3, 'specified arity method arity')
    okay(f(1, 2, 3), 6, 'specified arity method')
    f = Operation([ object, 'method' ])
    okay(f.length, 4, 'variadic named arity')
    okay(f(1, 2, 3), 6, 'variadic named')
    f = Operation([ object, object.method ])
    okay(f.length, 4, 'variadic method arity')
    okay(f(1, 2, 3), 6, 'variadic method')
    f = Operation([ object.method ])
    okay(f.length, 4, 'variadic function arity')
    okay(f(1, 2, 3), 6, 'variadic function')
    f = Operation([ 'method' ], { arity: 3, object: object })
    okay(f.length, 3, 'default object arity')
    okay(f(1, 2, 3), 6, 'default object')
    f = Operation([ [ object, 'method' ] ], { arity: 3, object: object })
    okay(f.length, 3, 'array assignment arity')
    okay(f(1, 2, 3), 6, 'array assignment')
    try {
        Operation([ object, 3 ])
    } catch (error) {
        okay(error.message, 'expecting function or method name', 'function or method')
    }
    try {
        Operation([ 'method' ])
    } catch (error) {
        okay(error.message, 'implicit object requires default object', 'default object')
    }
    try {
        Operation([ 3 ])
    } catch (error) {
        okay(error.message, 'unable to determine desired operation', 'way wrong')
    }
}
