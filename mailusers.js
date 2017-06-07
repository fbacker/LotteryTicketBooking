var fs = require('fs');
var users = {};

var smtpConfig = {
    host: 'smtp.folkspel.se',
    port: 25,
    secure: false
};

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(smtpConfig);


fs.readFile('server-list.json', (err, data) => {
  if (err) throw err;
  list = JSON.parse(data);
  //console.log("read file",list);
  parse(list);
});

function getName(name){
  switch (name) {
    case "red":
      return "Röd";
      break;
    case "blue":
      return "Blå";
      break;
    case "yellow":
      return "Gul";
      break;
    case "green":
      return "Grön";
      break;
    case "pink":
      return "Rosa";
      break;
    case "orange":
      return "Orange";
      break;
  }
  return name;
}


function parse(data){
  console.log("loop "+ data.length);

  for(var i = 0; i < data.length; i++){
    var obj = data[i];
    if(users[obj.email]==null) users[obj.email] = [];
    users[obj.email].push(getName(obj.category)+': '+ obj.id);
  }

  email();
}

function email(){

  var counter = 0;
  var max = 0;
  for (var prop in users) {

       // skip loop if the property is from prototype
       if(!users.hasOwnProperty(prop)) continue;

       counter++;

       var output = "<h2>Inför Vinlotteriet</h2><p>Håll koll på dina lotter:</p><ul>";
       var list =  users[prop];
       list.sort(function(x, y)
          {
            //console.log("compare",x,y);
            var a = x.split(":");
            var b = y.split(":");
            if(a[0]==b[0]){
              return parseInt(a[1].trim()) > parseInt(b[1].trim());
            }
            return x > y;
          });
       max = (list.length>max) ? list.length : max;
       for(var i = 0; i < list.length; i++){
         output += "<li>"+list[i]+"</li>";
       }
       output += "</ul>";

       //if(prop=="fredrick.backer@folkspel.se"){
         //||prop=="niclas.carlsson@folkspel.se"||prop=="jan.olsen@folkspel.se"||prop=="torbjorn.bergman@folkspel.se"
         console.log(output);

         // setup e-mail data with unicode symbols
         var mailOptions = {
             from: 'no.reply@folkspel.se', // sender address
             to: prop, // list of receivers
             subject: 'Sommarlotteriet. Nu kör vi!!!', // Subject line
             text: 'Skaffa dig en mail client som klarar html.', // plaintext body
             html: output // html body
         };

         // send mail with defined transport object

         transporter.sendMail(mailOptions, function(error, info){
             if(error){
                 return console.log(error);
             }
             console.log('Message sent: ' + info.response);
         });


      // }
       /*
       // your code
       outputNumbers += obj[prop].id+"\n";

       var outputUsers = '';
       for(var i = 0; i < obj[prop].list.length; i++){
         outputUsers += obj[prop].list[i].category+", "+ obj[prop].list[i].email +", "+obj[prop].list[i].name+"\n";
       }
*/
   }

   console.log("im done with "+ counter+ " users, max purchase was "+ max);

}
