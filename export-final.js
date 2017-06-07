var fs = require('fs');
var output = "";

fs.readFile('./input/Numbers/Numbers.post.json', (err, data) => {
  if (err) throw err;
  var list = JSON.parse(data);
  console.log("read file",list);
  parse(list.Data);
});


var looplist;
function parse(data){
  console.log("loop "+ data.length);
  looplist = data;
  parseItem();

}

function getNameIndex(name){
  switch (name) {
    case "red":
      return 0;
      break;
    case "blue":
      return 2;
      break;
    case "yellow":
      return 4;
      break;
    case "green":
      return 6;
      break;
    case "pink":
      return 8;
      break;
    case "orange":
      return 10;
      break;
  }
  return 666;
}
function parseItem(){
  if(looplist.length==0){
    console.log("done");
    save();
  }
  else{
    var item = looplist.shift();
    var id = item.Input;
    output += id+';';
    console.log("go thru",id);
    fs.readFile('./input/Numbers '+id+'/Numbers '+id+'.post.json', (err, data) => {
      if (err) throw err;
      var list = JSON.parse(data);
      var win = [];
      for(var i = 0; i < list.Data.length; i++){
        var sub = list.Data[i].Input.split(',');
        var index = getNameIndex(sub[0]);
        win[index] = sub[2].trim();
        win[index+1] = (i>3) ? 0 : i;
      }
      output += win.join(';');
      output += "\n";
      parseItem();
    });

  }
}

function save(){
  fs.writeFile("output/drawlist.csv", output, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  });
}


/**
position = 0 inget
position = 1 först vinst osv.
    lottnr,
    röd namn, röd position,
    blå namn, blå position,
    gul namn, gul position,
    grön namn, grön position,
    rosa namn, rosa position,
    organge namn, orange position

**/
