require('proof')(7, prove)

function prove (assert) {
    var Operation = require('..'), operation
    operation = new Operation(function f (one) {
        assert(one, 1, 'as function')
    })
    operation.apply([ 1 ])

    var object = {
        direct: function (one) {
            assert(this === object, 'direct object method this')
            assert(one, 1, 'direct object method parameters')
        },
        named: function (one) {
            assert(this === object, 'named object method this')
            assert(one, 1, 'named object method parameters')
        },
        defaulted: function () {
            assert(this === object, 'defaulted object method this')
        }
    }
    operation = new Operation({ object: object, method: 'named' }, {})
    operation.apply([ 1 ])
    operation = new Operation({ object: object, method: object.direct, vargs: [ 1 ] })
    operation.apply([])

    operation = new Operation(function (one, two, three) {
        assert([ one, two, three ], [ 1, 2, 3 ], 'argument munging')
    }, [ 2 ])

    operation.apply([ 1 ], [ 3 ])

    operation = new Operation({ method: 'defaulted' }, { object: object })
    operation.apply([])
}
