! function () {
    var Operation = require('../operation')
    var Redux = require('../redux')
    var assert = require('assert')

    var object = {
        method: function (one, two, three) { return one + two + three }
    }
    var f
    switch (process.argv[2]) {
    case 'operation':
        var operation = new Operation({ object: object, method: 'method' })
        for (var i = 0; i < 100000000; i++) {
            assert(operation.apply([ 1, 2, 3 ]) == 6)
        }
        return
    case 'variadic':
        f = Redux({ object: object, method: 'method' })
        break
    case 'arity':
        f = Redux({ object: object, method: 'method' }, 3)
        break
    case 'direct':
    default:
        for (var i = 0; i < 100000000; i++) {
            assert(object.method(1, 2, 3) == 6)
        }
        return
    }

    for (var i = 0; i < 100000000; i++) {
        assert(f(1, 2, 3) == 6)
    }
} ()
