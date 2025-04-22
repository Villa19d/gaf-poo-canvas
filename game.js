// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Clase Ball (Pelota)
class Ball {
  constructor(x, y, radius, speedX, speedY, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
    this.color = color;
    this.initialSpeedX = speedX;
    this.initialSpeedY = speedY;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  move() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Colisión con la parte superior e inferior
    if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
      this.speedY = -this.speedY;
    }
  }

  reset() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speedX = this.initialSpeedX * (Math.random() > 0.5 ? 1 : -1);
    this.speedY = this.initialSpeedY * (Math.random() > 0.5 ? 1 : -1);
  }
}

// Clase Paddle (Paleta)
class Paddle {
  constructor(x, y, width, height, isPlayerControlled = false) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isPlayerControlled = isPlayerControlled;
    this.speed = 5;
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  move(direction) {
    if (direction === 'up' && this.y > 0) {
      this.y -= this.speed;
    } else if (direction === 'down' && this.y + this.height < canvas.height) {
      this.y += this.speed;
    }
  }

  // Movimiento de la paleta automática (IA)
  autoMove(balls) {
    // Seguir la pelota más cercana
    let closestBall = balls[0];
    let minDistance = Infinity;
    
    for (const ball of balls) {
      const distance = Math.abs(ball.x - this.x);
      if (distance < minDistance) {
        minDistance = distance;
        closestBall = ball;
      }
    }
    
    if (closestBall.y < this.y + this.height / 2) {
      this.y -= this.speed;
    } else if (closestBall.y > this.y + this.height / 2) {
      this.y += this.speed;
    }
  }
}

// Clase Game (Controla el juego)
class Game {
  constructor() {
    this.balls = this.createBalls(5);
    this.paddle1 = new Paddle(0, canvas.height / 2 - 50, 10, 100, true); // Controlado por el jugador
    this.paddle2 = new Paddle(canvas.width - 10, canvas.height / 2 - 50, 10, 100); // Controlado por la computadora
    this.keys = {}; // Para capturar las teclas
  }

  createBalls(count) {
    const balls = [];
    const colors = ['#FF5252', '#FFEB3B', '#4CAF50', '#2196F3', '#9C27B0'];
    
    for (let i = 0; i < count; i++) {
      const radius = 5 + Math.random() * 10;
      const speed = 2 + Math.random() * 3;
      const angle = Math.random() * Math.PI * 2;
      
      balls.push(new Ball(
        canvas.width / 2,
        canvas.height / 2,
        radius,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        colors[i % colors.length]
      ));
    }
    
    return balls;
  }

  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar todas las pelotas
    this.balls.forEach(ball => ball.draw());
    
    this.paddle1.draw();
    this.paddle2.draw();
  }

  update() {
    // Mover todas las pelotas
    this.balls.forEach(ball => ball.move());
    
    // Movimiento de la paleta 1 (Jugador) controlado por teclas
    if (this.keys['ArrowUp']) {
      this.paddle1.move('up');
    }
    if (this.keys['ArrowDown']) {
      this.paddle1.move('down');
    }
    
    // Movimiento de la paleta 2 (Controlada por IA)
    this.paddle2.autoMove(this.balls);
    
    // Colisiones con las paletas para todas las pelotas
    this.balls.forEach(ball => {
      // Colisión con la paleta izquierda
      if (ball.x - ball.radius <= this.paddle1.x + this.paddle1.width &&
          ball.y >= this.paddle1.y && ball.y <= this.paddle1.y + this.paddle1.height) {
        ball.speedX = -ball.speedX;
      }
      
      // Colisión con la paleta derecha
      if (ball.x + ball.radius >= this.paddle2.x &&
          ball.y >= this.paddle2.y && ball.y <= this.paddle2.y + this.paddle2.height) {
        ball.speedX = -ball.speedX;
      }
      
      // Detectar cuando la pelota sale de los bordes (punto marcado)
      if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
        ball.reset();
      }
    });
  }

  // Captura de teclas para el control de la paleta
  handleInput() {
    window.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
    });
    window.addEventListener('keyup', (event) => {
      this.keys[event.key] = false;
    });
  }

  run() {
    this.handleInput();
    const gameLoop = () => {
      this.update();
      this.draw();
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }
}

// Crear instancia del juego y ejecutarlo
const game = new Game();
game.run();