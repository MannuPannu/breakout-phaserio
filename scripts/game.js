window.onload = function() {
    
    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameArea', 
                    { preload: preload, create: create, render: render, update: update }, false, false);
   
    var cursors, spaceKey;
    var player, ball;
    
    var gems;
    
    var powerUps;
    var powerUpActive = false;
    
    var score = 0;
    var lives = 3;
    var gameRunning = false;
    var gameBeforeStart = true;
    var scoreText;
    var livesText;
    var gameOverText;
    
    //Sounds
    var hitSound;
    var bounceSound;
    var powerUpSound;
    
    //object variables
    var ballXVel;
    var ballYVel
    
    //Particle emitters
    var emitters = [];

    function preload () {
        game.load.image('ball', 'ball.png');
        game.load.image('player', 'player.png');
        
        game.load.image('powerupP', 'powerupP.png');
        
        game.load.image('gem', 'gem2.png'); 
        
        game.load.image('particle', 'particle.png');
        
        game.load.bitmapFont('carrier_command', 'carrier_command.png', 
            'carrier_command.xml');
            
        game.load.audio('bounce', 'bounce.wav');
        game.load.audio('hit', 'hit2.wav');
        game.load.audio('powerup', 'powerup.wav');
    }
    
    function resetGame() {
        powerUps.removeAll();
        gameRunning = false; 
        ball.body.velocity.setTo(0,0);
        gameBeforeStart = true; 

        if(lives === 0){ //Shows game over screen
            score = 0;
            lives = 3;
            gameOverText.visible = true;
        } //Reset game to start pos
        else {
            player.body.x = game.world.centerX;
            player.body.y = game.world.height - 50;                
            startInfoText.visible = true;
        }
        scoreText.text = "score:" + score; 
        livesText.text = "lives:" + lives;
        
        powerUpActive = false;
    }
    
    function startGame() {
        if(gameOverText.visible){
            createGems();
        }
        //Shoot ball up some angle :)
        var angle = Math.random();
        
        ball.body.velocity.setTo(150 * (angle < 0.5 ? -1 : 1), -400);
        startInfoText.visible = false;
        gameOverText.visible = false;

        gameRunning = true;
        gameBeforeStart = false;
    }
    
    function create () {
        
        hitSound = game.add.audio('hit');
        bounceSound = game.add.audio('bounce');
        powerUpSound = game.add.audio('powerup');
        
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        cursors = game.input.keyboard.createCursorKeys();
        spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        scoreText = game.add.bitmapText(10, 10, 'carrier_command','score:' + score,24);
        livesText = game.add.bitmapText(575, 10, 'carrier_command','lives:' + lives,24);
        startInfoText = game.add.bitmapText(100, 250, 'carrier_command','Press space to start',24); 
        gameOverText = game.add.bitmapText(100, 250, 'carrier_command','Game Over. \n\nPress space to start',24);  
        gameOverText.visible = false;

        player = game.add.sprite(game.world.centerX, game.world.height - 50, 'player');
        gems = game.add.group();
        powerUps = game.add.group();
        powerUps.enableBody = true;
        powerUps.physicsBodyType = Phaser.Physics.ARCADE;

        createGems();
        
        ball = game.add.sprite(400, 200, 'ball');
        game.physics.enable([player, ball, gems, powerUps], Phaser.Physics.ARCADE);

        ball.body.collideWorldBounds = true;
        ball.body.bounce.setTo(1, 1);
        
        player.body.collideWorldBounds = true;
        player.enableBody = true;
        player.body.immovable = true;
    }
    
    function render() {
        
    }
    
    function update() {
        if(powerUpActive){
            game.physics.arcade.overlap(ball, gems, collisionHandler);
        }else {
            ball.tint = 0xFFFFFF; 
            game.physics.arcade.collide(ball, gems, collisionHandler);
        }
        
        game.physics.arcade.collide(player, ball, playerBallCollitionHandler);
        game.physics.arcade.collide(player, powerUps, playerPowerUpCollision)
        
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
            lives -= 1;
           resetGame(); 
        }
        
        if(gameBeforeStart){
            ball.x = player.x + player.width /2;
            ball.y = player.y - ball.height - 1;
        }

        //Fade effect for particles explosion
        emitters.forEach(function(e) {
            e.forEach(function(p)
                {
                    p.alpha= p.lifespan / e.lifespan;	
                });
        });
            
        //Play sound when ball hits walls
        if(ball.x <= 1 || (ball.x + ball.width >= game.world.width-1) || ball.y <= 1){
            bounceSound.play();
        }

        //Check if powerups are out of bounds, then destroy them
        powerUps.forEach(p => {
            if(p.y > (game.world.height))
            {
                p.destroy();
            }
        });
    }
    
    function collisionHandler(ball, gem) {
        var emitter = game.add.emitter(0, 0, 150);
        emitter.gravity = 150;
        emitter.makeParticles('particle');
        emitter.x = gem.x + (gem.width / 2);
        emitter.y = gem.y + (gem.height / 2);
        emitter.forEach(p => p.tint = gem.tint);
        emitter.start(true, 1500, null, 10);
        emitters.push(emitter);
        
        setTimeout(function() { 
            emitters = emitters.filter(e => e.name !== emitter.name);
            emitter.destroy(); 
        }, 1500);

        gem.destroy();
        score += 75;
        scoreText.text = "Score:" + score;
        hitSound.play();
        
        var r = Math.random();
       
        if(r < 0.2 && !powerUpActive){ 
            if(powerUps.length < 4){
                var powerUp = powerUps.create(gem.x + 5, gem.y, 'powerupP');
                
                powerUp.body.velocity.y = 100;
            }
        }
    }
    
    function playerBallCollitionHandler(player, ball) {
        bounceSound.play();
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
    
    function playerPowerUpCollision(player, powerUp){
        powerUps.removeAll();
       powerUp.destroy();
       powerUpSound.play();
       score += 266;
       powerUpActive = true;

       ball.tint = 0xff0000;
       
       setTimeout(function(){

         powerUpActive = false;
       }, 5000);
    }
    
    function createGems(){
        
        gems.removeAll(true);
        
        gems.enableBody = true;
        gems.physicsBodyType = Phaser.Physics.ARCADE;

        for (var i = 0; i < 14; i++)
        {
            for(var y = 0; y < 5; y++) {
                var gem = gems.create(120 + i * 41, 50 + (21 * y), 'gem');
                
                var rand = Math.random();
                
                if(rand < 0.2){
                    gem.tint = 0xF0DC07;  
                }else if(rand < 0.4) {
                    gem.tint = 0x71BFD9;
                }
                else if (rand < 0.6){
                    gem.tint = 0xB743DE;
                }
                else if(rand < 0.8){
                    gem.tint = 0xF2300A;
                }
                else {
                    gem.tint = 0xE8E8E8;
                }
                
                gem.body.immovable = true;
            }
        } 
    }
};
