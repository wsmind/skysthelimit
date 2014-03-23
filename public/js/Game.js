function Game()
{
	this.currentTime = null
	
	var gameDiv = document.getElementById("game")
	
	this.renderer = new THREE.WebGLRenderer()
	this.renderer.setSize(1280, 720)
	this.renderer.shadowMapEnabled = true
	this.renderer.setClearColor(0xddefff, 1)
	gameDiv.appendChild(this.renderer.domElement)
	
	this.scene = new THREE.Scene()
	
	this.camera = new THREE.PerspectiveCamera(90.0, 16.0 / 9.0, 0.1, 1000.0)
	this.scene.add(this.camera)
	this.camera.position.set(0, 5, 20)
	
	this.plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshLambertMaterial())
	this.scene.add(this.plane)
	this.plane.rotation.x = -Math.PI * 0.5
	this.plane.castShadow = true
	this.plane.receiveShadow = true
	
	this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
	this.hemiLight.color.setHSL(0.6, 1, 0.6)
	this.hemiLight.groundColor.setHSL(0.095, 1, 0.75)
	this.hemiLight.position.set(0, 500, 0)
	this.scene.add(this.hemiLight)
	
	this.dirLight = new THREE.DirectionalLight(0xffffff, 1)
	this.dirLight.color.setHSL(0.1, 1, 0.95)
	this.dirLight.position.set(-1, 1.75, 1)
	this.dirLight.position.multiplyScalar(50)
	this.dirLight.castShadow = true
	var shadowSize = 20
	this.dirLight.shadowCameraLeft = -shadowSize;
	this.dirLight.shadowCameraRight = shadowSize;
	this.dirLight.shadowCameraTop = shadowSize;
	this.dirLight.shadowCameraBottom = -shadowSize;
	this.dirLight.shadowCameraNear = 50;
	this.dirLight.shadowCameraFar = 250;
	//this.dirLight.shadowCameraVisible = true
	//this.dirLight.shadowMapBias = -10;
	this.dirLight.shadowMapWidth = this.dirLight.shadowMapHeight = 512;
	this.scene.add(this.dirLight)
	
	//var light = new THREE.PointLight(0xffffff, 2, 0)
	//this.scene.add(light)
	
	this.loader = new THREE.JSONLoader()
	
	this.musicManager = new MusicManager()
	
	this.playersJoining = []
	this.playersLeaving = []
	
	this.subscenes = []
	this.players = []
	this.faceIndex = -1
	
	/*this.subscenes[0] = new THREE.Object3D()
	this.scene.add(this.subscenes[0])
	this.players[0] = new Player(this.subscenes[0], this.loader, socket, true, 0)
	
	this.subscenes[1] = new THREE.Object3D()
	this.scene.add(this.subscenes[1])
	this.subscenes[1].rotation.y = Math.PI
	this.subscenes[1].position.set(0, 0, -10)
	this.players[1] = new Player(this.subscenes[1], this.loader, socket, false, 2)*/
	
	var socket = io.connect()
	
	var self = this
	socket.on("connect", function()
	{
		// only ask for a name the first time
		if (!localStorage.playerName)
		{
			do
			{
				localStorage.playerName = window.prompt("Challenger name", "")
			} while (localStorage.playerName == "null" || localStorage.playerName == "")
		}
		
		socket.emit("registerPlayer", {
			playerName: localStorage.playerName
		})
		
		socket.on("registrationSuccess", function(data)
		{
			console.log("we are on face " + data.faceIndex)
			
			self.tower = new Tower()
			self.tower.load(self.scene, self.loader, data.faceIndex, function()
			{
				self.faceIndex = data.faceIndex
				
				var subscene = self.tower.faces[data.faceIndex].subscene
				var player = new Player(subscene, self.loader, socket, true, data.faceIndex)
				self.players.push(player)
			})
		})
		
		socket.on("playerJoined", function(data)
		{
			console.log("player " + data.playerName + " joined on face " + data.faceIndex)
			
			data.socket = socket
			self.playersJoining.push(data)
		})
		
		socket.on("playerLeaved", function(data)
		{
			console.log("player " + data.playerName + " leaved (face " + data.faceIndex + ")")
			
			self.playersLeaving.push(data)
		})
	})
	
	socket.on("disconnect", function()
	{
		console.log("disconnected!")
	})
}

Game.prototype.findPlayer = function(faceIndex)
{
	for (var i = 0; i < this.players.length; ++i)
	{
		if (this.players[i].faceIndex == faceIndex)
			return this.players[i]
	}
	return null
}

tempBox = null
Game.prototype.update = function(time)
{
	if (this.faceIndex == -1)
		return
	
	while (this.playersJoining.length > 0)
	{
		var data = this.playersJoining.shift()
		var subscene = this.tower.faces[data.faceIndex].subscene
		var player = new Player(subscene, this.loader, data.socket, false, data.faceIndex)
		this.players.push(player)
	}
	
	while (this.playersLeaving.length > 0)
	{
		var data = this.playersLeaving.shift()
		var player = this.findPlayer(data.faceIndex)
		if (player == null)
			continue
		this.tower.faces[data.faceIndex].subscene.remove(player.mesh)
		this.players.splice(this.players.indexOf(player))
	}
	
	var dt = 0
	if (this.currentTime != null)
		dt = time - this.currentTime
	this.currentTime = time
	
	var masterPlayer = null
	for (i = 0; i < this.players.length; ++i)
	{
		this.players[i].update(time, dt, this.tower.faces[i])
		if (this.players[i].isMaster)
			masterPlayer = this.players[i]
	}
	
	if (masterPlayer && masterPlayer.mesh)
		this.musicManager.update(time, dt, masterPlayer.mesh.position.y + 0.5)
	
	var cameraTime = time * 0.0004
	var cameraX = 0
	var cameraY = 3
	var masterRealX = 0
	if (masterPlayer != null && masterPlayer.mesh != null)
	{
		masterRealX = masterPlayer.mesh.position.x + this.tower.faces[this.faceIndex].subscene.position.x
		cameraX = masterRealX * 1.3 + Math.cos(cameraTime) * 0.4
		cameraY = masterPlayer.mesh.position.y + 3
	}
	
	var cameraZ = -14 * Math.sin(masterRealX * 0.3 / towerData.faceWidth * Math.PI - Math.PI * 0.5)
	var cameraPosition = new THREE.Vector3(cameraX, cameraY, cameraZ)
	this.camera.position.lerp(cameraPosition, (1 - Math.exp(-this.camera.position.distanceTo(cameraPosition))))
	this.camera.rotation.y = masterRealX / towerData.faceWidth * 0.7
	
	if (tempBox) this.tower.faces[this.faceIndex].subscene.add(tempBox)
	
	this.renderer.render(this.scene, this.camera)
	
	if (tempBox) this.tower.faces[this.faceIndex].subscene.remove(tempBox)
}
