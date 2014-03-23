function Tower()
{
}

Tower.prototype.load = function(scene, loader, masterFace, callback)
{
	var self = this
	var loadedBlockTypes = 0
	function loadBlockType(blockData)
	{
		loader.load(blockData.model, function(geometry, materials)
		{
			blockData.geometry = geometry
			blockData.material = new THREE.MeshFaceMaterial(materials)
			loadedBlockTypes++
			
			if (loadedBlockTypes == towerData.blocks.length)
			{
				self.loadFaces(scene, loader, masterFace)
				callback()
			}
		})
	}
	
	for (var i = 0; i < towerData.blocks.length; i++)
	{
		var blockData = towerData.blocks[i]
		loadBlockType(blockData)
	}
}

Tower.prototype.loadFaces = function(scene, loader, masterFace)
{
	this.faces = []
	for (var i = 0; i < towerData.faces.length; i++)
	{
		var faceData = towerData.faces[i]
		this.faces.push(new TowerFace(scene, loader, i * 2 + 0 - masterFace, faceData))
		this.faces.push(new TowerFace(scene, loader, i * 2 + 1 - masterFace, faceData))
	}
}
