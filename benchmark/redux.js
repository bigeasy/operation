var sketch = require('../sketch')
var Operation = require('..//operation')
var Benchmark = require('benchmark')

var suite = new Benchmark.Suite('call')

function f () { return 1 }

function s () {
    return sketch.vargs.apply(sketch, arguments).shift()()
}

function o () {
    var vargs = []
    vargs.push.apply(vargs, arguments)
    return Operation(vargs)()
}

function raw () {
    var vargs = []
    vargs.push.apply(vargs, arguments)
    return vargs.shift()()
}

var assert = require('assert')

for (var i = 1; i <= 4; i++)  {
    suite.add({
        name: 'sketch    ' + i,
        fn: function () { assert(s(f) == 1)  }
    })

    suite.add({
        name: 'Operation ' + i,
        fn: function () { assert(o(f) == 1)  }
    })

    suite.add({
        name: 'raw       ' + i,
        fn: function () { assert(raw(f) == 1)  }
    })
}

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()
