function Player(scene, loader, socket, isMaster, faceIndex)
{
	// KEYS:
	//	- 37: left
	//	- 39: right
	//	- 32: space
	//	- 38: up
	//	- 40: down
	this.keys = [37, 39, 32, 38, 40]

	this.mesh = null
	this.isMaster = isMaster
	this.faceIndex = faceIndex
	this.socket = socket
	
	this.rightPressed = false
	this.leftPressed = false
	this.jumpPressed = false
	this.triggerPressed = false
	
	//this.groundSpeed = .01
	this.airSpeed = .005
	this.speed = new THREE.Vector2(0.0, 0.0)
	this.grounded = false
	this.animations = {}
	this.currentAnimation = null
	this.stepTime = 0
	
	var self = this
	loader.load("data/girl.js", function(geometry, materials)
	{
		self.mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials))
		scene.add(self.mesh)
		
		self.mesh.position.set(3, 0, 0.5)
		
		var materials = self.mesh.material.materials
		for (var k in materials)
		{
			materials[k].skinning = true
		}
		
		for (var i = 0; i < self.mesh.geometry.animations.length; ++i)
		{
			if (THREE.AnimationHandler.get(self.mesh.geometry.animations[i].name) == null)
				THREE.AnimationHandler.add(self.mesh.geometry.animations[i])
		}
		
		self.animations.idle = new THREE.Animation(self.mesh, "idle", THREE.AnimationHandler.CATMULLROM)
		self.animations.walk = new THREE.Animation(self.mesh, "walk", THREE.AnimationHandler.CATMULLROM)
		self.currentAnimation = self.animations.idle
		self.currentAnimation.play()
	})
	
	if (this.isMaster)
	{
		document.addEventListener('keydown', function(event)
		{
			if (self.keys.indexOf(event.keyCode) != -1)
				event.preventDefault()
			
			switch (event.keyCode)
			{
				case 37: self.leftPressed = true; break;
				case 39: self.rightPressed = true; break;
				case 32: self.jumpPressed = true; break;
				case 38: self.triggerPressed = true; break;
			}
		})
		
		document.addEventListener('keyup', function(event)
		{
			if (self.keys.indexOf(event.keyCode) != -1)
				event.preventDefault()
			
			switch (event.keyCode)
			{
				case 37: self.leftPressed = false; break;
				case 39: self.rightPressed = false; break;
				case 32: self.jumpPressed = false; break;
			}
		})
	}
	else
	{
		socket.on("playerMoved", function(data)
		{
			if (!self.mesh)
			
				return
			if (data.faceIndex == self.faceIndex)
				self.mesh.position = data.position
		})
	}
}

Player.prototype.changeAnimation = function(nextAnimation)
{
	if (this.currentAnimation.data.name != nextAnimation)
	{
		this.currentAnimation.stop()
		this.currentAnimation = this.animations[nextAnimation]
		this.currentAnimation.play()
	}
}

Player.prototype.update = function(time, dt, towerFace)
{
	if (!this.mesh)
		return
	
	if (!this.isMaster)
		return
	
	// Trigger
	if (this.triggerPressed)
	{
		this.triggerPressed = false
		var block = towerFace.getBlockAt({x: this.mesh.position.x, y: this.mesh.position.y + 0.5})
		if (block.targets != null)
		{
			for (var i = 0; i < block.targets.length; ++i)
			{
				var faceIndex = (Number(this.faceIndex) + block.targets[i].faceOffset + 4) % 4
				var blockIndex = block.targets[i].blockIndex
				this.socket.emit("activateBlock", {faceIndex: faceIndex, blockIndex: blockIndex})
			}
		}
	}
	
	var dir = 0
	if (this.leftPressed)
		dir -= 1
	if (this.rightPressed)
		dir += 1
	
	this.speed.x = /*this.grounded > 0 ?*/ this.airSpeed;// : this.groundSpeed
	this.speed.x *= dir
	
	if (this.jumpPressed && this.grounded)
	{
		this.speed.y = 0.012
		game.musicManager.playSfx("jump")
		this.changeAnimation("idle")
	}
	
	if ((dir != 0) && this.grounded)
	{
		this.stepTime += dt * 0.001
		if (this.stepTime >= soundData.stepDuration)
		{
			game.musicManager.playSfx("walk")
			this.stepTime -= soundData.stepDuration
		}
		
		this.changeAnimation("walk")
		this.mesh.rotation.y = Math.PI * 0.5 * dir
	}
	else
		this.changeAnimation("idle")
	
	if (this.currentAnimation != null)
	{
		this.currentAnimation.update(dt / 1000)
	}
	
	this.speed.y -= 0.00004 * dt
	this.speed.y = Math.max(this.speed.y, -0.015)
	
	this.mesh.position.x += this.speed.x * dt
	this.mesh.position.y += this.speed.y * dt
	
	// compute current bounding box
	var min = new THREE.Vector2(-0.2, 0.0)
	var max = new THREE.Vector2(0.2, 1.1)
	min.add(this.mesh.position)
	max.add(this.mesh.position)
	this.boundingBox = new THREE.Box2(min, max)
	
	/*tempBox = new THREE.BoxHelper() // [-1, 1]^3
	var size = this.boundingBox.size()
	var center = this.boundingBox.center()
	tempBox.scale.set(size.x * 0.5, size.y * 0.5, 0.5)
	tempBox.position = new THREE.Vector3(center.x, center.y, 0.5)*/
	
	// apply collision and trigger events
	var self = this
	var oldGrounded = this.grounded
	this.grounded = false
	towerFace.collide(this, function(collisionInfo, block)
	{
		var speedDotNormal = self.speed.dot(collisionInfo.normal)
		
		// exclude this contact if it is separating
		if (speedDotNormal > 0)
			return
		
		var offsetX = collisionInfo.normal.x * collisionInfo.depth
		var offsetY = collisionInfo.normal.y * collisionInfo.depth
		self.mesh.position.x += offsetX
		self.mesh.position.y += offsetY
		self.boundingBox.min.x += offsetX
		self.boundingBox.min.y += offsetY
		self.boundingBox.max.x += offsetX
		self.boundingBox.max.y += offsetY
		
		// keep only tangent velocity
		var normalVelocity = collisionInfo.normal.clone()
		normalVelocity.multiplyScalar(speedDotNormal)
		self.speed.sub(normalVelocity)
		
		// check if we collided with the ground
		if (collisionInfo.normal.y > Math.abs(collisionInfo.normal.x))
			self.grounded = true
	})
	
	// ground
	if ((this.mesh.position.y <= 0) && (this.speed.y <= 0))
	{
		this.mesh.position.y = 0
		this.speed.y = 0
		this.grounded = true
	}
	
	// left wall
	if ((this.mesh.position.x <= 0) && (this.speed.x <= 0))
	{
		this.mesh.position.x = 0
		this.speed.x = 0
	}
	
	// right wall
	if ((this.mesh.position.x >= towerData.faceWidth) && (this.speed.x >= 0))
	{
		this.mesh.position.x = towerData.faceWidth
		this.speed.x = 0
	}
	
	// play a sound when falling on the ground
	if ((this.grounded != oldGrounded) && this.grounded)
	{
		this.stepTime = 0.0
		game.musicManager.playSfx("hitGround")
	}
	
	// broadcast new position to other players
	this.socket.emit("movePlayer", {position: this.mesh.position, faceIndex: this.faceIndex})
}
