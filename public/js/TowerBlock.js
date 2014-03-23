function TowerBlock(scene, faceGeometry, blockData, position)
{
	this.boundingBox = null
	this.targets = null
	this.position = new THREE.Vector3(position.x, position.y, position.z)
	
	var mesh = new THREE.Mesh(blockData.geometry)
	mesh.position = this.position.clone()
	
	THREE.GeometryUtils.merge(faceGeometry, mesh, blockData.geometry.materialIndexOffset)
	
	if (blockData.boundingBox)
	{
		this.boundingBox = blockData.boundingBox.clone()
		this.boundingBox.min.add(position)
		this.boundingBox.max.add(position)
		
		if (blockData.debugBoundingBoxes)
		{
			var debugBox = new THREE.BoxHelper() // [-1, 1]^3
			var size = this.boundingBox.size()
			var center = this.boundingBox.center()
			debugBox.scale.set(size.x * 0.5, size.y * 0.5, 0.5)
			debugBox.position = new THREE.Vector3(center.x, center.y, 0.5)
			scene.add(debugBox)
		}
	}
	
	this.type = blockData.type || "wall"
	
	this.activated = false
	if (blockData.activationModel)
	{
		var mesh = new THREE.Mesh(blockData.activationGeometry, blockData.activationMaterial)
		mesh.position = this.position.clone()
		scene.add(mesh)
	}
}

THREE.Box2.prototype.collide = function(box)
{
	var collisionInfo = {
		normal: null,
		depth: null
	}
	
	function testOverlap(overlap, normal)
	{
		if (overlap < 0)
			return false
		
		if ((collisionInfo.depth === null) || (overlap < collisionInfo.depth))
		{
			// new minimal overlap found
			collisionInfo.depth = overlap
			collisionInfo.normal = normal
		}
		
		return true
	}
	
	if (!testOverlap(this.max.x - box.min.x, new THREE.Vector2(1, 0))) return null
	if (!testOverlap(box.max.x - this.min.x, new THREE.Vector2(-1, 0))) return null
	if (!testOverlap(this.max.y - box.min.y, new THREE.Vector2(0, 1))) return null
	if (!testOverlap(box.max.y - this.min.y, new THREE.Vector2(0, -1))) return null
	
	return collisionInfo
}

// callback(collisionInfo, block)
TowerBlock.prototype.collide = function(player, callback)
{
	if (!this.boundingBox)
		return
	
	var collisionInfo = this.boundingBox.collide(player.boundingBox)
	if (collisionInfo)
		callback(collisionInfo, this)
}

TowerBlock.prototype.activate = function()
{
	game.musicManager.playSfx("slidingBlock")
	if (this.boundingBox == null)
	{
		this.boundingBox = new THREE.Box2(new THREE.Vector2(0.0, 0.8), new THREE.Vector2(1.0, 1.0))
		this.boundingBox.min.add(this.position)
		this.boundingBox.max.add(this.position)
	}
	else
		this.boundingBox = null
}

/*TowerBlock.prototype.update = function(time, dt)
{
	// not called
}
*/