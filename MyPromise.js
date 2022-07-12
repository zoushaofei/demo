

function MyPromise (handle) {
  if (!handle || Object.prototype.toString.call(handle) !== '[object Function]') {
    throw new Error('Promise must accept a function as a parameter')
  }
  this._value = undefined
  this._status = 'pending'
  this._fulfilledQueues = []
  this._rejectedQueues = []

  const _resolve = () => {
    if (this._status !== 'pending') {
      return
    }
    this._status = 'fulfilled'
  }

  const _reject = () => {
    if (this._status !== 'pending') {
      return
    }
    this._status = 'rejected'
  }

  try {
    handle(_resolve, _reject)
  } catch (err) {
    _reject(err)
  }
}

MyPromise.prototype.then = function (fulfilledHandler, rejectedHandler) {
  const runFulfilledHandler = () => {
    try {

    } catch (error) {

    }
  }
  const runRejectedHandler = () => {

  }
  if (this._status === '') {

  } else if (this._status === '') {
    fulfilledHandler(this._value)
  } else if (this._status === '') {
    rejectedHandler(this._value)
  }
}