var irc = require('irc');
var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('pages/index.html');
});


http.listen((process.env.PORT || 5000), function(){
  console.log('listening on *:3000');
});

var client = new irc.Client('irc.twitch.tv', process.env.TWITCHUSER, {
  channels: ['#bobross'],
  username: process.env.TWITCHUSER,
  password: process.env.TWITCHPASS 
});

var redis = require('redis');
var rclient = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true}); //creates a new client
var channel = 'bobross';

rclient.on('connect', function() {
    console.log('connected');
});

function addToZSet(sentence) {
  sentence.forEach(function (word) {
    if (word.length > 3) {
      rclient.zincrby(channel, 1, word);
    }
  });
}

channels = 'bobross'

io.on('connection', function(socket){
  rclient.zrange(channel,-10,-1,'WITHSCORES',function(err,result) {
    io.emit('chat message', result);
  });
io.emit('following', channels);
socket.on('channel', function (message) {
  if (message) {
    client.join('#' + message, function(err) {
      console.log('joined #' + message);
    });
    rclient.sadd('channels', message, function(err, result) {
      console.log('added ' + message + ' to channel');
    });
    rclient.smembers('channels',function(err,result) {
      channels += ',' + message
      io.emit('following', channels);
    });
  }
socket.on('flush', function(msg) {
  rclient.flushall(function (didSucceed) {
    console.log("Flushed chat count db");
  });
});

});


});

client.addListener('message', function (from, to, message) {
  console.log(from + ' : ' + Date.now() + ' : ' + to + ': ' + message);
  var sentence = message.split(" ");
  addToZSet(sentence);
  rclient.zrange(channel,-10,-1,'WITHSCORES',function(err,result) {
    io.emit('chat message', result);
  });
});


setInterval(function(){
  rclient.flushall( function (didSucceed) {
    console.log("Flushed DB");
  });
}, 24 * 60 * 60 * 1000); //clear DB every 24 hour
