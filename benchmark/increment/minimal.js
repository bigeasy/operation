var operation = require('../../operation')
var operation_ = require('../../_operation')
var Benchmark = require('benchmark')

var suite = new Benchmark.Suite('call')

function f () {}

function fn () { operation.shift([ f ]) }

function fn_ () { operation_.shift([ f ]) }

fn()

for (var i = 1; i <= 4; i++)  {
    suite.add({
        name: '_operation call ' + i,
        fn: fn_
    })

    suite.add({
        name: ' operation call ' + i,
        fn: fn
    })
}

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()
