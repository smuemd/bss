require('reify')
const o = require('ospec')

const styleEl = {
  style: {
    setProperty: (prop) => {
      if (prop === 'backgroundColor')
        throw new Error()
    }
  }
}
global.document = {
  createElement: () => styleEl,
  head: {
    appendChild: () => null
  },
  documentElement: {
    style: {
      backgroundColor: '',
      width: '0'
    }
  }
}

global.window = {
  navigator: {
    userAgent: 'test'
  }
}

const b = require('../lib').default
const sheet = require('../lib/sheet')

o.spec('bss', function() {
  o.afterEach(sheet._reset)

  o('inputs', function() {
    o(b`foo: bar;`.style).deepEquals({ foo: 'bar' })
    o(b`foo: bar`.style).deepEquals({ foo: 'bar' })
    o(b`foo: bar`.style).deepEquals({ foo: 'bar' })
    o(b({ foo: 'bar' }).style).deepEquals({ foo: 'bar' })
    o(b('foo', 'bar').style).deepEquals({ foo: 'bar' })
  })

  o('default css properties', function() {
    o(b.bc('green').style).deepEquals({ backgroundColor: 'green' })
    o(b.backgroundColor('red').style).deepEquals({ backgroundColor: 'red' })
  })

  o('pseudo', function(done) {
    const cls = b.$hover(b.bc('green')).class
    setTimeout(() => {
      o(styleEl.textContent).equals(`.${cls}:hover{background-color:green;}`)
      done()
    })
  })

  o('css class generation', function(done) {
    const cls = b`foo: bar;`.class
    setTimeout(() => {
      o(cls).equals(sheet.classPrefix + 1)
      o(styleEl.textContent).equals(`.${cls}{foo:bar;}`)
      done()
    })
  })

  o('add px', function() {
    o(b`w 1`.style).deepEquals({ width: '1px' })
    o(b('width 1').style).deepEquals({ width: '1px' })
    o(b.w(1).style).deepEquals({ width: '1px' })
  })

  o('clears empty', function() {
    o(b.width(false && 20).style).deepEquals({})
    o(b.width(undefined && 20).style).deepEquals({})
    o(b.width(null && 20).style).deepEquals({})
    o(b.width('').style).deepEquals({})
  })

  o.spec('helpers', function() {

    o('without args', function() {
      b.helper('foobar', b`foo bar`)
      o(b.foobar.style).deepEquals({ foo: 'bar' })
    })

    o('with args (object notation)', function() {
      b.helper('foo', arg => b({ foo: arg }))
      o(b.foo('bar').style).deepEquals({ foo: 'bar' })
    })

    o('with args (bss notation)', function() {
      b.helper('foo', arg => b`foo ${arg}`)
      o(b.foo('bar').style).deepEquals({ foo: 'bar' })
    })

    o('with and without args mixed', function() {
      b.helper('foo', arg => b`foo ${arg}`)
      b.helper('baz', b`baz foz`)
      o(b.foo('bar').baz.style).deepEquals({ foo: 'bar', baz: 'foz' })
    })
  })
})
