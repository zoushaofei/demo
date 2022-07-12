miniConsole = {
  log: function () {
    console.log("miniConsole")
    console.log.apply(console, arguments)
  }
}