var fs = require('fs');
var group = {};
fs.readFile('server-list.json', (err, data) => {
  if (err) throw err;
  list = JSON.parse(data);
  //console.log("read file",list);
  parse(list);
});


function parse(data){
  console.log("loop "+ data.length);

  for(var i = 0; i < data.length; i++){
    var obj = data[i];
    if(group["id"+obj.id]==null){
      group["id"+obj.id] = {id:obj.id,list:[]};
    }
    group["id"+obj.id].list.push(obj);
  }


  save(group);
}

function save(obj){

  var outputNumbers = '';
  for (var prop in obj) {
       // skip loop if the property is from prototype
       if(!obj.hasOwnProperty(prop)) continue;

       // your code
       outputNumbers += obj[prop].id+"\n";

       var outputUsers = '';
       for(var i = 0; i < obj[prop].list.length; i++){
         outputUsers += obj[prop].list[i].category+", "+ obj[prop].list[i].email +", "+obj[prop].list[i].name+"\n";
       }

       fs.writeFile("output/numbers-"+obj[prop].id+".game", outputUsers, function(err) {
         if(err) {
             return console.log(err);
         }
         console.log("The file was saved "+obj[prop].id);
     });
   }




  fs.writeFile("output/numbers.game", outputNumbers, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
}
