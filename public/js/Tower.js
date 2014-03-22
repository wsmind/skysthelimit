function Tower(scene, loader, socket, masterFace)
{
	this.faces = []
	for (var i = 0; i < towerData.faces.length; i++)
	{
		var faceData = towerData.faces[i]
		this.faces.push(new TowerFace(scene, loader, i * 2 + 0 - masterFace, faceData))
		this.faces.push(new TowerFace(scene, loader, i * 2 + 1 - masterFace, faceData))
	}
}

Tower.prototype.update = function(time, dt)
{
}
