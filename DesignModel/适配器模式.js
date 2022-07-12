// 别名 包装器

var getGuangdongCity = function () {
  var guangdongCity = [
    {
      name: 'shenzhen',
      id: 11
    },
    {
      name: 'guangzhou',
      id: 12
    }
  ]
  return guangdongCity
}

var guangdongCity = {
  shenzhen: 11,
  guangzhou: 12,
  zhuhai: 13
}

var addressAdapter = function (oldAddressFn) {
  var address = {},
    oldAddress = oldAddressFn()

  for (var i = 0, c; c = oldAddress[i++];) {
    address[c.name] = c.id
  }

  return function () {
    return address
  }
}

var render = function (fn) {
  console.log('渲染数据')
  // document.write(JSON.stringify(fn()))
  console.log(fn())
}

render(addressAdapter(getGuangdongCity))