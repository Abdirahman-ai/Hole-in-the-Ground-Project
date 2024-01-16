/* Assignment 2: Hole in the Ground
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'

export class RigidBody extends gfx.Mesh3
{
    // Parameter to approximate downward acceleration due to gravity
    public static gravity = -10;

    // The current velocity of the rigid body
    public velocity: gfx.Vector3;

    // The current radius of the rigid body's collision sphere
    private radius: number;

    // accelaration


    constructor(baseMesh: gfx.Mesh3)
    {   
        super();

        // Copy over all the mesh data from the base mesh
        this.positionBuffer = baseMesh.positionBuffer;
        this.normalBuffer = baseMesh.normalBuffer;
        this.colorBuffer = baseMesh.colorBuffer;
        this.indexBuffer = baseMesh.indexBuffer;
        this.texCoordBuffer = baseMesh.texCoordBuffer;
        this.vertexCount = baseMesh.vertexCount;
        this.hasVertexColors = baseMesh.hasVertexColors;
        this.triangleCount = baseMesh.triangleCount;
        this.material = baseMesh.material;
        this.boundingBox = baseMesh.boundingBox;
        this.boundingSphere = baseMesh.boundingSphere;
        this.visible = baseMesh.visible;

        this.velocity = new gfx.Vector3();
        this.radius = baseMesh.boundingSphere.radius;

        // Part 2.1 - define the downward acceleration due to gravity.
        
    }

    update(deltaTime: number): void
    {

        // PART 2: RIGID BODY PHYSICS
        // In this part, you will need to complete the code in the RigidBody class to make the spheres move according to the physics model described above.
        // First, you should define the downward acceleration due to gravity. 
        // Next, compute the update the velocity and position of the object. When these steps are working correctly, the red sphere will be launched in an upwards arc and then fall inside the hole.
        // In this part, you should use the formulas described in class to
        // 1. Compute the acceleration vector a
        // 2. Update the velocity, v' = v + a * dt
        // 3. Update the position, p' = p + v * dt
        
        // ADD YOUR CODE HERE
        const accelaration = new gfx.Vector3(0, RigidBody.gravity, 0)
        // scaling the accelaration by dt (a * dt)
        accelaration.multiplyScalar(deltaTime);
        // 2. Update the velocity, v' = v + a * dt
        this.velocity.add(accelaration);

        // scalling the velocity by dt (v * dt)
        const updatedV = gfx.Vector3.multiplyScalar(this.velocity, deltaTime);
        // 3. Update the position, p' = p + v * dt
        this.position.add(updatedV);
    }

    // You can use this method to set the radius of the collision sphere.  This will also
    // properly scale the object that it is displayed within the collision sphere.
    setRadius(radius: number): void
    {
        this.radius = radius;
        
        const scaleFactor = this.radius / this.boundingSphere.radius;
        this.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    // Get the current radius of the collision sphere.
    getRadius(): number
    {
        return this.radius;
    }
}
