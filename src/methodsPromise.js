import isPromise from './isPromise'
import isObject from './isObject'

export default (opt = {}) => {
  // Configure the hook function
  if (typeof opt.hookName !== 'string') {
    opt.hookName = '$promise'
  }
  // Global hook function
  if (typeof opt.promise !== 'function') {
    opt.promise = (mp) => {
      mp.catch((err) => {
        console.log(err)
      })
    }
  }

  return {
    beforeCreate () {
      const { methods } = this.$options
      if (!isObject(methods)) return
      Object.keys(methods).forEach((k) => {
        let fn = methods[k]
        if (typeof fn === 'function' && k !== opt.hookName) {
          methods[k] = hijack(fn)
        }
      })
      function hijack (native) {
        return function (...arg) {
          let back = native.apply(this, arg)
          if (isPromise(back)) {
            if (typeof this[opt.hookName] === 'function') {
              let hookBack = this[opt.hookName](back)
              if (isPromise(hookBack)) {
                return opt.promise.call(this, back)
              }
              return hookBack
            } else {
              return opt.promise.call(this, back)
            }
          }
          return back
        }
      }
    }
  }
}
