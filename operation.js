const Interrupt = require('interrupt')
const Magazine = require('magazine')
const fs = require('fs').promises

// https://stackoverflow.com/a/41976600
// https://stackoverflow.com/questions/694188/when-does-the-write-system-call-write-all-of-the-requested-buffer-versus-just
// https://stackoverflow.com/questions/31737793/posix-partial-write?rq=1
// https://stackoverflow.com/questions/694188/when-does-the-write-system-call-write-all-of-the-requested-buffer-versus-just#comment70956787_694239

class Operation {

    static Error = Interrupt.create('Operation.Error', {
        IO_ERROR: 'an i/o error occured'
    })

    static Sync = class {
        constructor (strategy = 'O_SYNC') {
            this.strategy = strategy
            this.flag = strategy == 'O_SYNC' ? 'as' : 'a'
        }

        async sync ({ handle, properties = {} }) {
            if (this.strategy == 'fsync') {
                await Operation.Error.resolve(handle.sync(), 'IO_ERROR', properties)
            }
        }
    }

    static Cache = class extends Magazine.OpenClose {
        constructor (magazine, sync = new Operation.Sync) {
            super(magazine)
            this.sync = sync
        }
        subordinate () {
            return this._subordinate(magazine => new Operation.Cache(magazine, this.sync))
        }
        async open (filename) {
            return await Operation.Error.resolve(fs.open(filename, this.sync.flag), 'IO_ERROR')
        }
        async close (handle, filename) {
            await this.sync.sync({ handle, properties: { filename } })
            await Operation.Error.resolve(handle.close(), 'IO_ERROR')
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
        return {
            handle: await Operation.Error.resolve(fs.open(filename, flag, mode), 'IO_ERROR', { filename }),
            properties: { filename, mode, flag }
        }
    }

    static async close ({ handle, properties: { filename } }) {
        await Operation.Error.resolve(handle.close(), 'IO_ERROR', { filename })
    }

    static async *reader (filename, buffer, ...vargs) {
        const open = await Operation.open.apply(Operation, [ filename ].concat(vargs))
        const { handle, properties } = open
        try {
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
        } finally {
            await Operation.close(open)
        }
    }

    static async read (filename, buffer, ...vargs) {
        const f = vargs.pop()
        const open = await Operation.open.apply(Operation, [ filename ].concat(vargs))
        const { handle, properties } = open
        try {
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
        } finally {
            await Operation.close(open)
        }
    }

    static  async appendv (filename, buffers, sync) {
        const open = await Operation.open(filename, sync.flag)
        try {
            const written = await Operation.writev(open, buffers)
            await sync.sync(open)
            return written
        } finally {
            await Operation.close(open)
        }
    }
}

module.exports = Operation
