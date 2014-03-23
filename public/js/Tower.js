function Tower()
{
}

Tower.prototype.load = function(scene, loader, masterFace, callback)
{
	var self = this
	var loadedBlockTypes = 0
	var allTowerMaterials = []
	function loadBlockType(blockData)
	{
		loader.load(blockData.model, function(geometry, materials)
		{
			blockData.geometry = geometry
			blockData.geometry.materialIndexOffset = allTowerMaterials.length
			allTowerMaterials = allTowerMaterials.concat(materials)
			loadedBlockTypes++
			
			if (loadedBlockTypes == towerData.blocks.length)
			{
				self.material = new THREE.MeshFaceMaterial(allTowerMaterials)
				self.loadFaces(scene, masterFace)
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

Tower.prototype.loadFaces = function(scene, masterFace)
{
	this.faces = []
	for (var i = 0; i < towerData.faces.length; i++)
	{
		var faceData = towerData.faces[i]
		this.faces.push(new TowerFace(scene, i * 2 + 0 - masterFace, faceData, this.material))
		this.faces.push(new TowerFace(scene, i * 2 + 1 - masterFace, faceData, this.material))
	}
}
