const Discord = require("discord.js");
var mysql = require('mysql');
var config = require('config.json')
const client = new Discord.Client();

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: config.dbpass,
  database: "discord"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to SQL server");
});


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  var sql = "INSERT INTO messages SET ?";
  var post = {content: msg.content,
              creation: msg.createdAt,
              channel: msg.channel,
              author: msg.author,
              timestamp: msg.createdTimestamp,
              msgid: msg.id};
    con.query(sql,post, function(err,result) {
    if (err) throw err;
    console.log("Message from "+ post.author +" created at " + post.creation + " was successfully saved");
    });

  if (msg.content === 'ping') {
      msg.channel.send('Je suis Arcisse et je fais miskine!');
  }
 if(msg.content === "qsdfqsdfqez") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = msg.content;
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    msg.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    msg.channel.send("author "+ msg.author + " createdat " + msg.createdAt + " timestamp" + msg.createdTimestamp +" content "+ msg.content + " id "+msg.id+ " member "+msg.member);
    console.log(msg.member + " "+msg.author);
  }
 if(msg.content === 'stat arcissesdfsdfsdfds'){
  var sql ="SELECT COUNT(*) FROM messages WHERE author=?";
  var total = 0;

  con.query(sql,[msg.author], function(err,result,fields){
    if (err) throw err;
    total = result;
  });
 msg.reply("You have sent " + total + " messages.");
}
});


client.login(config.token);