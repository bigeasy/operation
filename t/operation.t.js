require('proof')(10, prove)

function prove (okay) {
    var operation = require('..')

    var f = operation.shift([ function () { return this.value } ])
    okay(f.call({ value: 1 }), 1, 'function')

    var object = { value: 2 }
    function vargs () {
        return operation.vargs.apply(object, arguments)
    }
    var f = operation.shift([ function () { return this.value } ])
    var varged = vargs(function () { return this.value }, 1, 2)
    okay(varged.shift().call({ value: 1 }), 2, 'bound function')
    okay(varged, [ 1, 2 ], 'vargs')

    var f = operation.shift([[ function () { return 'array' } ]])
    okay(f(), 'array', 'object is array')
    var f = operation.shift([ { value: 'bound function' }, function () { return this.value } ])
    okay(f(), 'bound function', 'bound function')
    var f = operation.shift([ { value: 'bound method', method: function () { return this.value } }, 'method' ])
    okay(f(), 'bound method', 'bound method')
    try {
        operation.shift([ {} ])
    } catch (e) {
        okay(/expecting function/.test(e.message), 'expecting function')
    }
    var f = operation.shift.call({ value: 'implicit method', method: function () { return this.value } }, [ 'method' ])
    okay(f(), 'implicit method', 'bound method')
    try {
        operation.shift([ 'string' ])
    } catch (e) {
        okay(/implicit object required/.test(e.message), 'implicit object required')
    }
    try {
        operation.shift([ 1 ])
    } catch (e) {
        okay(/unable.*desired/.test(e.message), 'unknown type')
    }

    return
var f = operation.vargs.apply(operation, arguments).shift()
var f = vargs.shift()
}
