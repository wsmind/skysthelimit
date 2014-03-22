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
		
		self.mesh.position = position
	})
}

TowerBlock.prototype.update = function(time, dt)
{
	// not called
}
