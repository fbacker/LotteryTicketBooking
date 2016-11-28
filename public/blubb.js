$(function() {


  var validateEmail = function(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
  };

  var getParameterByName = function(name, url) {
      if (!url) {
        url = window.location.href;
      }
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  var isAdmin = (getParameterByName('blubb')==='admin');
  var numOfTickets = 50;
  var bases = ["red","blue","green"];

  var updateInterval = null;
  var displayItem = "<div data-id='#ID' data-category='#CATEGORY' class='line'><label><input type='checkbox' data-type='book' /> <span>Lott #ID</span></label></div>";
  var adminItem = "<div><input type='checkbox' data-type='delete'><span>delete</span></input>&nbsp;&nbsp;&nbsp;<input type='checkbox' data-type='payed'><span>payed</span></input></div>";
  if(isAdmin)
    $("#btnSubmit").html('Uppdatera');

  var print = function(error,message){
    console.log("print",error,message);
    var type = (error) ? 'danger' : 'success';
    var messageout = '<div class="alert alert-'+type+' alert-dismissible" role="alert">'+
      '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
      message+
    '</div>';

    $("#alerts").append(messageout);
  };

  var highlight = function(item){
    item.addClass('highlighted');
    window.setTimeout(function() {
        item.removeClass('highlighted');
    }, 5 * 1000);
  };

  var build = function(){
    for(var i = 0; i < bases.length; i++){
      var base = $("#block-"+bases[i]);
      for(var j = 1; j <= numOfTickets; j++){
        var strItem = displayItem.concat('');
        strItem = strItem.replace(/#ID/g,j);
        strItem = strItem.replace(/#CATEGORY/g,bases[i]);
        var item = $(strItem).appendTo(base);
        if(isAdmin){
          var input = item.find('input');
          input.attr('disabled',true);
          input.css('display','none');
          item.addClass('lineadmin');
          item.append(adminItem);
        }
      }
    }
  };

  $( "#form" ).submit(function( event ) {
    event.preventDefault();

    var email = $("#email").val().toLowerCase();
    var name = $("#name").val().toLowerCase();
    if(name.length<2&&!isAdmin){
      print(true,"Du måste fylla i ett namn.");
      return;
    }
    if(!validateEmail(email)&&!isAdmin){
      print(true,"Du måste ange din epost.");
      return;
    }
    /*
    if(email.split("@")[1]!=="folkspel.se"){
      print(true,"Du måste ange din folkspels epost.");
      return;
    }
    */
    var inputs = $("#form").find('input[type=checkbox]');
    var selected = [];
    for(var i = 0; i < inputs.length; i++){
      var input = inputs[i];
      if(isAdmin || (input.checked&&!input.disabled)){
        var p = $(input).parent().parent()[0];
        if(isAdmin&&input.dataset.type!='book' || !isAdmin)
          selected.push({category:p.dataset.category,id:p.dataset.id,type:input.dataset.type,checked:input.checked});
      }
    }
    if(selected.length===0){
      print(true,"Du har inte valt några lotter.");
      return;
    }


    $.ajax
    ({
        type: "POST",
        url: '/api/add',
        dataType: 'json',
        data: JSON.stringify({name:name,email:email,selected:selected,bb:isAdmin}),
        contentType: 'application/json',
    }).done(function( json ) {
      if(isAdmin){
        location.reload();
        return;
      }
      load();
      print(false,"Grattis, du har bokat lotter. Glöm inte att betala in annars tas du bort.");
    }).fail(function( jqxhr, textStatus, error ) {
        if(jqxhr.status===401){ // picked already exist
          print(true,"Du har valt lotter som redan är tagna. Försök igen.");
        }
        else if(jqxhr.status===402){ // max limit
          print(true,"Du kan inte köpa fler lotter än maxgränsen.");
        }
        else if(jqxhr.status===403){ // category max limit
          var tout = '';
          switch(jqxhr.responseText){
            case 'red':
              tout = 'Röd';
              break;
            case 'green':
              tout = 'Grön';
              break;
            case 'blue':
              tout = 'Blå';
              break;
          }

          print(true,"Du kan inte köpa fler än maxgränsen utav lotter i serie "+tout+".");
        }
        else if(jqxhr.status===404){ // category max limit
          print(true,"Du kan inte köpa lott "+jqxhr.responseText+" då du redan har köpt den i en annan serie.");
        }
        load();
    });
  });

  var update = function(data){

    for(var i = 0; i < data.length; i++){
      var item = data[i];
      var container = $("#block-"+item.category);
      var children = container.children();
      for(var j = 0; j < children.length; j++) {
        var $currentElement = $(children[j])[0];
        if($currentElement.dataset.id===item.id){
          var input = $($currentElement).find('input');
          if(input.length>0){
            if(!input[0].disabled || isAdmin){
              var name = item.id +": "+item.name;
              if(item.payed)
                name += " <i class='fa fa-gratipay' />";
              if(isAdmin)
                name += "<br />"+item.email+"<br />"+item.date;
              $($($currentElement).find('span')[0]).html(name);
              $($($currentElement).find('span')[0]).css('font-weight', '400');
              $(input[0]).attr('disabled',true);
              $(input[0]).css('display','none');

              if(!isAdmin)
                highlight(input.parent().parent());

              if(isAdmin){
                $(input[2]).attr('checked',item.payed);
              }
            }
          }
          break;
        }
      }
    }
  };

  var load = function(){
    $.getJSON( "/api/list" )
      .done(function( json ) {
        update(json);
      })
      .fail(function( jqxhr, textStatus, error ) {
        print(true,"Kan inte läsa från servern, testa att ladda om sidan.");
    });
  };

  build();

  updateInterval = setInterval(load,10000);
  load();

});
