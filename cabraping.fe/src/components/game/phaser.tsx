// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import React, { useEffect } from "react";
import Phaser from "phaser";

const PhaserGame = () => {
  useEffect(() => {
    const screenWidth = window.innerWidth / 2;
    const screenHeight = window.innerHeight / 2;

    let player1: Phaser.Physics.Arcade.Image;
    let player2: Phaser.Physics.Arcade.Image;
    let ball: Phaser.Physics.Arcade.Image;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    let keys: { W: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key };
    let scoreText1: Phaser.GameObjects.Text;
    let scoreText2: Phaser.GameObjects.Text;
    const ballSpeed = 500;
    const playerSpeed = 800;

    let scorePlayer1 = 0;
    let scorePlayer2 = 0;

    const config = {
      type: Phaser.AUTO,
      width: screenWidth,
      height: screenHeight,
      backgroundColor: "#333",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
        },
      },
      scene: {
        create: function () {
          scoreText1 = this.add.text(16, 16, "Player 1: ⬆W ⬇S", {
            fontSize: "1.1vw",
            fill: "#FFF",
          });
          scoreText2 = this.add.text(
            (screenWidth / 4 ) * 3,
            16,
            "Player 2: ⬆⬆️ ⬇⬇️",
            { fontSize: "1.1vw", fill: "#FFF" }
          );

          // Player 1 paddle
          player1 = this.add
            .rectangle(50, screenHeight / 2, 10, 100, 0xffffff)
            .setOrigin(0.5);
          this.physics.world.enable(player1);
          player1.body.setCollideWorldBounds(true);
          player1.body.setImmovable(true);

          // Player 2 paddle
          player2 = this.add
            .rectangle(screenWidth - 50, screenHeight / 2, 10, 100, 0xffffff)
            .setOrigin(0.5);
          this.physics.world.enable(player2);
          player2.body.setCollideWorldBounds(true);
          player2.body.setImmovable(true);

          // Ball
          ball = this.add
            .circle(screenWidth / 2, screenHeight / 2, 10, 0xffffff)
            .setOrigin(0.5);
          this.physics.world.enable(ball);
          ball.body.setCollideWorldBounds(true);
          ball.body.setBounce(1, 1);
          ball.body.setVelocity(
            Phaser.Math.Between(-ballSpeed, ballSpeed),
            Phaser.Math.Between(-ballSpeed, ballSpeed)
          );

          // Collisions
          this.physics.add.collider(ball, player1, hitPlayer1, null, this);
          this.physics.add.collider(ball, player2, hitPlayer2, null, this); // bien

          // Keys
          cursors = this.input.keyboard.createCursorKeys();
          keys = this.input.keyboard.addKeys("W,S");
        },
        update: function () {
          // Move player 1
          if (keys.W.isDown) {
            player1.body.setVelocityY(-playerSpeed);
          } else if (keys.S.isDown) {
            player1.body.setVelocityY(playerSpeed);
          } else {
            player1.body.setVelocityY(0);
          }

          // Move player 2
          if (cursors.up.isDown) {
            player2.body.setVelocityY(-playerSpeed);
          } else if (cursors.down.isDown) {
            player2.body.setVelocityY(playerSpeed);
          } else {
            player2.body.setVelocityY(0);
          }

          // points
          if (ball.x <= 20) {
            scorePlayer2++;
            scoreText2.setText(scorePlayer2);
            resetBall();
          } else if (ball.x >= screenWidth - 20) {
            scorePlayer1++;
            scoreText1.setText(scorePlayer1);
            resetBall();
          }
        },
      },
    };

    // This function controls the speed of the ball so that it is always constant
    function setBallVelocity(ball: Phaser.Physics.Arcade.Image) {
      const angle = Math.atan2(ball.body.velocity.y, ball.body.velocity.x);
      ball.body.setVelocity(
        Math.cos(angle) * ballSpeed,
        Math.sin(angle) * ballSpeed
      );
    }

    // This function is called when the ball hits one of the side walls
    function resetBall() {
      // ball.body.setPosition(screenWidth / 2, screenHeight / 2);
      ball.setPosition(screenWidth / 2, screenHeight / 2);

      ball.body.setVelocity(
        Phaser.Math.Between(-ballSpeed, ballSpeed),
        Phaser.Math.Between(-ballSpeed, ballSpeed)
      );
      setBallVelocity(ball);
    }

    function hitPlayer1(ball: Phaser.Physics.Arcade.Image, player: Phaser.Physics.Arcade.Image) {
      let diff = 0;

      if (ball.y < player.y) {
        // If the ball is on top of the player
        diff = player.y - ball.y;
        ball.body.setVelocityY(10 * diff);
      } else if (ball.y > player.y) {
        // If the ball is at the bottom of the player
        diff = ball.y - player.y;
        ball.body.setVelocityY(-10 * diff);
      } else {
        // The ball hits the center of the player
        ball.body.setVelocityY(0);
      }

      if (ball.x < screenWidth / 2) {
        ball.x -= 5;
      } else {
        ball.x += 5;
      }

      ball.body.setVelocityX(ball.body.velocity.x * -1.5);
      const angle = Math.atan2(ball.body.velocity.y, ball.body.velocity.x);
      ball.body.setVelocity(
        Math.cos(angle) * -ballSpeed,
        Math.sin(angle) * -ballSpeed
      );
    }

    function hitPlayer2(ball: Phaser.Physics.Arcade.Image, player: Phaser.Physics.Arcade.Image) {
      let diff = 0;

      if (ball.y < player.y) {
        // If the ball is on top of the player
        diff = player.y - ball.y;
        ball.body.setVelocityY(-10 * diff);
      } else if (ball.y > player.y) {
        // If the ball is at the bottom of the player
        diff = ball.y - player.y;
        ball.body.setVelocityY(10 * diff);
      } else {
        // The ball hits the center of the player
        ball.body.setVelocityY(0);
      }

      if (ball.x < screenWidth / 2) {
        ball.x += 5;
      } else {
        ball.x -= 5;
      }

      ball.body.setVelocityX(ball.body.velocity.x * 1.5);
      ball.body.setVelocityY(ball.body.velocity.x * 1.5);
      setBallVelocity(ball);
    }

    const game = new Phaser.Game(config);

    // Clear the game when the component is unmounted
    return () => {
      if (game) {
        game.destroy(true); // The 'true' argument removes the game canvas from the DOM.
      }
    };
  }, []);

  return <div id="phaser-container"></div>;
};

export default PhaserGame;
