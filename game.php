
<!doctype html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>hello phaser</title>
        <style>
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
        </style>
    </head>
    <body>
        <div class="layer"></div>
        <script src="node_modules/phaser-ce/build/phaser.min.js" type="text/javascript"></script>
        <script src="src/commons.js" type="text/javascript"></script>
        <script>
          var level = JSON.parse('<?=$_POST["gameCode"];?>');
          console.log(level);
        </script>
        <script src="src/game.js" type="text/javascript"></script>
    </body>
</html>
