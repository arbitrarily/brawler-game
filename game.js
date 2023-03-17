    let mario;
    let bottomFrontImg;
    let bgImg;
    let winImg;
    let lossImg;
    let bgX = 0;
    let bgY = 0;
    let playerDmg = 5;
    let npcDmg = 2.5;
    let npc;
    let marioHealthMeter;
    let npcHealthMeter;
    let arrows = [];
    let marioArrows = [];
    let npcArrows = [];
    let gameOver = false;
    let bowSound;
    let bowHitSound;
    let winSound;
    let damageTakenSound;
    let deadSound;
    let song;
    let myFont;
    let winner = false;

    function preload() {
      bgImg = loadImage(`background-${Math.floor(Math.random() * 3) + 1}.png`);
      myFont = loadFont('font.ttf');
      bottomFrontImg = loadImage('foreground.png');
      winImg = loadImage('win.png');
      lossImg = loadImage('loss.png');
      bowSound = loadSound('arrow.mp3');
      bowHitSound = loadSound('bowHit.mp3');
      deadSound = loadSound('dead.mp3');
      winSound = loadSound('victory.mp3');
      damageTakenSound = loadSound('damageTaken.mp3');
      song = loadSound('song.mp3');
    }

    function setup() {
      createCanvas(1024, 640);
      start(); // call the restart function
    }

    function start() {
      mario = new Mario();
      npc = new NPC();
      marioHealthMeter = new HealthMeter(mario, 20); // Create Mario's health meter object
      npcHealthMeter = new HealthMeter(npc, 40); // Create NPC's health meter object
      // colorMode(HSB, 360, 100, 100, 1);
      textFont(myFont);
      textSize(96);
      bowSound.setVolume(0.2);
      bowHitSound.setVolume(0.2);
      deadSound.setVolume(0.15);
      winSound.setVolume(0.5);
      damageTakenSound.setVolume(0.15);
      song.setVolume(0.1);
      song.jump(60);
      song.play();
    }

    function draw() {

      if (gameOver && winner === 'Mario') {
        image(winImg, 0, 0, width, height);
        fill(255, 255, 255);
        textAlign(CENTER);
        text("YOU WON", width / 2, height / 2);
      } else if (gameOver && winner === 'NPC') {
        background(0);
        image(lossImg, 0, 0, width, height);
        fill(255, 0, 0);
        textAlign(CENTER);
        text("YOU DIED", width / 2, height / 2);
      } else {

        // Calculate parallax based on Mario's position and velocity
        bgX = -mario.x / 4;
        bgY = -(mario.y / 4) + (height / 4) - (mario.velocity / 8);

        // Draw repeating background with parallax
        for (let i = 0; i < 2; i++) { // Draw two instances of the background
          image(bgImg, bgX + i * bgImg.width, bgY, bgImg.width, height);
        }

        // Update and show health meters
        marioHealthMeter.update();
        npcHealthMeter.update();
        marioHealthMeter.show();
        npcHealthMeter.show();

        // Update and show Mario
        mario.update();
        mario.show();

        // Update and show NPC
        npc.update();
        npc.show();

        // Update and show arrows
        for (let i = arrows.length - 1; i >= 0; i--) {
          let arrow = arrows[i];
          arrow.update();
          arrow.show();
          if (arrow.offscreen()) {
            arrows.splice(i, 1);
          } else if (arrow.source === "mario" && arrow.hits(npc)) {
            npc.takeDamage(npcDmg);
            npcArrows.push(arrows.splice(i, 1)[0]);
          } else if (arrow.source === "npc" && arrow.hits(mario)) {
            mario.takeDamage(playerDmg);
            marioArrows.push(arrows.splice(i, 1)[0]);
          } else {
            // If the arrow hasn't hit anything, keep it in the main arrows array
            arrows[i] = arrow;
          }
        }
        image(bottomFrontImg, -mario.x * 0.5, height - mario.y * 0.25, bottomFrontImg.width * 1.5, bottomFrontImg.height);
      }
    }

    class Mario {
      constructor() {
        this.x = 50;
        this.y = height - height / 6;
        this.gravity = 1;
        this.lift = -20;
        this.velocity = 0;
        this.speed = 6;
        this.img = loadImage('char.png');
        this.jumps = 0;
        this.direction = 1;
        this.health = 100;
        this.healthMeter = new HealthMeter(this, 20); // Pass in yOffset of 40
        this.arrows = []; // Array to hold arrows fired by Mario
        this.lastShot = 0;
        this.shotInterval = 500;
      }

      update() {
        // Apply gravity
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Stop Mario from falling through the floor
        if (this.y > height - height / 6) {
          this.y = height - height / 6;
          this.velocity = 10;
          this.jumps = 0; // Reset number of jumps when landing
        }

        // Prevent Mario from going off the left or right edge of the screen
        if (this.x < 10) {
          this.x = 10;
        }
        if (this.x > width - 60) {
          this.x = width - 60;
        }

        // Move Mario left or right based on keyboard input
        if (keyIsDown(LEFT_ARROW)) {
          this.x -= this.speed;
          this.direction = -1; // Set direction to left
        }
        if (keyIsDown(RIGHT_ARROW)) {
          this.x += this.speed;
          this.direction = 1; // Set direction to right
        }

        // Fire arrow if spacebar is pressed
        if (keyIsDown(32)) {
          this.fireArrow();
        }

        // Update arrows fired by Mario
        for (let i = this.arrows.length - 1; i >= 0; i--) {
          this.arrows[i].update();
          this.arrows[i].show();
          if (this.arrows[i].offscreen()) {
            this.arrows.splice(i, 1);
          } else if (arrow.source === "mario" && arrow.hits(npc)) {
            npc.takeDamage(npcDmg);
            npcHealthMeter.update(npc.health); // Update NPC's health meter
            marioArrows.push(arrows.splice(i, 1)[0]);
          }
        }

        // Check if Mario can fire another arrow
        let now = millis();
        if (now - this.lastShot > this.shotInterval) {
          this.canShoot = true;
        } else {
          this.canShoot = false;
        }

        // Check for collision with arrows fired by NPC
        for (let i = npc.arrows.length - 1; i >= 0; i--) {
          if (npc.arrows[i].hits(this)) {
            this.takeDamage(playerDmg);
            npc.arrows.splice(i, 1);
          }
        }

        // Update health meter
        this.healthMeter.update(this.health);
      }

      show() {
        push();
        translate(this.x + 25, this.y + 25); // Center image
        scale(this.direction, 1); // Reverse image horizontally if direction is left
        image(this.img, -25, -25, 50, 50);
        pop();

        // Draw health meter
        this.healthMeter.show();
      }

      jump() {
        if (this.jumps < 2) { // Allow up to two jumps
          this.velocity += this.lift;
          this.jumps++;
        }
      }

      fireArrow() {
        if (this.canShoot) {
          if (this.arrows.length < 2) { // Limit of 3 arrows on screen at once
            bowSound.play();
            arrows.push(new Arrow(this.x + 20, this.y - 5, createVector(npc.x, npc.y), 'mario'));
            this.lastShot = millis();
          }
        }
      }

      takeDamage(damage) {
        this.health -= this.health * (damage / 100);
      }
    }

    class NPC {
      constructor() {
        this.x = width - random(50, 200);
        this.y = height - height / 6;
        this.img = loadImage('npc2.png');
        this.lastShot = 0;
        this.shotInterval = 0;
        this.lastMovement = random(250, 1500);
        this.movementInterval = random(250, 1500);
        this.health = 100;
        this.healthMeter = new HealthMeter(this, 40); // Pass in yOffset of 40
        this.arrows = []; // Array to hold NPC's arrows
        this.lerpAmt = 0.005; // Set the amount to interpolate by
        this.jumpInterval = 500; // Set jump interval to 500ms
        this.jumpTimer = 0; // Initialize jump timer
        this.direction = 1;
      }

      update() {
        // Shoot arrows at Mario
        let now = millis();
        if (now - this.lastShot > this.shotInterval) {
          this.shotInterval = random(250, 1500); // Random shot interval
          this.fireArrow();
        }

        this.x = lerp(this.x, mario.x, this.lerpAmt);
        this.y = lerp(this.y, mario.y, this.lerpAmt);

        if (now - this.lastMovement > this.movementInterval) {
          // Interpolate between current position and target position
          this.movementInterval = random(250, 1500); // Random shot interval
          this.lastMovement = now;
          // Move NPC randomly
        }

        // Prevent NPC from going off the left or right edge of the screen
        if (this.x < 10) {
          this.x = 10;
        }
        if (this.x > width - 60) {
          this.x = width - 60;
        }

        // Prevent NPC from going off the top or bottom edge of the screen
        if (this.y < 100) {
          this.y = 100;
        }
        if (this.y > height - height / 6) {
          this.y = height - height / 6;
        }

        if (mario.x > npc.x) {
          this.direction = -1;
        } else {
          this.direction = 1;
        }

        // Update arrows fired by NPC
        for (let i = this.arrows.length - 1; i >= 0; i--) {
          this.arrows[i].update();
          this.arrows[i].show();
          if (this.arrows[i].offscreen()) {
            this.arrows.splice(i, 1);
          } else if (this.arrows[i].hits(mario)) {
            mario.takeDamage(playerDmg);
            this.arrows.splice(i, 1);
          }
        }

        // Check for collision with arrows fired by Mario
        for (let i = mario.arrows.length - 1; i >= 0; i--) {
          if (mario.arrows[i].hits(this)) {
            this.takeDamage(playerDmg); // Remove 5% of total NPC HP
            mario.arrows.splice(i, 1);
          }
        }

        // Update health meter
        this.healthMeter.update(this.health);
      }

      show() {
        push();
        translate(this.x + 25, this.y + 25); // Center image
        scale(this.direction, 1); // Reverse image horizontally if direction is left
        // image(this.img, -25, -25, 50, 50);
        image(this.img, -50, -50, 100, 100);
        pop();
        // Show health meter
        this.healthMeter.show();

        // Show NPC's arrows
        for (let i = 0; i < this.arrows.length; i++) {
          this.arrows[i].show();
        }
      }

      setTargetPosition() {
        // Set new target position for NPC
        this.targetX = random(10, width - 60);
        this.targetY = random(10, height - height / 6);
      }

      fireArrow() {
        if (this.arrows.length < 3) { // Limit of 3 arrows on screen at once
          this.arrows.push(new Arrow(this.x, this.y, createVector(mario.x, mario.y), 'npc'));
          this.lastShot = millis();
        }
      }

      jump() {
        this.velocity = -50;
        this.jumpTimer = 0;
      }

      takeDamage(damage) {
        this.health -= this.health * (damage / 100);
      }
    }

    class HealthMeter {
      constructor(character, yOffset) {
        this.character = character;
        this.yOffset = yOffset;
        this.width = 60;
        this.height = 6;
        this.maxHealth = 100;
      }

      update(health) {
        this.health = health;
      }

      show() {
        // Calculate color based on health percentage
        let healthPercentage = this.health / this.maxHealth;
        let barColor = color(255, 0, 0); // Red by default
        if (healthPercentage > 0) {
          if (healthPercentage >= 0.3) {
            barColor = color(255, 165, 0); // Orange
          }
          if (healthPercentage >= 0.7) {
            barColor = color(0, 255, 0); // Green
          }

          // Calculate position of health bar
          let xPos = this.character.x - 5;
          let yPos = this.character.y - this.yOffset;

          // Draw health bar background
          noStroke();
          fill(255);
          rect(xPos, yPos, this.width, this.height);

          // Draw health bar foreground
          noStroke();
          fill(barColor);
          rect(xPos, yPos, this.width * healthPercentage, this.height);
        }
      }
    }


    class Arrow {
      constructor(x, y, target, source) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.sub(target, this.pos).setMag(10);
        this.color = color(255, 255, 255);
        this.width = 50;
        this.height = 1.25;
        this.path = [];
        this.pathColor = color(0, 0, 0, 100);
        this.pathFadeTime = 225;
        this.pathStartTime = millis();
        this.source = source;
      }

      update() {
        this.pos.add(this.vel);
        this.path.unshift(this.pos.copy()); // Add current position to beginning of path

        if (this.source === "mario") {

        } else if (this.source === "npc") {
          this.color = color(255, 0, 0);
          this.height = 5.25;
          this.width = 75;
        }
      }

      show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading() + HALF_PI); // Rotate arrow to face its direction of travel
        noStroke();
        rotate(HALF_PI);
        fill(this.color);
        triangle(-this.width / 2, -this.height / 2, this.width / 2, 0, -this.width / 2, this.height / 2);
        pop();

        // Draw path
        let now = millis();
        for (let i = this.path.length - 1; i > 0; i--) {
          let timeElapsed = now - this.pathStartTime;
          if (timeElapsed > this.pathFadeTime) {
            this.path.splice(i, 1); // Remove point if it has faded out completely
            continue;
          }
          let alpha = map(timeElapsed, 0, this.pathFadeTime, 100, 0); // Fade out alpha over time
          let pathPos = this.path[i];
          this.pathColor = color(0, 0, 0, alpha); // Set alpha of path color
          stroke(this.pathColor);
          strokeWeight(2);
          point(pathPos.x, pathPos.y);
        }
      }

      hits(target) {
        if (target instanceof NPC || target instanceof Mario) {
          let targetLeft = target.x - 25;
          let targetRight = target.x + 25;
          let targetTop = target.y - 25;
          let targetBottom = target.y + 25;
          if (this.pos.x > targetLeft && this.pos.x < targetRight &&
            this.pos.y > targetTop && this.pos.y < targetBottom) {
            if (this.source === "mario") {
              npc.takeDamage(npcDmg); // Remove 2.5% of total HP
              npcHealthMeter.update(npc.health); // Update NPC's health meter
              npcArrows.push(this);
              bowHitSound.play();
            } else if (this.source === "npc") {
              mario.takeDamage(playerDmg); // Remove 5% of total Mario HP
              marioHealthMeter.update(mario.health); // Update Mario's health meter
              marioArrows.push(this);
              damageTakenSound.play();
            }
            if (gameOver === false) {
              if (mario.health < 1) {
                gameOver = !gameOver;
                winner = 'NPC'
                deadSound.play();
                if (gameOver) {
                  // create the restart button
                  let restartButton = createButton('Restart Game');
                  // position the button
                  restartButton.position((width / 2) - (restartButton.width / 2), height / 2 + 50);
                  // call the restartGame function when the button is clicked
                  restartButton.mousePressed(function () {
                    restartButton.remove(); // remove the button
                    restartGame(); // call the restart function
                  });
                }
              }
              if (npc.health < 1) {
                gameOver = !gameOver;
                winner = 'Mario'
                song.stop();
                winSound.play();
                if (gameOver) {
                  // create the restart button
                  let restartButton = createButton('Restart Game');
                  // position the button
                  restartButton.position((width / 2) - (restartButton.width / 2), height / 2 + 50);
                  // call the restartGame function when the button is clicked
                  restartButton.mousePressed(function () {
                    restartButton.remove(); // remove the button
                    restartGame(); // call the restart function
                  });
                }
              }
            }
            return true;
          }
        }
        return false;
      }

      offscreen() {
        return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height);
      }
    }

    function restartGame() {
      // Reset game state
      mario = new Mario();
      npc = new NPC();
      arrows = [];
      marioArrows = [];
      npcArrows = [];
      gameOver = false;
      winner = false;

      // Redraw canvas
      loop(); // Resume the draw() loop if it's stopped
      clear(); // Clear the canvas
      setup(); // Re-run the setup() function to reset the canvas and objects
    }

    function keyPressed() {
      if (keyCode === UP_ARROW) {
        mario.jump();
      }
    }

    function keyReleased() {
      if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
        mario.velocity = 0;
      }
    }