function TowerBlock(scene, loader, blockData, position)
{
	this.mesh = null
	
	var self = this
	loader.load(blockData.model, function(geometry, materials)
	{
		self.mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))
		scene.add(self.mesh)
		self.mesh.castShadow = true
		self.mesh.receiveShadow = true
		
		self.mesh.position = new THREE.Vector3(position.x, position.y, position.z)
		
		if (blockData.model == "data/platform.js")
		{
			var min = new THREE.Vector2(0.0, 0.8)
			var max = new THREE.Vector2(1.0, 1.0)
			min.add(self.mesh.position)
			max.add(self.mesh.position)
			self.boundingBox = new THREE.Box2(min, max)
			
			var debugBox = new THREE.BoxHelper() // [-1, 1]^3
			var size = self.boundingBox.size()
			var center = self.boundingBox.center()
			debugBox.scale.set(size.x * 0.5, size.y * 0.5, 0.5)
			scene.add(debugBox)
			//debugBox.position = self.mesh.position.clone()
			debugBox.position = new THREE.Vector3(center.x, center.y, 0.5)
		}
	})
}

TowerBlock.prototype.collide = function(player)
{
}

/*TowerBlock.prototype.update = function(time, dt)
{
	// not called
}
*/