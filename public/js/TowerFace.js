function TowerFace(scene, faceIndex, faceData, material)
{
	this.subscene = new THREE.Object3D()
	scene.add(this.subscene)
	
	// position the face according to its index
	var angle = Math.PI * 0.5 * faceIndex
	var radius = Math.sqrt(towerData.faceWidth * towerData.faceWidth * 0.5)
	this.subscene.position.set(Math.cos(angle - Math.PI * 0.75) * radius, 0.0, -Math.sin(angle - Math.PI * 0.75) * radius)
	this.subscene.rotation.y = angle
	
	var faceGeometry = new THREE.Geometry()
	
	this.blocks = []
	for (var i = 0; i < faceData.length; i++)
	{
		var x = i % towerData.faceWidth
		var y = Math.floor(i / towerData.faceWidth)
		if (faceData[i] < towerData.blocks.length)
		{
			var blockData = towerData.blocks[faceData[i]]
			this.blocks.push(new TowerBlock(this.subscene, faceGeometry, blockData, {x: x, y: y, z: 0}))
		}
	}
	
	faceGeometry.computeTangents()
	
	var mesh = new THREE.Mesh(faceGeometry, material)
	mesh.castShadow = true
	mesh.receiveShadow = true
	this.subscene.add(mesh)
}

TowerFace.prototype.collide = function(player, callback)
{
	for (var i = 0; i < this.blocks.length; i++)
	{
		var block = this.blocks[i]
		block.collide(player, callback)
	}
}
