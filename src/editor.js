$(function(){

  // Load available resources in "editor json level"
  // Welcome menu : load / create level
  // Editor


  var squareGrid = parseInt($('#gridSizeNum').val());
  var gW = parseInt($('#gridCols').val());
  var gH = parseInt($('#gridRows').val());

  var game = new Phaser.Game((gW*squareGrid), (gH*squareGrid), Phaser.AUTO, 'phaser', { preload: preload, create: create }, true);


function preload() {

    //game.load.image('grid', 'assets/debug-grid-1920x1920.png');

    game.load.image('bricks', 'assets/bricks.png');
    game.load.image('lava', 'assets/lava.png');


}
function create(){

}

function generateGrid(squareGrid, gW, gH){
  var i, o;
  for(i = 0; i < gH; i++){
    $('#grid').append('<div class="row"></div>');
    for(o = 0; o < gW; o++){
      $('#grid .row:last').append('<div style="width:'+squareGrid+'px;height:'+squareGrid+'px;"></div>');
    }
  }
}

generateGrid(squareGrid, gW, gH);

$('#gridCols, #gridRows, #gridSizeNum').change(function(){
  var squareGrid = parseInt($('#gridSizeNum').val());
  var gW = parseInt($('#gridCols').val());
  var gH = parseInt($('#gridRows').val());
  $('#grid').html("");

  game.scale.setGameSize((gW*squareGrid), (gH*squareGrid));
  generateGrid(squareGrid, gW, gH);
});


var a = 0, bricks = [];
$('#add_more_bricks').click(function(e){
  e.preventDefault();

  this['brick' + a] = game.add.sprite(128, 128, 'bricks');
  this['brick' + a].inputEnabled = true;
  this['brick' + a].input.enableDrag();
  this['brick' + a].input.enableSnap(64, 64, true, true);
  this['brick' + a].events.onDragStop.add(onDragStop, this);
  this['brick' + a].objId = a;

  bricks.push( {'obj': this['brick' + a], 'pos': {'x': 128, 'y': 128 } } );
  a++;
});
$('#add_more_lava').click(function(e){
  e.preventDefault();

  this['lava' + a] = game.add.sprite(128, 128, 'lava');
  this['lava' + a].scale.setTo(0.5,0.5);
  this['lava' + a].inputEnabled = true;
  this['lava' + a].input.enableDrag();
  this['lava' + a].input.enableSnap(64, 64, true, true);
  this['lava' + a].events.onDragStop.add(onDragStop, this);
  this['lava' + a].objId = a;

  bricks.push( {'obj': this['lava' + a], 'pos': {'x': 128, 'y': 128 } } );
  a++;
});

function onDragStop(sprite, pointer) {
    bricks[sprite.objId].pos = { 'x': bricks[sprite.objId].obj.position.x, 'y': bricks[sprite.objId].obj.position.y };
    console.log(bricks[sprite.objId].pos);
}


$('#toggle_sound').click(function(e){
  e.preventDefault();
  var musicPlayer = document.getElementById('music_player');
  if($('#toggle_sound').hasClass('off')){
   musicPlayer.play();
   $('#toggle_sound').removeClass('off');
  }else{
    musicPlayer.pause()
    $('#toggle_sound').addClass('off');
  }
});

  //load grid
  // for 70 / 70
  

  $(window).resize(function(){
    //generateGrid(squareGrid);
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


