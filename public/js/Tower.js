function Tower(scene, loader, socket)
{
	this.faces = []
	for (var i = 0; i < towerData.faces.length; i++)
	{
		var faceData = towerData.faces[i]
		var face = new TowerFace(scene, loader, i, faceData)
		this.faces.push(face)
	}
}

Tower.prototype.update = function(time, dt)
{
}
