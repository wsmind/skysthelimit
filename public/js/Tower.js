function Tower(scene, loader, socket)
{
	this.mesh = null
	
	var self = this
	loader.load("data/test-object.js", function(geometry, materials)
	{
		self.mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))
		scene.add(self.mesh)
		self.mesh.castShadow = true
		self.mesh.receiveShadow = true
		
		self.mesh.position.set(0, 2, 0)
	})
	
	socket.on("test", function(data)
	{
		if (self.mesh)
			self.mesh.position.y = data.y
	})
}

Tower.prototype.update = function(time, dt)
{
	if (this.mesh)
		this.mesh.rotation.y = time * 0.001
}
