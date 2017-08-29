const Discord = require("discord.js");
var mysql = require('mysql');
var weather = require('weather-js');
var config = require('./config.json')
const client = new Discord.Client();
var prefix = '!';


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

    var msgAuthor = msg.author;
  // Ignore message from bots
  if(msg.author.bot) return;

  // Save messages in the database
  if(msg.content.indexOf(prefix) !== 0){
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
  }



    if(msg.content.toLowerCase().includes('arcisse')){
        if( msg.author == '<@188246781467951104>'){
        msg.channel.send("Oui Monsieur.");
        } else {
            msg.channel.send("Je ne repond qu'a Monsieur");
        }
    }

  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if(msg.content.indexOf(prefix) !== 0){ return; }
  // console.log("Commands : " + command);
  //  console.log("Args :" + args);
  if (command === 'ping') {
      msg.channel.send('Je suis Arcisse et je fais miskine!');
  }

 /*if(msg.content === "qsdfqsdfqez") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = msg.content;
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    msg.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    msg.channel.send("author "+ msg.author + " createdat " + msg.createdAt + " timestamp" + msg.createdTimestamp +" content "+ msg.content + " id "+msg.id+ " member "+msg.member);
    console.log(msg.member + " "+msg.author);
  }*/

    if(command === 'meteo'){
        weather.find({search: args[0], degreeType: 'C'}, function(err, result) {
            if (err) throw err;
            console.log(JSON.stringify(result, null, 2));
            msg.channel.send("La temperature est de "+result[0].current.temperature+ "°C.\nLe temps est : "+result[0].current.skytext);
        }
                    )
    }


    if(command=='dolanpls'){
        msg.channel.send("",{file:'./Dolan.jpg'});
    }

    
    
    if(command === 'stats'){
     console.log(msgAuthor);
  var sql ="SELECT COUNT(*) AS total FROM messages WHERE author = " +'"' + msgAuthor +'"';
  con.query(sql,function(err,result){
    if (err) throw err;
   msg.channel.send(msgAuthor +" has sent " + result[0].total + " messages.");  
});
}
});


client.login(config.token);
