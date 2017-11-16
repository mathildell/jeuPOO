$(function(){

  // Load available resources in "editor json level"
  // Welcome menu : load / create level
  // Editor

  //load grid
  // for 70 / 70
  var squareGrid = 70;
  function generateGrid(squareGrid){
    var gW = $('#grid').width();
    var gH = $('#grid').height();

<<<<<<< HEAD
    var ratioW = Math.ceil(gW/squareGrid); /*round up*/
    var ratioH = Math.ceil(gH/squareGrid);

    var gridNbr = ratioW * ratioH;

    var i = 1;
    for(i = 1; i < gridNbr; i++){
      if((i-1) % ratioW === 0){
        $('#grid').append('<div class="row"></div>');
      }
      $('#grid .row:last').append('<div style="width:'+squareGrid+'px;height:'+squareGrid+'px;"></div>');
    }
  }

  generateGrid(squareGrid);
  $(window).resize(function(){
    generateGrid(squareGrid);
  });





  $("#toggle_aside").click(function(){
    if($(this).parent().hasClass('closed')){
      $(this).text("close").parent().removeClass('closed');
    }else{
      $(this).text("open").parent().addClass('closed');
    }
  });

  $('#toggle_sound').click(function(){
    if($('span', this).hasClass('ion-ios-volume-high')){
      $('span', this).attr({'class' : 'ion-ios-volume-low'});
    }else{
      $('span', this).attr({'class' : 'ion-ios-volume-high'});
    }
  });
  $('#export').click(function(){
  });

  $('.toggle_section').click(function(){

    if($(this).parent().hasClass('open')){
      $(this).parent().removeClass('open');

      $('.toggle_section').not($(this)).parent().fadeIn(300);

    }else{
      if($('section.open').length){
        $('section.open').removeClass('open');
      }
      $(this).parent().addClass('open');

      $('.toggle_section').not($(this)).parent().hide(0);
    }
  });


});


