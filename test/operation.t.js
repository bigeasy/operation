require('proof')(7, async okay => {
    const path = require('path')
    const fs = require('fs').promises

    const Magazine = require('magazine')
    const Operation = require('../operation')

    const buffer = Buffer.from('abcdefghijklmnopqrstuvwxyz')

    await fs.rmdir(path.join(__dirname, 'tmp'), { recursive: true })
    await fs.mkdir(path.join(__dirname, 'tmp'), { recursive: true })

    const cache = new Operation.Cache(new Magazine)


    const gathered = []
    const handle = {
        async writev (buffers) {
            const slice = Buffer.concat(buffers).slice(0, 17)
            gathered.push(String(slice))
            return { bytesWritten: slice.length }
        }
    }

    const split = []
    for (let i = 0; i < buffer.length; i += 5) {
        split.push(buffer.slice(i, i + 5))
    }
    await Operation.writev({ handle }, split)

    okay(gathered, [ String(buffer.slice(0, 17)), String(buffer.slice(17)) ], 'writev retry')

    const filename = path.join(__dirname, 'tmp', 'file')

    {
        const open = await Operation.open(filename, 'a')
        try {
            await Operation.writev(open, [ buffer ])
            await cache.sync.sync({ handle: open.handle })
        } finally {
            await Operation.close(open)
        }
    }

    const file = await fs.readFile(path.join(__dirname, 'tmp', 'file'), 'utf8')
    okay(file, String(buffer), 'writev')

    gathered.length = 0
    await Operation.read(filename, Buffer.alloc(16), 0o444, Buffer.alloc(16), ({ buffer, position }) => {
        gathered.push({ buffer: String(buffer), position })
    })

    okay(gathered, [
        { buffer: 'abcdefghijklmnop', position: 0 },
        { buffer: 'qrstuvwxyz', position: 16 }
    ], 'sync read')

    gathered.length = 0
    for await (const { buffer, position } of await Operation.reader(filename, Buffer.alloc(16))) {
        gathered.push({ buffer: String(buffer), position })
    }

    okay(gathered, [
        { buffer: 'abcdefghijklmnop', position: 0 },
        { buffer: 'qrstuvwxyz', position: 16 }
    ], 'async read')

    const subordinate = cache.subordinate()
    const cartridge = await cache.get(path.join(__dirname, 'tmp', 'file'))
    {
        const cartridge = await subordinate.get(path.join(__dirname, 'tmp', 'osync'))
        cartridge.release()
        await subordinate.shrink(0)
    }
    cartridge.release()
    okay(cache.magazine.size, 1, 'still has parent handle')
    await cache.shrink(0)
    okay(cache.magazine.size, 0, 'parent cache cleared')

    {
        const fsync = new Operation.Cache(new Magazine, new Operation.Sync('fsync'))
        const cartridge = await fsync.get(path.join(__dirname, 'tmp', 'file'))
        cartridge.release()
        await fsync.shrink(0)
    }

    {
        const filename = path.join(__dirname, 'tmp', 'file')
        await fs.unlink(filename)
        await Operation.appendv(filename, [ buffer ], cache.sync)
        const file = await fs.readFile(filename, 'utf8')
        okay(file, String(buffer), 'appendv')
    }
})
