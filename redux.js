module.exports = function () {
    var vargs = Array.prototype.slice.call(arguments)
    var operation = vargs.shift(), arity = null, options = {}
    if (typeof vargs[0] == 'number') {
        arity = vargs.shift()
    }
    if (vargs.length) {
        options = vargs.shift()
    }
    var object = null, method = null
    switch (typeof operation) {
    case 'function':
        operation = {
            object: options.object || null,
            method: operation
        }
        break
    case 'string':
        operation = {
            object: options.object,
            method: operation
        }
        break
    }
    var f
    if (arity) {
        var args = []
        for (var i = 0; i < arity; i++) {
            args.push('_' + i)
        }
        if (typeof operation.method == 'string') {
            var escaped = JSON.stringify(operation.method)
            f = Function.call(Function, 'object', '                         \n\
                return function (' + args.join(', ') + ') {                 \n\
                    return object[' + escaped + '](' + args.join(', ') + ') \n\
                }                                                           \n\
            ')(operation.object)
        } else {
            f = Function.call(Function, 'object', 'method', '               \n\
                return function (' + args.join(', ') + ') {                 \n\
                    return method.call(object, ' + args.join(', ') + ')     \n\
                }                                                           \n\
            ')(operation.object, operation.method)
        }
    } else {
        if (typeof operation.method == 'string') {
            var escaped = JSON.stringify(operation.method)
            f = Function.call(Function, 'object', '                         \n\
                return function () {                                        \n\
                    return object[' + escaped + '].apply(object, arguments) \n\
                }                                                           \n\
            ')(operation.object, operation.method)
        } else {
            f = (function (object, method) {
                return function () {
                    return method.apply(object, arguments)
                }
            })(operation.object, operation.method)
        }
    }
    for (var name in options.properties || {}) {
        f[name] = options.properties[name]
    }
    return f
}
