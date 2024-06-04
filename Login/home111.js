const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Hexagon {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.gradient = null;
        this.radius = 25;
        this.color = "rgb(10, 10, 10)";
        this.lightUp = false;
        this.lightOpacity = 0.1;
        this.currentFlashlightColor = this.game.flashlightColor;
        this.lightColor = this.currentFlashlightColor + this.lightOpacity + ")";
        this.opacityReverse = false;
        this.flash = false;
        this.flashTimer = 0;
        this.flashInterval = 100;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.PI / 2);

        this.gradient = ctx.createLinearGradient(0, 0, this.radius * 2, this.radius * 2);
        this.gradient.addColorStop(0, "black");
        this.gradient.addColorStop(1, "white");

        ctx.fillStyle = this.color;

        if (this.flash) {
            ctx.fillStyle = this.game.flashlightColor + "0.8)";
        }

        ctx.strokeStyle = this.gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.radius * Math.cos(0), this.radius * Math.sin(0));
        for (var i = 1; i <= 6; i++) {
            var angle = (i * 2 * Math.PI) / 6;
            ctx.lineTo(this.radius * Math.cos(angle), this.radius * Math.sin(angle));
        }

        ctx.fill();
        ctx.stroke();

        if (this.lightUp) {
            ctx.beginPath();
            ctx.strokeStyle = this.lightColor;
            ctx.lineWidth = 2;
            ctx.moveTo(this.radius * Math.cos(0), this.radius * Math.sin(0));
            for (var i = 1; i <= 6; i++) {
                var angle = (i * 2 * Math.PI) / 6;
                ctx.lineTo(this.radius * Math.cos(angle), this.radius * Math.sin(angle));
            };
            ctx.stroke();
        }
        ctx.restore();

    }

    update(deltaTime) {
        this.lightColor = this.currentFlashlightColor + this.lightOpacity + ")";
        if (this.lightUp) {
            let opacityAdd = 0.01;

            if (this.lightOpacity >= 1) {
                this.opacityReverse = true;
            }
            if (this.opacityReverse) {
                opacityAdd = -0.01;
            }

            if (this.lightOpacity >= 0.01) {
                this.lightOpacity += opacityAdd;
            } else {
                this.lightUp = false;
            }
        }

        if (this.flash) {
            this.currentFlashlightColor = this.game.flashlightColor;
            this.flashTimer += deltaTime;

            if (this.flashTimer >= this.flashInterval) {
                this.flash = false;
                this.flashTimer = 0;
            }
        }
    }

}


class Game {
    constructor(canvas, ctx) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.keys = [];
        this.gradient = null;
        this.flashlightRadius = 150;
        this.hexagonSpacingOffset = -4;
        this.colorIndex = 0;
        this.flashlightColors = ["rgba(0, 255, 0, ", "rgba(255, 0, 0, ", "rgba(0, 0, 255, ", "rgba(255, 255, 0, ", "rgba(0, 255, 255, ", "rgba(255, 0, 255, "]
        this.flashlightColor = this.flashlightColors[0];
        this.hexagonRadius = 25;
        this.hexagons = [];
        this.lightUpAmount = 10;
        this.lightTimer = 0;
        this.lightInterval = 500;

        this.chainTimer = 0;
        this.chainInterval = 5;
        this.chainReaction = false;
        this.chainIndex = 0;

        this.wipe = false;
        this.wipeY = -50;

        this.mouse = {
            x: -this.flashlightRadius,
            y: -this.flashlightRadius,
            clicked: false,
            start: undefined,
            moving: false,
        };

