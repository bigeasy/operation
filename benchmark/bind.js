var assert = require('assert')

var Benchmark = require('benchmark')
var suite = new Benchmark.Suite

var f = function () {
    return this.value
}

object = { value: 1 }

var bound = f.bind(object)
var closure = function () { return object.value }

suite.add({
    name: 'bind',
    fn: function () {
        assert(bound() == 1)
    }
})

suite.add({
    name: 'closure',
    fn: function () {
        assert(closure() == 1)
    }
})

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()
