window.onload = function() {
    
    var game = new Phaser.Game(800, 600, Phaser.AUTO, '', 
                    { preload: preload, create: create, render: render, update: update });
   
    var cursors, spaceKey;
    var player, ball;
    
    var gems;
    
    var score = 0;
    var scoreText;

    function preload () {
        game.load.image('ball', 'ball.png');
        game.load.image('player', 'player.png');
        
        game.load.image('gem', 'gem2.png');
        
        game.load.bitmapFont('carrier_command', 'carrier_command.png', 
            'carrier_command.xml');
            
        game.load.audio('hit', 'blip.wav');
    }
    
    function restartGame() {
        player.body.x = game.world.centerX;
        player.body.y = game.world.height - 50;                
        
        ball.body.x = 400;
        ball.body.y = 200;
        startInfoText.visible = true;
        ball.body.velocity.setTo(0,0);
        createGems();
        score = 0;
        scoreText.text = "score:" + score; 
       }
    
    function createGems(){
        console.log(gems.length);
        
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
    
    function startGame() {
        ball.body.x = 400;
        ball.body.y = 200;
        ball.body.velocity.setTo(250, -250);
        startInfoText.visible = false;
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
        
        game.physics.arcade.collide(player, ball);
        game.physics.arcade.collide(ball, gems, collisionHandler);

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -500;
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 500;
        }
        else if(spaceKey.isDown){
            console.log("True");
            startGame();
        } 
        else
        {
            player.body.velocity.setTo(0, 0);
        }

        //Check if player misses the ball
        if(ball.body.y > game.world.height - 20){
           restartGame(); 
        }
    }
    
    function collisionHandler(ball, gem) {
        gem.destroy();
        score += 1;
        scoreText.text = "Score:" + score;
        fx.play();
    }
};
