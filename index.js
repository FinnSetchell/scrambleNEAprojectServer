const http = require('http');
const sockets = require('socket.io')

const server = http.createServer();
const io = sockets(server,  {
  cors: {
    origin: "https://scramble-game.finn765.repl.co",
    methods: ["GET", "POST"]
  }
});

const Statuses = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  WIN: 'win'
}

let gameState = {
  board: new Array(9).fill(null),
  currentPlayer: null,
  players : [],
  result : {
    status : Statuses.WAITING
  }
}

io.on('connection', function (connection) {
  connection.on('addPlayer', addPlayer(connection.id));
  connection.on('action', action(connection.id));
  connection.on('rematch', rematch(connection.id));
  connection.on('disconnect', disconnect(connection.id));
});


function addPlayer(socketId){
  return (data)=>{
    const numberOfPlayers = gameState.players.length;
    if (numberOfPlayers >= 2){
      return;
    }

    let nextSymbol = 'X';
    if (numberOfPlayers === 1){
      if (gameState.players[0].symbol === 'X'){
        nextSymbol = 'O';
      }
    }

    const newPlayer = {
      playerName: data.playerName,
      id: socketId,
      symbol: nextSymbol
    };

    gameState.players.push(newPlayer);
    if (gameState.players.length === 2){
      gameState.result.status = Statuses.PLAYING;
      gameState.currentPlayer = newPlayer;
    }
    io.emit('gameState', gameState);

  }
}

function action(socketId){
  return (data)=> {
    if (gameState.result.status === Statuses.PLAYING && gameState.currentPlayer.id === socketId){
      const player = gameState.players.find(p => p.id === socketId);
      if (gameState.board[data.gridIndex] == null){
        gameState.board[data.gridIndex] = player;
        gameState.currentPlayer = gameState.players.find(p => p !== player);
        checkForEndOfGame();
      }
    }
    io.emit('gameState', gameState);
  }
}

function rematch(socketId){
  return (data) => {
    if (gameState.players.findIndex(p=> p.id === socketId) < 0) return; // Don't let spectators rematch
    if (gameState.result.status === Statuses.WIN || gameState.result.status === Statuses.DRAW){
      resetGame();
      io.emit('gameState', gameState);
    }
  }
}

function resetGame(){
  gameState.board = new Array(9).fill(null);

  if (gameState.players.length === 2){
    gameState.result.status = Statuses.PLAYING;
    const randPlayer = Math.floor(Math.random() * gameState.players.length);
    gameState.currentPlayer = gameState.players[randPlayer];
  } else {
    gameState.result.status = Statuses.WAITING;
    gameState.currentPlayer = null;
  }
}

function disconnect(socketId){
  return (reason) => {
    gameState.players = gameState.players.filter(p => p.id != socketId);
    if (gameState.players !== 2){
      resetGame();
      io.emit('gameState', gameState);
    }
  }
}

function checkForEndOfGame(){
  // Check for a win
  
}




function setDailyChallenge() {
  //checks time, when 00:00, generates a new daily challenge
}
function getDailyChallenge() {
  //gets daily challenge and returns it to the client
}
function leaderboard(player, score, date) {
  //saves the score with each player in a database
}
function fetchLeaderboard(range) {
  //fetches the top scores from a set range (day, week, month, etc)
  //sends them to the client
}


server.listen(3000, function() {
  console.log('listening on 3000');
});