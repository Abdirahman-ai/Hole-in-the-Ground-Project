/* Assignment 2: Hole in the Ground
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { RigidBody } from './RigidBody';

export class PhysicsGame extends gfx.GfxApp
{
    // State variable to store the current stage of the game
    private stage: number;

    // Current hole radius
    private holeRadius: number;

    // Mesh of a ground plane with a hole in it
    private hole: gfx.Mesh3;

    // Template mesh to create sphere instances
    private sphere: gfx.Mesh3;

    // Bounding box that defines the dimensions of the play area
    private playArea: gfx.BoundingBox3;

    // Group that will hold all the rigid bodies currently in the scene
    private rigidBodies: gfx.Node3;  

    // A plane mesh that will be used to display dynamic text
    private textPlane: gfx.Mesh3;

    // A dynamic texture that will be displayed on the plane mesh
    private text: gfx.Text;

    // A sound effect to play when an object falls inside the hole
    private holeSound: HTMLAudioElement;

    // A sound effect to play when the user wins the game
    private winSound: HTMLAudioElement;

    // Vector used to store user input from keyboard or mouse
    private inputVector: gfx.Vector2;

    constructor()
    {
        super();

        this.stage = 0;

        this.holeRadius = 1;
        this.hole = gfx.MeshLoader.loadOBJ('./assets/hole.obj');
        this.sphere = gfx.Geometry3Factory.createSphere(1, 2);

        this.playArea = new gfx.BoundingBox3();
        this.rigidBodies = new gfx.Node3();
        
        this.textPlane = gfx.Geometry3Factory.createPlane();
        this.text = new gfx.Text('press a button to start', 512, 256, '48px Helvetica');
        this.holeSound = new Audio('./assets/hole.mp3');
        this.winSound = new Audio('./assets/win.mp3');

        this.inputVector = new gfx.Vector2();
    }

    createScene(): void 
    {


        // Setup the camera projection matrix, position, and look direction.
        // We will learn more about camera models later in this course.
        this.camera.setPerspectiveCamera(60, 1920/1080, 0.1, 50)
        this.camera.position.set(0, 12, 12);
        this.camera.lookAt(gfx.Vector3.ZERO);

        // Create an ambient light that illuminates everything in the scene
        const ambientLight = new gfx.AmbientLight(new gfx.Color(0.3, 0.3, 0.3));
        this.scene.add(ambientLight);

        // Create a directional light that is infinitely far away (sunlight)
        const directionalLight = new gfx.DirectionalLight(new gfx.Color(0.6, 0.6, 0.6));
        directionalLight.position.set(0, 2, 1);
        this.scene.add(directionalLight);

        // Set the hole mesh material color to green
        this.hole.material.setColor(new gfx.Color(83/255, 209/255, 110/255));

        // Create a bounding box for the game
        this.playArea.min.set(-10, 0, -16);
        this.playArea.max.set(10, 30, 8);

        // Position the text plane mesh on the ground
        this.textPlane.position.set(0, 0.1, 4.5);
        this.textPlane.scale.set(16, 8, 1);
        this.textPlane.rotation.setEulerAngles(-Math.PI/2, 0, Math.PI);

        // Set up the dynamic texture for the text plane
        const textMaterial = new gfx.UnlitMaterial();
        textMaterial.texture = this.text;
        this.textPlane.material = textMaterial;

        // Draw lines for the bounding box
        const playBounds = new gfx.Line3();
        playBounds.createFromBox(this.playArea);
        playBounds.color.set(1, 1, 1);
        this.scene.add(playBounds);

        // Add the objects to the scene
        this.scene.add(this.hole);
        this.scene.add(this.textPlane);
        this.scene.add(this.rigidBodies);
    }

    update(deltaTime: number): void 
    {
        // This code defines the gravity and friction parameters used in the
        // instructor's example implementation.  You can change them if you 
        // want to adjust your game mechanics and difficulty. 
        // However, note that the spheres in the initial scene are placed purposefully
        // to allow you to visually check that your physics code is working.

        // The movement speed of the hole in meters / sec
        const holeSpeed = 10;

        // The friction constant will cause physics objects to slow down upon collision
        const frictionSlowDown = 0.9;

        // Hole radius scale factor
        const holeScaleFactor = 1.25;

        // Move hole based on the user input
        this.hole.position.x += this.inputVector.x * holeSpeed * deltaTime;
        this.hole.position.z -= this.inputVector.y * holeSpeed * deltaTime;



        //=========================================================================
        // PART 1: HOLE MOVEMENT
        // The code above allows the user to move the hole in the X and Z directions.
        // However, we want to add some boundary checks to prevent the hole from
        // leaving the boundaries, which are defined in the playArea member variable.
        
        // ADD YOUR CODE
        // add some boundary checks to prevent the hole from
        // leaving the boundaries. 
        // console.log('holePx: ', this.hole.position.z);
        // Updating the X-value of the hole
        if (this.hole.position.x <= (this.playArea.min.x + this.holeRadius)) {
            this.hole.position.x = this.playArea.min.x + this.holeRadius;
        } else if (this.hole.position.x >= (this.playArea.max.x - this.holeRadius)) {
            this.hole.position.x = this.playArea.max.x - this.holeRadius;
        }
        // Updating the Z-value of the hole
        if (this.hole.position.z <= this.playArea.min.z + this.holeRadius) {
            this.hole.position.z = this.playArea.min.z + this.holeRadius;
        } else if (this.hole.position.z >= this.playArea.max.z- this.holeRadius) {
            this.hole.position.z = this.playArea.max.z - this.holeRadius;
        }
        //=========================================================================

        // Update rigid body physics
        // You do not need to modify this code
        this.rigidBodies.children.forEach((transform: gfx.Node3) => {
            const rb = transform as RigidBody;
            rb.update(deltaTime);
        });

        // Handle object-object collisions
        // You do not need to modify this code
        for(let i=0; i < this.rigidBodies.children.length; i++)
        {
            for(let j=i+1; j < this.rigidBodies.children.length; j++)
            {
                const rb1 = this.rigidBodies.children[i] as RigidBody;
                const rb2 = this.rigidBodies.children[j] as RigidBody;

                this.handleObjectCollision(rb1, rb2, frictionSlowDown)
            }
        }

        // Handle object-environment collisions
        // You do not need to modify this code
        this.rigidBodies.children.forEach((transform: gfx.Node3) => {
            const rb = transform as RigidBody;

            // The object has fallen far enough to score a point
            if(rb.position.y < -10)
            {
                this.holeSound.play(); 

                // Remove the object from the scene
                rb.remove();

                //Check if we captured the last sphere
                if(this.rigidBodies.children.length == 0)
                    this.startNextStage();
                else
                    this.setHoleRadius(this.holeRadius * holeScaleFactor);
            }
            // The object is within range of the hole and can fit inside
            else if(rb.getRadius() < this.holeRadius && rb.position.distanceTo(this.hole.position) < this.holeRadius)
            {
                this.handleRimCollision(rb, frictionSlowDown);
            }
            // The object has not fallen all the way into the hole yet
            else if(rb.position.y + rb.getRadius() > 0)
            {
                this.handleBoundaryCollision(rb, frictionSlowDown);
            }
        });
    }

    handleBoundaryCollision(rb: RigidBody, frictionSlowDown: number): void
    {


        // PART 3: BOUNDARY COLLISIONS
        
        // As a first step, you should review the explanations about detecting collisions,
        // updating position after a collision, and updating velocity after a collision.
        // In this method, you will need to:
        // 1. Check if the sphere is intersecting each boundary of the play area. 
        // 2. Correct the intersection by adjusting the position of the sphere.
        // 3. Compute the reflected velocity after the collision. Note that because the ground
        // and walls are aligned with the XYZ axes, this is the simple case of negating one
        // dimension of the velocity vector.
        // 4. After a collision, slow down the velocity due to friction.

        // ADD YOUR CODE HERE
        const yMin = this.playArea.min.y; // ground
        const xMin = this.playArea.min.x; // left wall
        const xMax = this.playArea.max.x; // right wall 
        const zMin = this.playArea.min.z // front wall
        const zMax = this.playArea.max.z; // back wall
        const raduis = rb.getRadius(); // rb radius

        // hitting/falling on the ground
        if ((rb.position.y - raduis) < yMin) {
            rb.position.y = yMin + raduis;
            // Negating Y value of the velocity of the sphere
            rb.velocity.y *= -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        // Hitting the right wall (+,+,-)
        if ((rb.position.x + raduis) > xMax) {
            rb.position.x = xMax - raduis;
            // Nagating the x coordinate of the velocity
            rb.velocity.x *= -1; 
            rb.velocity.multiplyScalar(frictionSlowDown);
        }

        // hitting the left wall (-,+,+)
        if ((rb.position.x - raduis) < xMin) {
            rb.position.x = xMin + raduis;
            // negating x value of the velocity
            rb.velocity.x *= -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        // // hitting the the front wall 
        if ((rb.position.z - raduis) < zMin) {
            rb.position.z = zMin + raduis;
            // Negating the z value of the velocity
            rb.velocity.z *= -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        // hitting the back wall
        if ( (rb.position.z + raduis) > zMax) {
            rb.position.z  = zMax - raduis;
            // Negating the z value of velocity
            rb.velocity.z = -rb.velocity.z;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
    }

      // const dir = gfx.Vector3.subtract(rb1.position, rb2.position);
        // const currDistance = dir.length();
        // const desiredDistance = rb1.getRadius() + rb2.getRadius();

    handleObjectCollision(rb1: RigidBody, rb2: RigidBody, frictionSlowDown: number): void
    {
        
        // Part 4: Handling Rigid Body Collisions
        // Complete the code in the handleObjectCollision() to detect contact between spheres. (2)
        // If a collision is detected, correct the position of each sphere so they are no longer intersecting. (2)
        // Compute the reflected velocity of each sphere using the physics equations described above. (2)

        // ADD YOUR CODE HERE
        // detecting whether a collision has occurred, a
        // and second, resolving the collision by updating the positions and velocities of the colliding objects
        // two spheres have collided if the distance between their centers is less than or equal to the sum of their radii.
       
      
        const distanceBetweenSphere = rb1.position.distanceTo(rb2.position);
        const desiredDistance = rb1.getRadius() + rb2.getRadius();

        if(distanceBetweenSphere <= desiredDistance){ 
            console.log("Spheres have collided");

            const dir = gfx.Vector3.subtract(rb1.position, rb2.position);
            dir.normalize();

            const currDistance = gfx.Vector3.subtract(rb1.position, rb2.position).length();
            const disToMove = desiredDistance - currDistance;
            dir.multiplyScalar(disToMove/2);

            // Update positions
            rb1.position.add(dir);
            dir.invert();
            rb2.position.add(dir);

            // reflactive velocities
            const vrel1 = gfx.Vector3.subtract(rb1.velocity, rb2.velocity);
            const vrel2 = gfx.Vector3.subtract(rb2.velocity, rb1.velocity);
            
            // collison normal 
            const norm1 = gfx.Vector3.subtract(rb1.position, rb2.position);
            const norm2 = gfx.Vector3.subtract(rb2.position, rb1.position);
            norm1.normalize();
            norm2.normalize();

            // Set the new velocity of each sphere by reflecting its relative velocity about the collision normal
            const vsphere1 = gfx.Vector3.reflect(vrel1, norm1);
            vsphere1.multiplyScalar(frictionSlowDown * 0.5);
            rb1.velocity= (vsphere1);
            const vsphere2 = gfx.Vector3.reflect(vrel2, norm2);
            vsphere2.multiplyScalar(frictionSlowDown*0.5);
            rb2.velocity=(vsphere2);
        }
    }
    // This method handles collisions between the rigid body and the rim
    // of the hole. You do not need to modify this code
    handleRimCollision(rb: RigidBody, frictionSlowDown: number): void
    {
        // Compute the rigid body's position, ignoring any vertical displacement
        const rbOnGround = new gfx.Vector3(rb.position.x, 0, rb.position.z);

        // Find the closest point along the rim of the hole
        const rimPoint = gfx.Vector3.subtract(rbOnGround, this.hole.position);
        rimPoint.normalize();
        rimPoint.multiplyScalar(this.holeRadius);
        rimPoint.add(this.hole.position.clone());

        // If the rigid body is colliding with the point on the rim
        if(rb.position.distanceTo(rimPoint) < rb.getRadius())
        {
            // Correct the position of the rigid body so that it is no longer intersecting
            const correctionDistance = rb.getRadius() - rb.position.distanceTo(rimPoint) ;
            const correctionMovement = gfx.Vector3.subtract(rb.position, rimPoint);
            correctionMovement.normalize();
            correctionMovement.multiplyScalar(correctionDistance);
            rb.position.add(correctionMovement);

            // Compute the collision normal
            const rimNormal = gfx.Vector3.subtract(this.hole.position, rimPoint);
            rimNormal.normalize();

            // Reflect the velocity about the collision normal
            rb.velocity.reflect(rimNormal);

            // Slow down the velocity due to friction
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
    }

    // This method advances to the next stage of the game
    startNextStage(): void
    {
        // Create a test scene when the user presses start
        if(this.stage == 0)
        {
            this.textPlane.visible = false;
            
            const rb1 = new RigidBody(this.sphere);
            rb1.material = new gfx.GouraudMaterial();
            rb1.material.setColor(gfx.Color.RED);
            rb1.position.set(0, 0.25, 7.5);
            rb1.setRadius(0.25);
            rb1.velocity.set(0, 10, -4);
            this.rigidBodies.add(rb1);
    
            const rb2 = new RigidBody(this.sphere);
            rb2.material = new gfx.GouraudMaterial();
            rb2.material.setColor(gfx.Color.GREEN);
            rb2.position.set(-8, 1, -5);
            rb2.setRadius(0.5);
            rb2.velocity.set(4, 0, 0);
            this.rigidBodies.add(rb2);
    
            const rb3 = new RigidBody(this.sphere);
            rb3.material = new gfx.GouraudMaterial();
            rb3.material.setColor(gfx.Color.BLUE);
            rb3.position.set(8, 1, -4.5);
            rb3.setRadius(0.5);
            rb3.velocity.set(-9, 0, 0);
            this.rigidBodies.add(rb3);
    
            const rb4 = new RigidBody(this.sphere);
            rb4.material = new gfx.GouraudMaterial();
            rb4.material.setColor(gfx.Color.YELLOW);
            rb4.position.set(0, 0.25, -12);
            rb4.setRadius(0.5);
            rb4.velocity.set(15, 10, -20);
            this.rigidBodies.add(rb4);
        }
        // The user has finished the test scene
        else if(this.stage == 1)
        {
            this.setHoleRadius(0.5);
            
            // PART 5: CREATE YOUR OWN GAME
            // In this part, you should create your own custom scene!  You should
            // refer the code above to see how rigid bodies were created for the
            // test scene. You have a lot of freedom to create your own game,
            // as long as it meets the minimum requirements in the rubric.  
            // Creativity is encouraged!

            // ADD YOUR CODE HERE
            
            // 8 a new rigid bodies (sphere) with a material
            const rigidBody1 = new RigidBody(this.sphere)
            rigidBody1.material = new gfx.GouraudMaterial()
            rigidBody1.material.setColor(new gfx.Color(0.26, 1, 0.39))
            rigidBody1.position.set(0, 0.20, 10); // Set the position
            rigidBody1.setRadius(0.25) // Set the radius
            rigidBody1.velocity.set(6, 3, 4) // Set the initial velocity
            this.rigidBodies.add(rigidBody1) // Add it to the scene

            const rigidBody2 = new RigidBody(this.sphere);
            rigidBody2.material = new gfx.GouraudMaterial();
            rigidBody2.material.setColor(new gfx.Color(0.80, 0.36, 0.39));
            rigidBody2.position.set(-5, 3, -8); // Set the position
            rigidBody2.setRadius(0.35); // Set the radius
            rigidBody2.velocity.set(-3, 6, 3); // Set the initial velocity
            this.rigidBodies.add(rigidBody2); // Add it to the scene
            
            const rigidBody3 = new RigidBody(this.sphere);
            rigidBody3.material = new gfx.GouraudMaterial();
            rigidBody3.material.setColor(new gfx.Color(255/255, 191/255, 0/255));
            rigidBody3.position.set(-1, 2, -4); // Set the position
            rigidBody3.setRadius(0.45); // Set the radius
            rigidBody3.velocity.set(-6, 5, 10); // Set the initial velocity
            this.rigidBodies.add(rigidBody3); // Add it to the scene

            const rigidBody4 = new RigidBody(this.sphere);
            rigidBody4.material = new gfx.GouraudMaterial();
            rigidBody4.material.setColor(new gfx.Color(223/255, 255/255, 0/255));
            rigidBody4.position.set(0, 0.25, 7.5); // Set the position
            rigidBody4.setRadius(0.60); // Set the radius
            rigidBody4.velocity.set(8, 10, -4); // Set the initial velocity
            this.rigidBodies.add(rigidBody4); // Add it to the scene

            const rigidBody5 = new RigidBody(this.sphere);
            rigidBody5.material = new gfx.GouraudMaterial();
            rigidBody5.material.setColor(new gfx.Color(222/255, 49/255, 99/255));
            rigidBody5.position.set(5, 4, 9); // Set the position
            rigidBody5.setRadius(0.75); // Set the radius
            rigidBody5.velocity.set(4, 0, 0); // Set the initial velocity
            this.rigidBodies.add(rigidBody5); // Add it to the scene

            const rigidBody6 = new RigidBody(this.sphere);
            rigidBody6.material = new gfx.GouraudMaterial();
            rigidBody6.material.setColor(new gfx.Color(100/255, 149/255, 237/255));
            rigidBody6.position.set(8, 1, -4.5) // Set the position
            rigidBody6.setRadius(0.90); // Set the radius
            rigidBody6.velocity.set(15, 8, 23); // Set the initial velocity
            this.rigidBodies.add(rigidBody6); // Add it to the scene

            const rigidBody7 = new RigidBody(this.sphere);
            rigidBody7.material = new gfx.GouraudMaterial();
            rigidBody7.material.setColor(new gfx.Color(204/255, 204/255, 255/255));
            rigidBody7.position.set(6, 2, -3.5);// Set the position
            rigidBody7.setRadius(0.80); // Set the radius
            rigidBody7.velocity.set(16, 10, 5); // Set the initial velocity
            this.rigidBodies.add(rigidBody7); // Add it to the scene

            const rigidBody8 = new RigidBody(this.sphere);
            rigidBody8.material = new gfx.GouraudMaterial();
            rigidBody8.material.setColor(new gfx.Color(128/255, 128/255, 128/255));
            rigidBody8.position.set(0, 0.5, -10);// Set the position
            rigidBody8.setRadius(0.95); // Set the radius
            rigidBody8.velocity.set(10, 15, -15);// Set the initial velocity
            this.rigidBodies.add(rigidBody8); // Add it to the scene
        }
        // The user has finished the game
        else
        {
            this.text.text = 'YOU WIN!';
            this.text.updateTextureImage();
            this.textPlane.visible = true;
            this.winSound.play();
        }

        this.stage++;
    }

    // Set the radius of the hole and update the scale of the
    // hole mesh so that it is displayed at the correct size.
    setHoleRadius(radius: number): void
    {
        this.holeRadius = radius;
        this.hole.scale.set(radius, 1, radius);
    }

    // Set the x or y components of the input vector when either
    // the WASD or arrow keys are pressed.
    onKeyDown(event: KeyboardEvent): void 
    {
        if(event.key == 'w' || event.key == 'ArrowUp')
            this.inputVector.y = 1;
        else if(event.key == 's' || event.key == 'ArrowDown')
            this.inputVector.y = -1;
        else if(event.key == 'a' || event.key == 'ArrowLeft')
            this.inputVector.x = -1;
        else if(event.key == 'd' || event.key == 'ArrowRight')
            this.inputVector.x = 1;
    }

    // Reset the x or y components of the input vector when either
    // the WASD or arrow keys are released.
    onKeyUp(event: KeyboardEvent): void 
    {
        if((event.key == 'w' || event.key == 'ArrowUp') && this.inputVector.y == 1)
            this.inputVector.y = 0;
        else if((event.key == 's' || event.key == 'ArrowDown') && this.inputVector.y == -1)
            this.inputVector.y = 0;
        else if((event.key == 'a' || event.key == 'ArrowLeft')  && this.inputVector.x == -1)
            this.inputVector.x = 0;
        else if((event.key == 'd' || event.key == 'ArrowRight')  && this.inputVector.x == 1)
            this.inputVector.x = 0;
    }

    // These mouse events are not necessary to play the game on a computer. However, they
    // are included so that the game is playable on touch screen devices without a keyboard.
    onMouseMove(event: MouseEvent): void 
    {
        // Only update the mouse position if only the left button is currently pressed down
        if(event.buttons == 1)
        {
            const mouseCoordinates = this.getNormalizedDeviceCoordinates(event.x, event.y);

            if(mouseCoordinates.x < -0.5)
                this.inputVector.x = -1;
            else if(mouseCoordinates.x > 0.5)
                this.inputVector.x = 1;

            if(mouseCoordinates.y < -0.5)
                this.inputVector.y = -1;
            else if(mouseCoordinates.y > 0.5)
                this.inputVector.y = 1;
        }
    }

    onMouseUp(event: MouseEvent): void
    {
        // Left mouse button
        if(event.button == 0)
            this.inputVector.set(0, 0);
    }

    onMouseDown(event: MouseEvent): void 
    {
        if(this.stage==0)
            this.startNextStage();
        else
            this.onMouseMove(event);
    }
}