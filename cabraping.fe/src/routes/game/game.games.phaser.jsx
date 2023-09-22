// import React, { useEffect } from 'react';
// import Phaser from 'phaser';

// const PhaserGame = () => {
//   useEffect(() => {
//     // Configura el juego Phaser
//     const config = {
//       type: Phaser.AUTO,
//       width: 100,
//       height: 100,
//       scene: {
//         preload: preload,
//         create: create,
//       },
//     };

//     const game = new Phaser.Game(config);

//     function preload() {
//       // Carga recursos, si es necesario
//     }

//     function create() {
//       // Código de inicialización, por ejemplo, "Hola Mundo"
//       // const text = this.add.text(100, 100, 'Hola Mundo', {
//       //   fontSize: '32px',
//       //   fill: '#fff',
//       // });
//       // text.setOrigin(0.5);
//     }

//     // Limpia el juego cuando el componente se desmonta
//     return () => game.destroy();
//   }, []);

//   return <div id="phaser-container"></div>;
// };

// export default PhaserGame;

import React, { useEffect } from 'react';
import Phaser from 'phaser';

const PhaserGame = () => {
  useEffect(() => {
    // Obtiene el ancho y alto de la pantalla
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Configura el juego Phaser para que ocupe toda la pantalla
    const config = {
      type: Phaser.AUTO,
      width: screenWidth,
      height: screenHeight,
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    };

    const game = new Phaser.Game(config);

    // Variables para los elementos del juego
    let paddle;
    let ball;

    function preload() {
      // Carga recursos, como imágenes, si es necesario
    }

    function create() {
      // Crea el paddle (paleta)
      paddle = this.add.rectangle(
        screenWidth / 2,
        screenHeight - 30,
        100,
        10,
        0xffffff
      );
      this.physics.add.existing(paddle, true);

      // Crea la pelota
      ball = this.add.circle(screenWidth / 2, screenHeight / 2, 10, 0xffffff);
      this.physics.add.existing(ball, true);

      // Agrega colisiones y físicas
      this.physics.add.collider(ball, paddle);

      // Configura el rebote de la pelota
      ball.body.setBounce(1, 1);

      // Inicia el movimiento de la pelota
      ball.body.setVelocity(200, 200);
    }

    function update() {
      // Agrega aquí la lógica del juego, como el movimiento del paddle, colisiones, etc.
    }

    // Limpia el juego cuando el componente se desmonta
    return () => game.destroy();
  }, []);

  return <div id="phaser-container"></div>;
};

export default PhaserGame;
