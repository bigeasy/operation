var hotspot = require('..')
var cadence = require('cadence')
var Benchmark = require('benchmark')
var Operation = require('..')
var Redux = require('../redux')

var suite = new Benchmark.Suite('async', { /*minSamples: 100*/ })

var object = {
    method: function (one, two, three) { return one + two + three }
}

var wrapper = function (one, two, three) {
    object.method(one, two, three)
}

var bound = object.method.bind(object)

var operation = new Operation({ object: object, method: 'method' })

var method = 'method'

var test = {
    reduxVariadic: Redux({ object: object, method: 'method' }),
    reduxArity: Redux({ object: object, method: 'method' }, 3),
    direct: function (one, two, three) {
        return object.method(one, two, three)
    },
    literal: function (one, two, three) {
        return object['method'](one, two, three)
    },
    variable: function (one, two, three) {
        return object[method](one, two, three)
    },
    call: function (one, two, three) {
        return object.method.call(object, one, two, three)
    },
    apply: function (one, two, three) {
        return object.method.apply(object, [ one, two, three ])
    },
    dispatch: function () {
        switch (arguments.length) {
        case 0:
            return object.method()
        case 1:
            return object.method(arguments[0])
        case 2:
            return object.method(arguments[0], arguments[1])
        case 3:
            return object.method(arguments[0], arguments[1], arguments[2])
        case 4:
            return object.method(arguments[0], arguments[1], arguments[2], arguments[3])
        case 5:
            return object.method(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4])
        default:
            return object.method.apply(object, arguments)
        }
    },
    forward: function () {
        return object['method'].apply(object, arguments)
    },
    copy: function () {
        var vargs = new Array()
        for (var i = 0, I = arguments.length; i < I; i++) {
            vargs[i] = arguments[i]
        }
        return object.method.apply(object, vargs)
    },
    wrapper: function (one, two, three) {
        return wrapper()
    },
    bound: function (one, two, three) {
        return bound(one, two, three)
    },
    operation: function (one, two, three) {
        return operation.apply([ one, two, three ])
    }
}

console.log(test.reduxArity.toString())
console.log(test.reduxVariadic.toString())
console.log(test.forward.toString())
console.log(test.literal.toString())

Object.keys(test).forEach(function (key) {
    var f = test[key]
    test[key] = function () { f(1, 2, 3) }
})

for (var i = 0; i < 4; i++)  {
    suite.add({
        name: 'forward call ' + i,
        fn: test.forward
    })

    suite.add({
        name: 'redux variadic ' + i,
        fn: test.reduxVariadic
    })

    suite.add({
        name: 'redux arity ' + i,
        fn: test.reduxArity
    })

    suite.add({
        name: 'direct call ' + i,
        fn: test.direct
    })

    suite.add({
        name: 'literal call ' + i,
        fn: test.literal
    })

    continue

    suite.add({
        name: 'variable call ' + i,
        fn: test.variable
    })

    suite.add({
        name: 'call call ' + i,
        fn: test.call
    })

    suite.add({
        name: 'apply call ' + i,
        fn: test.apply
    })

    suite.add({
        name: 'dispatch call ' + i,
        fn: test.dispatch
    })

    suite.add({
        name: 'copy call ' + i,
        fn: test.copy
    })

    suite.add({
        name: 'bound call ' + i,
        fn: test.bound
    })

    suite.add({
        name: 'operation ' + i,
        fn: test.operation
    })
}

function noop () {}

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()
