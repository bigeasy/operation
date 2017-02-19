module.exports = function () {
    var vargs = Array.prototype.slice.call(arguments)
    var operation = vargs.shift(), arity = null, properties = {}
    if (typeof vargs[0] == 'number') {
        arity = vargs.shift()
    }
    if (vargs.length) {
        properties = vargs.shift()
    }
    var object = null, method = null
    if (typeof operation == 'function') {
        operation = {
            object: null,
            method: operation
        }
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
    for (var name in properties) {
        f[name] = properties[name]
    }
    return f
}
