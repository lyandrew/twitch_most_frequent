## Description
Server sided node application that shows the top 10 word in a Twitch channel. Updates in real-time using irc, redis, websockets, d3 for charts.

## Running Locally

Create a .credential file with:
```
export TWITCHUSER=<user>
export TWITCHPASS=<oauth:...>
```

Then run node locally:
node index.js

Running on heroku:

[boiling-meadow-4712.herokuapp.com](http://boiling-meadow-4712.herokuapp.com)
