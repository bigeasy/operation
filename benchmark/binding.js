var assert = require('assert')

var Benchmark = require('benchmark')
var suite = new Benchmark.Suite

var f = function () {
    return this.value
}

object = {
    value: 1,
    f: function () { return this.value }
}

function bound (object, f) {
    return object[f].bind(object)()
}

function closure (object, f) {
    return (function () { return object[f]() })()
}


suite.add({
    name: 'bind',
    fn: function () {
        assert(bound(object, 'f') == 1)
    }
})

suite.add({
    name: 'closure',
    fn: function () {
        assert(closure(object, 'f') == 1)
    }
})

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()
