function Game()
{
	this.currentTime = null
	
	var gameDiv = document.getElementById("game")
	
	this.renderer = new THREE.WebGLRenderer()
	this.renderer.setSize(1280, 720)
	this.renderer.shadowMapEnabled = true
	gameDiv.appendChild(this.renderer.domElement)
	
	this.scene = new THREE.Scene()
	
	this.camera = new THREE.PerspectiveCamera(45.0, 16.0 / 9.0, 0.1, 1000.0)
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
	this.dirLight.castShadow = true
	this.dirLight.shadowMapWidth = this.dirLight.shadowMapHeight = 2048;
	this.scene.add(this.dirLight)
	
	//var light = new THREE.PointLight(0xffffff, 2, 0)
	//this.scene.add(light)
	
	this.loader = new THREE.JSONLoader()
	
	this.tower = new Tower(this.scene, this.loader, socket)
	
	this.subscenes = []
	this.players = []
	
	this.subscenes[0] = new THREE.Object3D()
	this.scene.add(this.subscenes[0])
	this.players[0] = new Player(this.subscenes[0], this.loader, socket, true, 0)
	
	this.subscenes[1] = new THREE.Object3D()
	this.scene.add(this.subscenes[1])
	this.subscenes[1].rotation.y = Math.PI
	this.subscenes[1].position.set(0, 0, -10)
	this.players[1] = new Player(this.subscenes[1], this.loader, socket, false, 2)
	
	var socket = io.connect()
	
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
		})
		
		socket.on("playerJoined", function(data)
		{
			console.log("player " + data.playerName + " joined on face " + data.faceIndex)
		})
		
		socket.on("playerLeaved", function(data)
		{
			console.log("player " + data.playerName + " leaved (face " + data.faceIndex + ")")
		})
	})
	
	socket.on("disconnect", function()
	{
		console.log("disconnected!")
	})
}

Game.prototype.update = function(time)
{
	var dt = 0
	if (this.currentTime != null)
		dt = time - this.currentTime
	this.currentTime = time
	
	//this.plane.rotation.x = -Math.PI * 0.5
	//this.plane.position.z = -200
	//this.plane.position.y = 0
	//this.plane.rotation.z = time * 0.001
	//light.position.x = Math.sin(time * 0.001) * 5.0
	
	this.tower.update(time, dt)
	for (i = 0; i < this.players.length; ++i)
		this.players[i].update(time, dt, this.tower)
	
	this.renderer.render(this.scene, this.camera)
}
