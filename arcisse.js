const Discord = require("discord.js");
const fs = require('fs');
const mysql = require('mysql');
const weather = require('weather-js');
const ChartjsNode = require('chartjs-node');
const config = require('./config.json')
const client = new Discord.Client();
var prefix = '!';

var chartNode = new ChartjsNode(600, 600);

chartNode.drawChart({
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
            label: "My First dataset",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45],
        }]
    },
    options:{}
  })
.then(() => {
    // chart is created 
 
    // get image as png buffer 
    return chartNode.getImageBuffer('image/png');
})
.then(buffer => {
    Array.isArray(buffer) // => true 
    // as a stream 
    return chartNode.getImageStream('image/png');
})
.then(streamResult => {
    // using the length property you can do things like 
    // directly upload the image to s3 by using the 
    // stream and length properties 
    streamResult.stream // => Stream object 
    streamResult.length // => Integer length of stream 
    // write to a file 
    return chartNode.writeImageToFile('image/png', '/home/pi/Arcisse-the-bulter/histo.png');
})
.then(() => {
    // chart is now written to the file path 
    // ./testimage.png 
});

chartNode.destroy();



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
            msg.channel.send("Dois-je appeler les Hendecks ?");
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


    if(command === 'meteo'){
        weather.find({search: args[0], degreeType: 'C'}, function(err, result) {
            if (err) throw err;
            console.log(JSON.stringify(result, null, 2));
            msg.channel.send("La temperature est de "+result[0].current.temperature+ "°C.\nLe temps est : "+result[0].current.skytext);
        }
                    )
    }


    if(command=='dolanpls'){
        msg.channel.send("",{file:'Arcisse-the-bulter/Dolan.jpg'});
    }

    
    
    if(command === 'stats'){
  var sql ="SELECT COUNT(*) AS total FROM messages WHERE author = " +'"' + msgAuthor +'"';
  con.query(sql,function(err,result){
    if (err) throw err;
   msg.channel.send(msgAuthor +" has sent " + result[0].total + " messages.");  });
    }


    if(command === 'stathisto'){
        var sql = "SELECT timestamp FROM messages WHERE author = " + '"' + msgAuthor + '"';
        con.query(sql, function(err,result){
            if (err) throw err;
            var times = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

            result.forEach( function(elem){
               
                var date = new Date(elem.timestamp);
                times[(date.getHours())%24] += 1;

            });
            var maxVal = Math.max(...times);
            toSend = '';
            for(var i=0; i<24;i++){
              var stri = '0'+i;
              var taille = parseInt(times[i]/maxVal*50,10);
              var barre = Array(taille).join('|');
              toSend += stri.substr(-2) +"h: "+barre+'\n';

              //Graph creation







            }
            msg.channel.send(toSend);

        });
    }

    if(command==='combien'){
      var sql = "SELECT COUNT(*) AS result FROM messages WHERE content LIKE" +'"%'+ args.join(" ")+'%"';
      con.query(sql, function(err, result){
        if (err) throw err;
        msg.channel.send("Il y a "+ result[0].result +" messages contenant "+args.join(" "));

      });
    }


    if(command==='quicmb'){
      var sql = "SELECT DISTINCT(author) as author from messages";
      con.query(sql, function(err, result){

        result.forEach(function(elem){
           var sql = "SELECT COUNT(*) AS result FROM messages WHERE content LIKE" +'"%'+ args.join(" ")+'%" AND author = "'+elem.author+'"';
           con.query(sql,function(err,result){
            if (err) throw err;
            msg.channel.send(elem.author + " a envoyé "+result[0].result +' fois '+args.join(" "));
           });
        });



      });
    }

    if(command ==='poisson'){
      var sql = "SELECT timestamp FROM messages";
      con.query(sql, function(err,result){
        if (err) throw err;
        var delay = [];
        for(var i=0;i<result.length-1;i++){
          delay[i]=result[i+1].timestamp-result[i].timestamp;
        }

        console.log(delay);

        fs.writeFile('/home/pi/Arcisse-the-bulter/delay.txt',delay,function(err){ if (err) throw err;});


    });
    }

    
});


client.login(config.token);