        window.addEventListener("resize", (e) => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        })
        window.addEventListener("mousedown", e => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
            this.mouse.clicked = true;
            this.mouse.start = e.x;

            if (e.button == 0 && !this.wipe && !this.chainReaction) {
                this.colorIndex += 1;
                if (this.colorIndex >= this.flashlightColors.length) {
                    this.colorIndex = 0;
                }
                this.chainReaction = true;
            }

            if (e.button == 2 && !this.wipe) {
                this.colorIndex += 1;
                if (this.colorIndex >= this.flashlightColors.length) {
                    this.colorIndex = 0;
                }

                this.wipe = true;
            }

        });
        window.addEventListener("mousemove", e => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
            if ((this.mouse.start >= this.mouse.x + 40 || this.mouse.start <= this.mouse.x - 40) && this.mouse.clicked) {
                this.mouse.moving = true;
            } else {
                this.mouse.moving = false;
            }
        });
        window.addEventListener("mouseup", e => {
            this.mouse.clicked = false;
            this.origOffsetX = this.offsetX;
            this.mouse.moving = false;
        });

        this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

        this.initialCreate();
    }

    initialCreate() {
        for (let y = 0; y < 34; y++) {
            for (let x = 0; x < 56; x++) {
                let offsetX = 0;
                if (y % 2 == 0) {
                    offsetX = this.hexagonRadius + this.hexagonSpacingOffset / 2;
                }
                var actualX = ((this.hexagonRadius * 2) + this.hexagonSpacingOffset) * x + offsetX;
                var actualY = (((this.hexagonRadius * 2) - 5) + (this.hexagonSpacingOffset - 1)) * y;

                this.hexagons.push(new Hexagon(this, actualX, actualY));
            }
        }
    }

    flashlightUpdate() {
        this.flashlightColor = this.flashlightColors[this.colorIndex];

        this.gradient = ctx.createRadialGradient(
            this.mouse.x, this.mouse.y, 0,
            this.mouse.x, this.mouse.y, this.flashlightRadius
        );

        this.gradient.addColorStop(0, this.flashlightColor + "1)");
        this.gradient.addColorStop(1, this.flashlightColor + "0)");

        ctx.fillStyle = this.gradient;
        ctx.beginPath();
        ctx.arc(this.mouse.x, this.mouse.y, this.flashlightRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    render(deltaTime) {

        this.flashlightUpdate();

        if (this.chainReaction) {
            this.chainTimer += deltaTime;
            if (this.chainTimer >= this.chainInterval) {
                this.hexagons[this.chainIndex].flash = true;
                this.chainIndex++;
                if (this.chainIndex >= this.hexagons.length) {
                    this.chainIndex = 0;
                    this.chainReaction = false;
                };

                this.chainTimer = 0;
            }
        }

        this.lightTimer += deltaTime;
        if (this.lightTimer >= this.lightInterval) {
            for (let i = 0; i <= this.lightUpAmount; i++) {
                let randomHex = this.hexagons[Math.floor(Math.random() * this.hexagons.length)];

                if (randomHex.lightUp) {
                    i--;
                } else {
                    randomHex.lightUp = true;
                }
            }

            this.lightTimer = 0;
        }

        this.hexagons.forEach(hexagon => {
            hexagon.update(deltaTime);
            hexagon.draw(ctx);
        })

        if (this.wipe) {
            this.wipeY += 3;
            ctx.fillStyle = this.flashlightColor + "0.8)";
            ctx.fillRect(0, this.wipeY, this.width, 10);

            if (this.wipeY >= this.height) {
                this.wipe = false;
                this.wipeY = -50;
            }

            this.hexagons.forEach(hexagon => {
                if (hexagon.y - hexagon.radius <= this.wipeY && (hexagon.y - hexagon.radius) + hexagon.radius - 10 >= this.wipeY) {
                    hexagon.currentFlashlightColor = this.flashlightColor;
                }
            })
        }
    }

    // Method to handle button clicks
    handleButtonClick(buttonId) {
        console.log(`Button ${buttonId} clicked.`);
        // You can implement specific functionality for each button here
        // For example:
        // if (buttonId === 'button1') {
        //     // Do something for button 1
        // } else if (buttonId === 'button2') {
        //     // Do something for button 2
        // }
    }
}

const game = new Game(canvas, ctx);

// Event listener for button 1 click
document.getElementById("button1").addEventListener("click", () => {
    game.handleButtonClick('button1');
});

// Event listener for button 2 click
document.getElementById("button2").addEventListener("click", () => {
    game.handleButtonClick('button2');
});

let lastTime = 0;

function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    game.render(deltaTime);

    requestAnimationFrame(animate);
}

animate(0);
