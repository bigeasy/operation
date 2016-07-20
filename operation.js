var slice = [].slice

function Operation (operation, vargs) {
    var object = null
    if (vargs && !Array.isArray(vargs)) {
        object = vargs.object || null
        vargs = vargs.vargs
    }
    vargs || (vargs = [])
    if (typeof operation == 'function') {
        this.operation = operation
        this.method = 'apply'
        this.object = object || null
        this.vargs = vargs
    } else {
        this.object = operation.object || object
        this.vargs = (operation.vargs || []).concat(vargs)
        if (typeof operation.method == 'string') {
            this.operation = this
            this.method = '_named'
            this._name = operation.method
        } else {
            this.operation = operation.method
            this.method = 'apply'
        }
    }
}

Operation.prototype._vargs = function (args, vargs) {
    if (vargs == null) {
        return this.vargs.concat(args)
    }
    return args.concat(this.vargs.concat(vargs))
}

Operation.prototype.apply = function (args, vargs) {
    return this.operation[this.method](this.object, this._vargs(args, vargs))
}

Operation.prototype._named = function (object, vargs) {
    return object[this._name].apply(object, vargs)
}

module.exports = Operation
