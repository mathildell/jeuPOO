$(function(){

  var squareGrid = parseInt($('#gridSizeNum').val());
  var gW = parseInt($('#gridCols').val());
  var gH = parseInt($('#gridRows').val());

  var game = new Phaser.Game((gW*squareGrid), (gH*squareGrid), Phaser.AUTO, 'phaser', { preload: preload, create: create }, true);

  var AnimModel = new AnimationModel();

function preload() {

    //game.load.image('grid', 'assets/debug-grid-1920x1920.png');

    game.load.image('bricks', 'assets/bricks.png');
    game.load.image('lava', 'assets/lava.png');
    game.load.image('bricks2', 'assets/bricks2.png');
    game.load.image('bricks3', 'assets/bricks3.png');


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
  squareGrid = parseInt($('#gridSizeNum').val());
  gW = parseInt($('#gridCols').val());
  gH = parseInt($('#gridRows').val());
  $('#grid').html("");
  console.log(squareGrid);

  game.scale.setGameSize((gW*squareGrid), (gH*squareGrid));
  generateGrid(squareGrid, gW, gH);
  $.each(bricks, function(index, brick){
    //ratio = (squareGrid / brick.width) ;
    //brick.scale.setTo(ratio,ratio);
    brick.width = squareGrid;
    brick.height = squareGrid;
    brick.input.enableSnap(squareGrid, squareGrid, true, true);
  });
});


var a = 0, bricks = [], ratio = 0;
function addBrick($this, img){
  $this.inputEnabled = true;
  $this.input.enableDrag();
  $this.input.enableSnap(squareGrid, squareGrid, true, true);
  $this.events.onDragStop.add(onDragStop, this);
  $this.events.onInputDown.add(tapHandler, this);
  if(squareGrid !== $this.width){
    $this.width = squareGrid;
    $this.height = $this.width;
  }
  $this.objId = a;
  $this.fileName = img;

  bricks.push( $this );
  a++;
}
$('#add_more_bricks').click(function(e){
  e.preventDefault();
  this['brick' + a] = game.add.sprite(0, 0, 'bricks');
  this['brick' + a].hasBody = parseInt($(this).parent().find('select').val());
  addBrick(this['brick' + a], "brick");
});


$('#add_more_mario').click(function(e){
  e.preventDefault();
  this['bricks2' + a] = game.add.sprite(0, 0, 'bricks2');
  this['bricks2' + a].hasBody = parseInt($(this).parent().find('select').val());
  addBrick(this['bricks2' + a], "bricks2");
});
$('#add_more_mario2').click(function(e){
  e.preventDefault();
  this['bricks3' + a] = game.add.sprite(0, 0, 'bricks3');
  this['bricks3' + a].hasBody = parseInt($(this).parent().find('select').val());
  addBrick(this['bricks3' + a], "bricks3");
});


$('#add_more_lava').click(function(e){
  e.preventDefault();

  this['lava' + a] = game.add.sprite(0, 0, 'lava');
  this['lava' + a].hasBody = parseInt($(this).parent().find('select').val());

  addBrick(this['lava' + a], "lava");
});

function onDragStop(sprite, pointer) { 
    $.each(bricks, function(index, value) {

      if(
          value.objId !== sprite.objId
          && value.position.x === sprite.position.x 
          && value.position.y === sprite.position.y
        ){

          var indexOf = bricks.indexOf(value);
          bricks.splice(indexOf, 1);
          value.kill();
          return false;
      }
    }); 
}

var tapHandler = function(sprite, pointer) {
 if (pointer.msSinceLastClick < game.input.doubleTapRate) {
    bricks.splice(sprite.objId, 1);
    sprite.kill();
  }
};

$('#toggle_sound').click(function(e){
  e.preventDefault();
  var musicPlayer = document.getElementById('music_player');

  if($('span', this).hasClass('ion-ios-volume-high')){
    $('span', this).attr({'class' : 'ion-ios-volume-low'});
    musicPlayer.pause();
  }else{
    $('span', this).attr({'class' : 'ion-ios-volume-high'});musicPlayer.play();
  }

});

  //load grid
  // for 70 / 70
  $('#addEntity').click(function(e){
    e.preventDefault();

    var curr = $('.entityForm').attr('id').match(/\d+/)[0], next = parseInt(curr) + 1;

    $('.entityList ul').append('<li data-entity="'+curr+'" data-name="'+$('#entityName').val()+'" data-tag="'+$('#entityTag').val()+'" data-imagename="'+$('#entityImageName').val()+'" data-animationname="'+$('#entityAnimationName').val()+'" data-actionname="'+$('#entityActionName').val()+'" data-pv="'+$('#entityPV').val()+'" data-isanimated="'+$('#entityIsAnimated').val()+'" data-isdestructible="'+$('#entityIsDestructible').val()+'" data-width="'+$('#entityWidth').val()+'" data-height="'+$('#entityHeight').val()+'" data-bounciness="'+$('#entityBounciness').val()+'" data-hasgravity="'+$('#entityHasGravity').val()+'" data-collisiontype="'+$('#entityCollisionType').val()+'" data-collisiondamages="'+$('#entityCollisionDamages').val()+'" data-collisiontags="'+$('#entityCollisionTags').val()+'"><i>'+$('.entityForm #entityName').val()+'</i> <span class="ion-trash-a" id="deleteEdit'+curr+'"></span></li>');

    $('.entityForm').attr({'id':next});

    $.each($('.entityForm input'), function(){
      $(this).val("");
    });

  });

  $(".entityList").on("click", "li [id^=deleteEdit]", function(){

    $(this).parent().remove();

  });

   $('#addAction').click(function(e){
    e.preventDefault();

    var curr = $('.actionsForm').attr('id').match(/\d+/)[0], next = parseInt(curr) + 1;

    $('.actionsList ul').append('<li data-entity="'+curr+'" data-name="'+$('#actionName').val()+'" data-type="'+$('#actionType').val()+'" data-key="'+$('#actionKey').val()+'" data-whilefalling="'+$('#whileFalling').val()+'" data-locked="'+$('#actionLocked').val()+'" data-cooldown="'+$('#actionCoolDown').val()+'" data-moveshiftx="'+$('#moveShiftX').val()+'" data-moveshifty="'+$('#moveShiftY').val()+'" data-movespeedx="'+$('#moveSpeedX').val()+'" data-movespeedy="'+$('#moveSpeedY').val()+'"><i>'+$('#actionName').val()+'</i> <span class="ion-trash-a" id="deleteEdit'+curr+'"></span></li>');

    $('.actionsForm').attr({'id':next});

    $.each($('.actionsForm input'), function(){
      $(this).val("");
    });

  });

  $(".actionsList").on("click", "li [id^=deleteEdit]", function(){

    $(this).parent().remove();

  });

  // $(".entityList").on("click", "li [id^=entityEdit]", function(){

  //   $('.newEditForm').text('Edit ' +$(this).parent().find('i').text());
  //   $('.newForm, #addEntity').hide();
  //   $('#editEntity').show();
  //   $('.entityForm').attr({'id': $(this).parent().data('entity') });
  //   var currLi = $(this).parent(), spe;

  //   $.each($('.entityForm input[id]'), function(){
  //     spe = $(this).attr('id').toLowerCase().replace('entity','');
  //     //console.log(spe, $(currLi).data(spe) );
  //     $(this).val($(currLi).data(spe));
  //   });

  // });

  // $('#editEntity').click(function(){

  //   $('.newEditForm').text('New');
  //   $('.newForm, #addEntity').show();
  //   $('#editEntity').hide();

  //   var last = parseInt($(".entityList li:last-child").data("entity")) + 1, curr = $('.entityForm').attr('id').match(/\d+/)[0];

  //   var spe;
  //   $.each($('.entityForm input[id]'), function(){
  //     spe = 'data-'+$(this).attr('id').toLowerCase().replace('entity','');
  //     console.log($('.entityList ul li[data-entity='+curr+']').attr(spe));
  //     $('.entityList ul li[data-entity='+curr+']').attr({ spe : $(this).val() });
  //   });

  //   $('.entityForm').attr({'id':last});

  //   $.each($('.entityForm input'), function(){
  //     $(this).val("");
  //   });

  // });



  $("#toggle_aside").click(function(){
    if($(this).parent().hasClass('closed')){
      $(this).text("close").parent().removeClass('closed');
    }else{
      $(this).text("open").parent().addClass('closed');
    }
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


  $('#export').click(function(){

    var exportFile = {
            ressources: {
              animations: [],
              actions: [],
              entities: []
            }, 
            scene: {
                grid: {
                    size: squareGrid,
                    width: gW,
                    height: gH,
                    decor: []
                },
                entities: []
            },
            settings: {
                name: $('#levelName').val(),
                gravity: parseInt($('#gravityFall').val())
            }
        };

        $.each(bricks, function(index, brick){
          exportFile.scene.grid.decor.push(new DecorScene(brick.position, brick.key, brick.hasBody));

        });


        $(".entityList li").each(function(index, obj){
           this['list' + index] = new EntityModel($(obj).data('name'));
           entityModelFormat(this['list' + index], obj);
           exportFile.ressources.entities.push(this['list' + index]);
        });

        $(".actionsList li").each(function(index, obj){
           this['action' + index] = new ActionModel($(obj).data('name'));
           actionModelFormat(this['action' + index], obj);
           exportFile.ressources.actions.push(this['action' + index]);
        });

      //  actionModelRect = new ActionModel($('#actionName').val());
      //  actionModelFormat(actionModelRect)
      // exportFile.ressources.actions.push(actionModelRect);
   

        console.log(exportFile);
        $('pre').show().html(JSON.stringify(exportFile));



  });
  function actionModelFormat($this, list){
    $this.type = $(list).data('type');
    $this.key = $(list).data('key');
    $this.whileFalling = !!+$(list).data('whilefalling');
    $this.locked = !!+$(list).data('locked');
    $this.cooldown = $(list).data('cooldown');

    // Move data
    $this.shift = {x: parseInt($(list).data('moveshiftx')), y: parseInt($(list).data('moveshifty'))};
    $this.speed = {x: parseInt($(list).data('movespeedx')), y: parseInt($(list).data('movespeedy'))};
  }
  function entityModelFormat($this, list){
    $this.tag = $(list).data('tag');
    $this.imageName = $(list).data('imagename');
    $this.animationNames = $(list).data('animationname');
    $this.actionNames = $(list).data('actionname');
    $this.PVMax = $(list).data('pv');
    $this.isAnimated = !!+$(list).data('isanimated');
    $this.isDestructible = !!+$(list).data('isdestructible');
    $this.width = $(list).data('width');
    $this.height = $(list).data('height');
    $this.bounciness = $(list).data('bounciness');
    $this.hasGravity = !!+$(list).data('hasgravity');
    $this.collisionType = $(list).data('collisiontype');
    $this.collisionDamages = $(list).data('collisiondamages');
    $this.collisionTags = $(list).data('collisiontags');
  }
});


