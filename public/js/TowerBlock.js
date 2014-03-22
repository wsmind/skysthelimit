function TowerBlock(scene, loader, blockData, position)
{
	this.mesh = null
	this.boundingBox = null
	
	var self = this
	loader.load(blockData.model, function(geometry, materials)
	{
		self.mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))
		scene.add(self.mesh)
		self.mesh.castShadow = true
		self.mesh.receiveShadow = true
		
		self.mesh.position = new THREE.Vector3(position.x, position.y, position.z)
		
		if (blockData.boundingBox)
		{
			self.boundingBox = blockData.boundingBox.clone()
			self.boundingBox.min.add(self.mesh.position)
			self.boundingBox.max.add(self.mesh.position)
			
			if (blockData.debugBoundingBoxes)
			{
				var debugBox = new THREE.BoxHelper() // [-1, 1]^3
				var size = self.boundingBox.size()
				var center = self.boundingBox.center()
				debugBox.scale.set(size.x * 0.5, size.y * 0.5, 0.5)
				debugBox.position = new THREE.Vector3(center.x, center.y, 0.5)
				scene.add(debugBox)
			}
		}
	})
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

/*TowerBlock.prototype.update = function(time, dt)
{
	// not called
}
*/