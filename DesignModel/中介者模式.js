function Player (name, teamColor) {
  this.name = name;
  this.teamColor = teamColor;
  this.state = 'alive'
}

Player.prototype.win = function () {
  console.log(this.name + ' won')
}

Player.prototype.lose = function () {
  console.log(this.name + ' lose')
}

Player.prototype.die = function () {
  this.state = 'dead'
  playerDirector.ReceiveMessage('playerDead', this)
}

Player.prototype.remove = function () {
  playerDirector.ReceiveMessage('removePlayer', this)
}

Player.prototype.changeTeam = function (color) {
  playerDirector.ReceiveMessage('changeTeam', this, color)
}

var playerFactory = function (name, teamColor) {
  var newPlayer = new Player(name, teamColor)
  playerDirector.ReceiveMessage('addPlayer', newPlayer)
  return newPlayer
}

var playerDirector = (function () {
  var players = {},
    operations = {}

  operations.addPlayer = function (player) {
    if (players[player.teamColor]) {
      players[player.teamColor].push(player)
    } else {
      players[player.teamColor] = [player]
    }
  }

  operations.removePlayer = function (player) {
    var teamPlayers = players[player.teamColor]
    for (let i = teamPlayers.length - 1; i >= 0; i--) {
      if (teamPlayers[i] === player) {
        return teamPlayers.splice(i, 1)
      }
    }
  }

  operations.changeTeam = function (player, color) {
    operations.removePlayer(player)
    player.teamColor = color
    operations.addPlayer(player)
  }

  operations.playerDead = function (player) {
    var teamColor = player.teamColor, teamPlayers = players[player.teamColor];
    var all_dead = true;
    for (var i = 0, p; p = teamPlayers[i++];) {
      if (p.state !== 'dead') {
        all_dead = false
        break
      }
    }
    if (all_dead) {
      for (var i = 0, p; p = teamPlayers[i++];) {
        p.lose()
      }
      for (const color in players) {
        if (color !== teamColor) {
          var otherTeamPlayers = players[color]
          for (var i = 0, p; p = otherTeamPlayers[i++];) {
            p.win()
          }
        }
      }
    }
  }


  var ReceiveMessage = function () {
    var message = Array.prototype.shift.call(arguments)
    operations[message].apply(this, arguments)
  }
  return {
    ReceiveMessage
  }
})()

// ??????
var player1 = playerFactory('??????', 'red'),
  player2 = playerFactory('??????', 'red'),
  player3 = playerFactory('??????', 'red'),
  player4 = playerFactory('??????', 'red')

// ??????
var player5 = playerFactory('??????', 'blue'),
  player6 = playerFactory('??????', 'blue'),
  player7 = playerFactory('??????', 'blue'),
  player8 = playerFactory('??????', 'blue')

player1.remove()
player2.changeTeam()
player3.die()
player4.die()


var goods = {
  'red|16G|800': 0,
  'red|16G|801': 1,
  'red|32G|800': 2,
  'red|32G|801': 3,
  'blue|16G|800': 4,
  'blue|16G|801': 5,
  'blue|32G|800': 6,
  'blue|32G|801': 7,
}

var mediator = (function () {
  var colorSelect = document.querySelector('#colorSelect'),
    memorySelect = document.querySelector('#memorySelect'),
    cpuSelect = document.querySelector('#cpuSelect'),
    numberInput = document.querySelector('#numberInput'),
    colorInfo = document.querySelector('#colorInfo'),
    memoryInfo = document.querySelector('#memoryInfo'),
    cpuInfo = document.querySelector('#cpuInfo'),
    numberInfo = document.querySelector('#numberInfo'),
    nextBtn = document.querySelector('#nextBtn')

  return {
    changed: function (element) {
      var color = colorSelect.value,
        memory = memorySelect.value,
        cpu = cpuSelect.value,
        number = numberInput.value,
        stock = goods[color + '|' + memory + '|' + cpu]

      if (element === colorSelect) {
        colorInfo.innerHTML = color
      } else if (element === memorySelect) {
        memoryInfo.innerHTML = memory
      } else if (element === cpuSelect) {
        cpuInfo.innerHTML = cpu
      } else if (element === numberInput) {
        numberInfo.innerHTML = number
      }

      if (!color) {
        nextBtn.disabled = true
        nextBtn.innerHTML = '?????????????????????'
        return
      }

      if (!memory) {
        nextBtn.disabled = true
        nextBtn.innerHTML = '???????????????????????????'
        return
      }

      if (!cpu) {
        nextBtn.disabled = true
        nextBtn.innerHTML = '???????????????cpu'
        return
      }

      if (Number.isInteger(number - 0) && number > 0) {
        nextBtn.disabled = true
        nextBtn.innerHTML = '??????????????????????????????'
        return
      }

      if (number > stock) {
        nextBtn.disabled = true
        nextBtn.innerHTML = '????????????'
        return
      }

      nextBtn.disabled = false
      nextBtn.innerHTML = '???????????????'
    }
  }
})()

colorSelect.onchange = function () {
  mediator.changed(this)
}
memorySelect.onchange = function () {
  mediator.changed(this)
}
cpuSelect.onchange = function () {
  mediator.changed(this)
}
numberInput.onchange = function () {
  mediator.changed(this)
}