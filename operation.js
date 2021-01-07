const Interrupt = require('interrupt')
const Magazine = require('magazine')
const fs = require('fs').promises

class Operation {

    static Error = Interrupt.create('Operation.Error', {
        IO_ERROR: 'an i/o error occured'
    })

    static Cache = class extends Magazine.OpenClose {
        constructor (magazine, flush = 'O_SYNC') {
            super(magazine)
            this.flush = flush
        }
        subordinate () {
            return this._subordinate(magazine => new Operation.Cache(magazine, this.flush))
        }
        async open (filename) {
            const flag = this.flush == 'O_SYNC' ? 'as' : 'a'
            return await Operation.Error.resolve(fs.open(filename, flag), 'IO_ERROR')
        }
        async close (handle, filename) {
            await this.sync({ handle, properties: { filename } })
            await Operation.Error.resolve(handle.close(), 'IO_ERROR')
        }

        async sync ({ handle, properties = {} }) {
            if (this.flush == 'fsync') {
                await Operation.Error.resolve(handle.sync(), 'IO_ERROR', properties)
            }
        }
    }

    static async writev ({ handle, properties = {} }, buffers) {
        const expected = buffers.reduce((sum, buffer) => sum + buffer.length, 0)
        const { bytesWritten } = await Operation.Error.resolve(handle.writev(buffers), 'IO_ERROR', properties)
        if (bytesWritten != expected) {
            const slice = buffers.slice(0)
            let skipped = 0
            for (;;) {
                if (skipped + slice[0].length > bytesWritten) {
                    slice[0] = slice[0].slice(bytesWritten - skipped)
                    break
                }
                skipped += slice.shift().length
            }
            await Operation.writev({ handle, properties }, slice)
        }
        return expected
    }

    static async open (filename, ...vargs) {
        const mode = typeof vargs[0] == 'number' ? vargs.shift() : 438
        const flag = typeof vargs[0] == 'string' ? vargs.shift() : 'r'
        const f = vargs.shift()
        const handle = await Operation.Error.resolve(fs.open(filename, flag, mode), 'IO_ERROR', { filename })
        try {
            await f({ handle, properties: { filename } })
        } finally {
            await Operation.Error.resolve(handle.close(filename), 'IO_ERROR', { filename })
        }
    }

    static async *reader ({ handle, properties = {} }, buffer) {
        let position = 0
        for (;;) {
            const { bytesRead } = await Operation.Error.resolve(handle.read(buffer, 0, buffer.length), 'IO_ERROR', properties)
            if (bytesRead == 0) {
                break
            }
            const slice = bytesRead < buffer.length ? buffer.slice(0, bytesRead) : buffer
            yield { buffer: slice, properties, position }
            position += slice.length
        }
    }

    static async read ({ handle, properties = {} }, buffer, f) {
        let position = 0
        for (;;) {
            const { bytesRead } = await Operation.Error.resolve(handle.read(buffer, 0, buffer.length), 'IO_ERROR', properties)
            if (bytesRead == 0) {
                break
            }
            const slice = bytesRead < buffer.length ? buffer.slice(0, bytesRead) : buffer
            f({ buffer: slice, properties, position })
            position += slice.length
        }
    }
}

module.exports = Operation
