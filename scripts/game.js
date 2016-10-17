window.onload = function() {
    
    var game = new Phaser.Game(800, 600, Phaser.AUTO, '', 
                    { preload: preload, create: create, render: render, update: update });
   
    var cursors, spaceKey;
    var player, ball;
    
    var gems;
    
    var score = 0;
    var gameRunning = false;
    var gameBeforeStart = true;
    var scoreText;

    function preload () {
        game.load.image('ball', 'ball.png');
        game.load.image('player', 'player.png');
        
        game.load.image('gem', 'gem2.png');
        
        game.load.bitmapFont('carrier_command', 'carrier_command.png', 
            'carrier_command.xml');
            
        game.load.audio('hit', 'blip.wav');
    }
    
    function resetGame() {
        player.body.x = game.world.centerX;
        player.body.y = game.world.height - 50;                
        
        startInfoText.visible = true;
        ball.body.velocity.setTo(0,0);
       
        gameBeforeStart = true; 
        
        createGems();
        score = 0;
        scoreText.text = "score:" + score; 
        gameRunning = false;
    }
    
    function startGame() {
        //Shoot ball up some angle :)
        var angle = Math.random();
        
        ball.body.velocity.setTo(150 * (angle < 0.5 ? -1 : 1), -400);
        startInfoText.visible = false;
        
        gameRunning = true;
        gameBeforeStart = false;
    }

    function create () {
        
        fx = game.add.audio('hit');
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        cursors = game.input.keyboard.createCursorKeys();
        spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        scoreText = game.add.bitmapText(10, 10, 'carrier_command','score:' + score,24);
        startInfoText = game.add.bitmapText(100, 250, 'carrier_command','Press space to start',24); 

        player = game.add.sprite(game.world.centerX, game.world.height - 50, 'player');
        gems = game.add.group();
        createGems();
        
        ball = game.add.sprite(400, 200, 'ball');
        game.physics.enable([player, ball, gems], Phaser.Physics.ARCADE);

        ball.body.collideWorldBounds = true;
        ball.body.bounce.setTo(1, 1);
        
        player.body.collideWorldBounds = true;
        player.enableBody = true;
        player.body.immovable = true;
    }
    
    function render() {
        
    }
    
    function update() {
        game.physics.arcade.collide(player, ball, playerBallCollitionHandler);
        game.physics.arcade.collide(ball, gems, collisionHandler);
        
        var playerSpeed = 400;

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -playerSpeed;
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = playerSpeed;
        }
        else if(spaceKey.isDown && !gameRunning){
            startGame();
        } 
        else
        {
            var breakFactor = 50;
            
            if(player.body.velocity.x > 0){
                player.body.velocity.x -= breakFactor;
            }

            if(player.body.velocity.x < 0){
                player.body.velocity.x += breakFactor;
            }
        }

        //Check if player misses the ball
        if(ball.body.y > game.world.height - 20){
           resetGame(); 
        }
        
        if(gameBeforeStart){
            ball.x = player.x + player.width /2;
            ball.y = player.y - ball.height - 1;
        }
    }
    
    function collisionHandler(ball, gem) {
        gem.destroy();
        score += 1;
        scoreText.text = "Score:" + score;
        fx.play();
    }
    
    function playerBallCollitionHandler(player, ball) {

      //Get ball x pos relative player x pos 
      var ballXRelPlayerX = ball.x - player.x;
      
      if(ballXRelPlayerX < 0){
          ballXRelPlayerX = 0;
      }
      
      //Calculate where on players horizontal axis the ball hit
      var hitXOnPlayer = (ballXRelPlayerX / player.width) * 10;

        if(hitXOnPlayer < 1){
           ball.body.velocity.x -= 120;
        }

        if(hitXOnPlayer < 2 && hitXOnPlayer >= 1){
           ball.body.velocity.x -= 100;
        }
        else if(hitXOnPlayer >= 2 && hitXOnPlayer < 4){
           ball.body.velocity.x -= 50;
        } 
        else if(hitXOnPlayer > 6 && hitXOnPlayer <= 8){
           ball.body.velocity.x += 50;
        } 
        else if(hitXOnPlayer > 8){
           ball.body.velocity.x += 120;
        } 
        
        //if ball goes straight up push it a little to the left or right to spice things up a little :)
        if(Math.floor(Math.abs(ball.body.velocity.x)) === 0 ){
            var toss = Math.random();
            ball.body.velocity.x += 40 * ((toss < 0.5) ? -1 : 1);
        }
    }
    
    function createGems(){
        
        gems.removeAll(true);
        
        gems.enableBody = true;
        gems.physicsBodyType = Phaser.Physics.ARCADE;

        for (var i = 0; i < 14; i++)
        {
            for(var y = 0; y < 5; y++) {
                var gem = gems.create(120 + i * 41, 50 + (21 * y), 'gem');
                gem.tint = 0xF0DC07;  
                gem.body.immovable = true;
            }
        } 
    }
};
