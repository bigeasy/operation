var assert = require('assert')

var Benchmark = require('benchmark')
var suite = new Benchmark.Suite

var f = function () {
    return this.value
}

object = {
    value: 1,
    f: function (value) { return this.value + value }
}

var bound = object.f.bind(object)
var closure = function (value) { return object.f.apply(object, arguments) }

suite.add({
    name: 'bind',
    fn: function () {
        assert(bound(1) == 2)
    }
})

suite.add({
    name: 'closure',
    fn: function () {
        assert(closure(1) == 2)
    }
})

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()
