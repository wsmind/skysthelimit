function Tower(scene, loader, socket)
{
	this.faces = []
	for (var i = 0; i < towerData.faces.length; i++)
	{
		var faceData = towerData.faces[i]
		this.faces.push(new TowerFace(scene, loader, i * 2 + 0, faceData))
		this.faces.push(new TowerFace(scene, loader, i * 2 + 1, faceData))
	}
}

Tower.prototype.update = function(time, dt)
{
}
