class HubScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HubScene' });
    }

    preload() {
        console.log('HubScene preload');
        this.load.image('tileset1', 'assets/tileset/tileset.png'); // Main floor, walls, and props
        this.load.image('tileset2', 'assets/tileset/tileset2.png'); // Dirt path
        this.load.image('tileset3', 'assets/InfoZones.png'); // Zones
        this.load.tilemapTiledJSON('map', 'assets/map.json'); // Tiled map JSON file with embedded tilesets
        this.load.image('vehicle', 'assets/vehicle.png');
    }

    create() {
        console.log('HubScene create');
        
        // Create the tile map
        const map = this.make.tilemap({ key: 'map' });
        const tileset1 = map.addTilesetImage('tileset', 'tileset1'); // Main floor, walls, and props
        const tileset2 = map.addTilesetImage('tileset2', 'tileset2'); // Dirt path
        const tileset3 = map.addTilesetImage('Zones', 'tileset3'); // Zones
    
        // Create the layers
        const groundLayer = map.createLayer('ground', [tileset1, tileset2], 0, 0); // Main floor and dirt path
        const groundLayer2 = map.createLayer('ground 2', [tileset1, tileset2], 0, 0); // Additional ground layer
        const worldLayer = map.createLayer('props', [tileset1], 0, 0); // Walls and props
        const zonesLayer = map.createLayer('zones', [tileset3], 0, 0); // Zones

        // Debugging: Log the layers to verify they are created
        console.log('groundLayer:', groundLayer);
        console.log('groundLayer2:', groundLayer2);
        console.log('worldLayer:', worldLayer);
        console.log('zonesLayer:', zonesLayer);
    
        // Set collision for the world layer
        if (worldLayer) {
            worldLayer.setCollisionByProperty({ collides: true });
        } else {
            console.error('World layer not found. Check the layer name in Tiled.');
        }
    
        // Add the vehicle sprite
        this.vehicle = this.physics.add.sprite(800, 600, 'vehicle');
        this.vehicle.setCollideWorldBounds(true);
        this.vehicle.setOrigin(0.5, 0.5); // Ensure the origin is centered
        this.vehicle.angle = 90; // Rotate the car sprite by 90 degrees

        // Create a dummy target for the camera to follow
        this.cameraTarget = this.add.sprite(this.vehicle.x, this.vehicle.y, null);
        this.cameraTarget.setVisible(false);

        // Set up keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
    
        // Add collision detection between the vehicle and zones
        this.physics.add.overlap(this.vehicle, zonesLayer, this.enterZone, null, this);
    
        // Add collision detection between the vehicle and the world layer
        if (worldLayer) {
            this.physics.add.collider(this.vehicle, worldLayer);
        }
    
        // Set camera bounds to match the world size
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.cameraTarget);

        // Initialize vehicle properties
        this.vehicleSpeed = 0;
        this.vehicleMaxSpeed = 300;
        this.vehicleMaxReverseSpeed = -150; // Slower reverse speed
        this.vehicleAcceleration = 10;
        this.vehicleDeceleration = 5;
        this.vehicleTurnSpeed = 1.5; // Heavier steering
        this.accelerationTimer = 0;
        this.accelerationIncrement = 0.1; // Increment speed every frame
        this.hasMoved = false; // Track if the vehicle has moved
    }

    update(time, delta) {
        // Handle acceleration and deceleration
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.accelerationTimer += delta;
            if (this.vehicleSpeed < this.vehicleMaxSpeed) {
                this.vehicleSpeed += this.vehicleAcceleration + (this.accelerationIncrement * (this.accelerationTimer / 1000));
            }
            this.hasMoved = true; // Mark that the vehicle has moved
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.accelerationTimer = 0; // Reset timer when not accelerating forward
            if (this.vehicleSpeed > this.vehicleMaxReverseSpeed) {
                this.vehicleSpeed -= this.vehicleAcceleration;
            }
            this.hasMoved = true; // Mark that the vehicle has moved
        } else {
            this.accelerationTimer = 0; // Reset timer when not accelerating forward
            if (this.vehicleSpeed > 0) {
                this.vehicleSpeed -= this.vehicleDeceleration;
            } else if (this.vehicleSpeed < 0) {
                this.vehicleSpeed += this.vehicleDeceleration;
            }
        }

        // Handle steering
        if (this.vehicleSpeed !== 0 || this.hasMoved) { // Allow rotation if the vehicle has moved
            if (this.cursors.left.isDown || this.wasd.left.isDown) {
                this.vehicle.angle -= this.vehicleTurnSpeed;
            } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
                this.vehicle.angle += this.vehicleTurnSpeed;
            }
        }

        // Update vehicle velocity based on speed and angle
        this.physics.velocityFromRotation(this.vehicle.rotation, this.vehicleSpeed, this.vehicle.body.velocity);

        // Update the camera target position to lag behind the vehicle
        this.cameraTarget.x = Phaser.Math.Linear(this.cameraTarget.x, this.vehicle.x, 0.1);
        this.cameraTarget.y = Phaser.Math.Linear(this.cameraTarget.y, this.vehicle.y, 0.1);
    }

    enterZone(vehicle, zone) {
        const tile = zone.tile;
        if (tile.properties.zone) {
            switch (tile.properties.zone) {
                case 'About Me':
                    this.scene.start('AboutMeScene');
                    break;
                case 'Projects':
                    this.scene.start('ProjectsScene');
                    break;
                case 'Skills':
                    this.scene.start('SkillsScene');
                    break;
            }
        }
    }
}

class AboutMeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AboutMeScene' });
    }

    preload() {
        console.log('AboutMeScene preload');
        this.load.image('background', 'assets/aboutMeBackground.png');
        this.load.image('vehicle', 'assets/vehicle.png');
    }

    create() {
        console.log('AboutMeScene create');
        this.add.image(800, 600, 'background');
        this.vehicle = this.physics.add.sprite(800, 600, 'vehicle');
        this.vehicle.setCollideWorldBounds(true);
        this.vehicle.setOrigin(0.5, 0.5); // Ensure the origin is centered
        this.vehicle.angle = 90; // Rotate the car sprite by 90 degrees

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.exitZone = this.physics.add.staticGroup();
        this.exitZone.create(800, 1100, 'zone').setName('Exit');

        this.physics.add.overlap(this.vehicle, this.exitZone, this.exitZoneHandler, null, this);

        // Create a dummy target for the camera to follow
        this.cameraTarget = this.add.sprite(this.vehicle.x, this.vehicle.y, null);
        this.cameraTarget.setVisible(false);

        // Set camera bounds to match the world size
        this.cameras.main.setBounds(0, 0, 1600, 1200); // Adjust according to your map size
        this.cameras.main.startFollow(this.cameraTarget);
    }

    update(time, delta) {
        this.vehicle.setVelocity(0);

        // Handle acceleration and deceleration
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.accelerationTimer += delta;
            if (this.vehicleSpeed < this.vehicleMaxSpeed) {
                this.vehicleSpeed += this.vehicleAcceleration + (this.accelerationIncrement * (this.accelerationTimer / 1000));
            }
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.accelerationTimer = 0; // Reset timer when not accelerating forward
            if (this.vehicleSpeed > this.vehicleMaxReverseSpeed) {
                this.vehicleSpeed -= this.vehicleAcceleration;
            }
        } else {
            this.accelerationTimer = 0; // Reset timer when not accelerating forward
            if (this.vehicleSpeed > 0) {
                this.vehicleSpeed -= this.vehicleDeceleration;
            } else if (this.vehicleSpeed < 0) {
                this.vehicleSpeed += this.vehicleDeceleration;
            }
        }

        // Handle steering
        if (this.vehicleSpeed !== 0) { // Only allow rotation if the vehicle is moving
            if (this.cursors.left.isDown || this.wasd.left.isDown) {
                this.vehicle.angle -= this.vehicleTurnSpeed;
            } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
                this.vehicle.angle += this.vehicleTurnSpeed;
            }
        }

        // Update vehicle velocity based on speed and angle
        this.physics.velocityFromRotation(this.vehicle.rotation, this.vehicleSpeed, this.vehicle.body.velocity);

        // Update the camera target position to lag behind the vehicle
        this.cameraTarget.x = Phaser.Math.Linear(this.cameraTarget.x, this.vehicle.x, 0.1);
        this.cameraTarget.y = Phaser.Math.Linear(this.cameraTarget.y, this.vehicle.y, 0.1);
    }

    exitZoneHandler(vehicle, zone) {
        this.scene.start('HubScene');
    }
}

class ProjectsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ProjectsScene' });
    }

    preload() {
        console.log('ProjectsScene preload');
        this.load.image('background', 'assets/projectsBackground.png');
        this.load.image('vehicle', 'assets/vehicle.png');
    }

    create() {
        console.log('ProjectsScene create');
        this.add.image(800, 600, 'background');
        this.vehicle = this.physics.add.sprite(800, 600, 'vehicle');
        this.vehicle.setCollideWorldBounds(true);
        this.vehicle.setOrigin(0.5, 0.5); // Ensure the origin is centered
        this.vehicle.angle = 90; // Rotate the car sprite by 90 degrees

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.exitZone = this.physics.add.staticGroup();
        this.exitZone.create(800, 1100, 'zone').setName('Exit');

        this.physics.add.overlap(this.vehicle, this.exitZone, this.exitZoneHandler, null, this);

        // Create a dummy target for the camera to follow
        this.cameraTarget = this.add.sprite(this.vehicle.x, this.vehicle.y, null);
        this.cameraTarget.setVisible(false);

        // Set camera bounds to match the world size
        this.cameras.main.setBounds(0, 0, 1600, 1200); // Adjust according to your map size
        this.cameras.main.startFollow(this.cameraTarget);
    }

    update(time, delta) {
        this.vehicle.setVelocity(0);

        // Handle acceleration and deceleration
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.accelerationTimer += delta;
            if (this.vehicleSpeed < this.vehicleMaxSpeed) {
                this.vehicleSpeed += this.vehicleAcceleration + (this.accelerationIncrement * (this.accelerationTimer / 1000));
            }
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.accelerationTimer = 0; // Reset timer when not accelerating forward
            if (this.vehicleSpeed > this.vehicleMaxReverseSpeed) {
                this.vehicleSpeed -= this.vehicleAcceleration;
            }
        } else {
            this.accelerationTimer = 0; // Reset timer when not accelerating forward
            if (this.vehicleSpeed > 0) {
                this.vehicleSpeed -= this.vehicleDeceleration;
            } else if (this.vehicleSpeed < 0) {
                this.vehicleSpeed += this.vehicleDeceleration;
            }
        }

        // Handle steering
        if (this.vehicleSpeed !== 0) { // Only allow rotation if the vehicle is moving
            if (this.cursors.left.isDown || this.wasd.left.isDown) {
                this.vehicle.angle -= this.vehicleTurnSpeed;
            } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
                this.vehicle.angle += this.vehicleTurnSpeed;
            }
        }

        // Update vehicle velocity based on speed and angle
        this.physics.velocityFromRotation(this.vehicle.rotation, this.vehicleSpeed, this.vehicle.body.velocity);

        // Update the camera target position to lag behind the vehicle
        this.cameraTarget.x = Phaser.Math.Linear(this.cameraTarget.x, this.vehicle.x, 0.1);
        this.cameraTarget.y = Phaser.Math.Linear(this.cameraTarget.y, this.vehicle.y, 0.1);
    }

    exitZoneHandler(vehicle, zone) {
        this.scene.start('HubScene');
    }
}

class SkillsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SkillsScene' });
    }

    preload() {
        console.log('SkillsScene preload');
        this.load.image('background', 'assets/skillsBackground.png');
        this.load.image('vehicle', 'assets/vehicle.png');
    }

    create() {
        console.log('SkillsScene create');
        this.add.image(800, 600, 'background');
        this.vehicle = this.physics.add.sprite(800, 600, 'vehicle');
        this.vehicle.setCollideWorldBounds(true);
        this.vehicle.setOrigin(0.5, 0.5); // Ensure the origin is centered
        this.vehicle.angle = 90; // Rotate the car sprite by 90 degrees

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.exitZone = this.physics.add.staticGroup();
        this.exitZone.create(800, 1100, 'zone').setName('Exit');

        this.physics.add.overlap(this.vehicle, this.exitZone, this.exitZoneHandler, null, this);

        // Create a dummy target for the camera to follow
        this.cameraTarget = this.add.sprite(this.vehicle.x, this.vehicle.y, null);
        this.cameraTarget.setVisible(false);

        // Set camera bounds to match the world size
        this.cameras.main.setBounds(0, 0, 1600, 1200); // Adjust according to your map size
        this.cameras.main.startFollow(this.cameraTarget);
    }

    update(time, delta) {
        this.vehicle.setVelocity(0);

        // Handle acceleration and deceleration
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.accelerationTimer += delta;
            if (this.vehicleSpeed < this.vehicleMaxSpeed) {
                this.vehicleSpeed += this.vehicleAcceleration + (this.accelerationIncrement * (this.accelerationTimer / 1000));
            }
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.accelerationTimer = 0; // Reset timer when not accelerating forward
            if (this.vehicleSpeed > this.vehicleMaxReverseSpeed) {
                this.vehicleSpeed -= this.vehicleAcceleration;
            }
        } else {
            this.accelerationTimer = 0; // Reset timer when not accelerating forward
            if (this.vehicleSpeed > 0) {
                this.vehicleSpeed -= this.vehicleDeceleration;
            } else if (this.vehicleSpeed < 0) {
                this.vehicleSpeed += this.vehicleDeceleration;
            }
        }

        // Handle steering
        if (this.vehicleSpeed !== 0) { // Only allow rotation if the vehicle is moving
            if (this.cursors.left.isDown || this.wasd.left.isDown) {
                this.vehicle.angle -= this.vehicleTurnSpeed;
            } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
                this.vehicle.angle += this.vehicleTurnSpeed;
            }
        }

        // Update vehicle velocity based on speed and angle
        this.physics.velocityFromRotation(this.vehicle.rotation, this.vehicleSpeed, this.vehicle.body.velocity);

        // Update the camera target position to lag behind the vehicle
        this.cameraTarget.x = Phaser.Math.Linear(this.cameraTarget.x, this.vehicle.x, 0.1);
        this.cameraTarget.y = Phaser.Math.Linear(this.cameraTarget.y, this.vehicle.y, 0.1);
    }

    exitZoneHandler(vehicle, zone) {
        this.scene.start('HubScene');
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 1200,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [HubScene, AboutMeScene, ProjectsScene, SkillsScene]
};

const game = new Phaser.Game(config);

// Add event listeners for the contact, reset, and others buttons
document.addEventListener('DOMContentLoaded', () => {
    const contactButton = document.getElementById('contact-button');
    const contactPopup = document.getElementById('contact-popup');
    const closeContact = document.getElementById('close-contact');

    const resetButton = document.getElementById('reset-button');

    const othersButton = document.getElementById('others-button');
    const othersPopup = document.getElementById('others-popup');
    const closeOthers = document.getElementById('close-others');

    const passwordPopup = document.getElementById('password-popup');
    const passwordInput = document.getElementById('password-input');
    const submitPassword = document.getElementById('submit-password');
    const closePassword = document.getElementById('close-password');
    const passwordMessage = document.getElementById('password-message');

    let currentPopup = null;

    function closeCurrentPopup() {
        if (currentPopup) {
            currentPopup.style.display = 'none';
            currentPopup = null;
        }
    }

    function openPopup(button, popup) {
        closeCurrentPopup();
        const rect = button.getBoundingClientRect();
        popup.style.top = `${rect.bottom}px`;
        popup.style.left = `${rect.left}px`;
        popup.style.display = 'block';

        // Ensure the popup is fully on the screen
        const popupRect = popup.getBoundingClientRect();
        if (popupRect.right > window.innerWidth) {
            popup.style.left = `${window.innerWidth - popupRect.width}px`;
        }
        if (popupRect.bottom > window.innerHeight) {
            popup.style.top = `${window.innerHeight - popupRect.height}px`;
        }

        currentPopup = popup;
    }

    contactButton.addEventListener('click', () => {
        openPopup(contactButton, contactPopup);
    });

    closeContact.addEventListener('click', () => {
        closeCurrentPopup();
    });

    resetButton.addEventListener('click', () => {
        location.reload();
    });

    othersButton.addEventListener('click', () => {
        openPopup(othersButton, passwordPopup);
    });

    closeOthers.addEventListener('click', () => {
        closeCurrentPopup();
    });

    closePassword.addEventListener('click', () => {
        closeCurrentPopup();
    });

    submitPassword.addEventListener('click', () => {
        const password = passwordInput.value;
        fetch('http://localhost:3000/validate-password', { // Update the URL to match your backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                closeCurrentPopup();
                window.location.href = '/confidential'; // Redirect to the confidential page
            } else {
                passwordPopup.classList.add('shake', 'red-background');
                passwordMessage.textContent = 'Incorrect password. Please try again.';
                setTimeout(() => {
                    passwordPopup.classList.remove('shake', 'red-background');
                    passwordMessage.textContent = '';
                }, 500);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Disable game controls while the password pop-up is active
    document.addEventListener('keydown', (event) => {
        if (currentPopup === passwordPopup) {
            event.stopPropagation();
        }
    }, true);
});