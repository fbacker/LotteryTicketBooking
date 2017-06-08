var fs = require("fs");
var moment = require("moment");
var limitCategory = 10000;
var limitTotal = 10000;
var list = [];

var smtpConfig = {
    host: 'smtp.folkspel.se',
    port: 25,
    secure: false
};

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(smtpConfig);

function checkFile(){
  fs.stat('list.json',function(err, stats){
    if(err){
      createFile();
      return;
    }
    console.log("file exists");
    readFile();
  });
}

function createFile(){
  fs.writeFile('list.json', '[]', (err) => {
    if (err) throw err;
    console.log('Created file!');
    readFile();
  });
}

function readFile(){
  fs.readFile('list.json', (err, data) => {
    if (err) throw err;
    list = JSON.parse(data);
    console.log("read file",list);
  });
}

function saveFile(){
  fs.writeFile('list.json', JSON.stringify(list, null, "\t"), (err) => {
    if (err) throw err;
    console.log('It\'s saved!');
  });
}
checkFile();


function isTaken(item){
  for(var i = 0; i < list.length; i++){
    var ticket = list[i];
    if(ticket.category===item.category&&ticket.id===item.id) return true;
  }
  return false;
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function userOfTickets(localList,email){
  var tickets = [];
  for(var i = 0; i < localList.length; i++){
    if(localList[i].email===email) tickets.push(localList[i]);
  }
  return tickets;
}

function ticketsInCategory(localList,category){
  var tickets = [];
  for(var i = 0; i < localList.length; i++){
    if(localList[i].category===category) tickets.push(localList[i]);
  }
  return tickets;
}

function categoryPretty(cat){
	switch(cat){
		case "red":
			return "Röd";
		case "blue":
			return "Blå";
		case "green":
			return "Grön";
		case "yellow":
			return "Gul";
    case "pink":
      return "Rosa";
    case "orange":
      return "Orange";
	}
}

var appRouter = function(app) {

  app.get("/api/list", function(req, res) {
      return res.send(list);
  });

  app.post("/api/add", function(req, res) {
    // req.body
    var selected = req.body.selected;
    var email = req.body.email;
    var name = req.body.name;
    var isAdmin = req.body.bb;
    var taken = [];
    console.log(email,selected);
    if(isAdmin){
      for(var i = 0; i < selected.length; i++){
        if(selected[i].type === 'delete' && selected[i].checked){
          // remove
          for(var j = 0; j < list.length; j++){
            if(selected[i].category===list[j].category && selected[i].id===list[j].id){
              list.splice(j,1);
              break;
            }
          }
        }
        else if(selected[i].type === 'payed'){
          // change setting
          for(var j = 0; j < list.length; j++){
            if(selected[i].category===list[j].category && selected[i].id===list[j].id){
              list[j].payed = selected[i].checked;
              break;
            }
          }
        }
      }

      saveFile();
      return res.send({status:true});
    }
    // how many have we taken???
    var userTickets = userOfTickets(list,email).concat(selected);
    if(userTickets.length>limitTotal){ // Total limit
      return res.status(402).send('blubb');
    }
    for(var i = 0; i < selected.length; i++){ // in same serie limit
      var userCategoryTickets = ticketsInCategory(userTickets,selected[i].category);
      if(userCategoryTickets.length>limitCategory){
        return res.status(403).send(selected[i].category);
      }
    }
    for(var i = 0; i < selected.length; i++){// in same serie
      for(var j = 0; j < userTickets.length; j++){
        var ticket = userTickets[j];
        if(ticket.id===selected[i].id && ticket.category!==selected[i].category){
          return res.status(404).send(selected[i].id);
        }
      }
    }
    // make sure none of selected is already taken
    for(var i = 0; i < selected.length; i++){
      if(isTaken(selected[i])) {
        taken.push(selected[i]);
      }
    }
    if(taken.length>0){
      return res.status(401).send(taken);
    }

    // we are good to save
    name = toTitleCase(name);
    //var name = toTitleCase(email.split("@")[0].split(".").join(' '));
	var emailList = "";
	var emailListText = "";
    for(var i = 0; i < selected.length; i++){
      selected[i].date = moment().format('YYYY-MM-DD HH:MM:ss');
      selected[i].email = email;
      selected[i].name = name;
      selected[i].payed = false;
      list.push(selected[i]);
	  emailList += "<li>"+categoryPretty(selected[i].category)+", "+selected[i].id+"</li>";
	  emailListText += categoryPretty(selected[i].category)+", "+selected[i].id+"\n";
    }
    saveFile();

	// setup e-mail
	var mailOptions = {
		from: 'no.reply@folkspel.se', // sender address
		to: email, // list of receivers
		subject: 'Sommarlotteriet. Hurra!!!', // Subject line
		text: 'Grattis.\nDu har köpt lotterna:'+emailListText+'\nVi önskar dig all lycka.', // plaintext body
		html: '<p><b>Grattis</b></p><p>Du har köpt lotterna</p><ul>'+emailList+'</ul><p>Vi önskar dig all lycka.</p>' // html body
	};

	console.log("email",mailOptions);
	// send mail

	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	});

    return res.send({status:true});
  });

}

module.exports = appRouter;
