
<!doctype html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>hello phaser</title>

      <link rel="stylesheet" href="http://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
        <style>
          a{
            color: #000;
            text-decoration: none;
          }
          body{
            margin:0px;
                padding-top: 60px;
            overflow-x: hidden;
          }
          body, input, button{
            font: 12px/1.3 'Arial', serif;
          }
          .layer{
            position: fixed;
            z-index: -1;
            top:0px;
            left:0px;
            width: 100%;
            height: 100%;
            background: #fff url('assets/wallpaper.jpg');
            background-size: 500px 500px;
            opacity: 0.4;
          }
          nav{
            position: fixed;
            background-color: #fff;
            width: 100%;
            top: 0px;
            left: 0px;
            z-index: 1;
          }
          nav ul{
            list-style-type: none;
            display: flex;
            margin:0;
          }
          nav li{
            line-height: 40px;
            text-align: center;
            max-width: 40px;
            max-height: 40px;
            overflow: hidden;
            transition-duration: 0.3s;
            white-space: nowrap;
            border:1px solid #eee;
            border-radius: 2px;
            margin:10px 20px 10px 0;
            padding-right: 10px;
            box-sizing:border-box;
          }
          nav li:hover{
            max-width: 150px;
          }
          nav li span,
          nav li a{
            display: inline-block;
            vertical-align: middle;
            width: 40px;
            font-size: 25px;
          }
          #toggle_sound span{
            font-size: 40px;
          }
        </style>

    </head>
    <body>
      <audio id="music_player" style="display: none;"  loop>
        <source src="assets/music/music.mp3" type="audio/ogg">
        Your browser does not support the audio element.
      </audio>

          <nav>
              <ul>
                  <li>
                      <a href="index.html" class="ion-android-home"></a>
                      Home screen
                  </li>
                  <li id="toggle_sound">
                      <span class="ion-ios-volume-low"></span> 
                      Music on/off 
                  </li>
              </ul>
          </nav>
        <div class="layer"></div>
        <script src="node_modules/phaser-ce/build/phaser.min.js" type="text/javascript"></script>
        <script src="src/commons.js" type="text/javascript"></script>
        <script>
          var level = JSON.parse('<?=$_POST["gameCode"];?>');
        </script>
        <script src="src/game.js" type="text/javascript"></script>
        <script src="node_modules/jquery/dist/jquery.min.js" type="text/javascript"></script>
        <script>
          $(function(){

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
      });
    </script>
    </body>
</html>
