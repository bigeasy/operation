function Operation (operation) {
    if (typeof operation == 'function') {
        this.operation = operation
        this.method = 'apply'
        this.object = null
        this.vargs = []
    } else {
        this.object = operation.object
        this.vargs = operation.vargs || []
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

Operation.prototype.apply = function (vargs) {
    return this.operation[this.method](this.object, this.vargs.concat(vargs))
}

Operation.prototype._named = function (object, vargs) {
    return object[this._name].apply(object, this.vargs.concat(vargs))
}

module.exports = Operation
