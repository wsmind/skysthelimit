var towerData = {
	
	"faceWidth": 5,
	
	"blocks": [
		{
			"model": "data/wall.js",
		},
		{
			"model": "data/platform.js",
			"boundingBox": new THREE.Box2(new THREE.Vector2(0.0, 0.8), new THREE.Vector2(1.0, 1.0)),
			"debugBoundingBoxes": false
		},
		{
			"model": "data/hole.js",
		},
	],
	
	"faces": [
		[
			1, 1, 0, 0, 1,
			2, 0, 0, 1, 0,
			1, 1, 0, 0, 1,
			2, 2, 0, 1, 0
		],
		[
			1, 1, 1, 1, 1,
			0, 1, 0, 1, 1,
			1, 0, 0, 0, 1,
			1, 0, 0, 0, 0
		]
	]
}
