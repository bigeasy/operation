function Operation (operation) {
    if (typeof operation == 'function') {
        this.operation = operation
        this.method = 'apply'
        this.object = null
    } else if (typeof operation.object == 'object') {
        this.object = operation.object
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
    this.operation[this.method](this.object, vargs)
}

Operation.prototype._named = function (object, vargs) {
    object[this._name].apply(object, vargs)
}

module.exports = Operation
