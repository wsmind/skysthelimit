function MusicManager()
{
	var context = new AudioContext()
	
	for (var i = 0; i < soundData.musicLayers.length; i++)
	{
		var layer = soundData.musicLayers[i]
		
		console.log("loading " + layer.file)
		this.loadBuffer(context, layer.file, function(buffer)
		{
			layer.buffer = buffer
			var source = context.createBufferSource()
			source.buffer = buffer
			source.loop = true
			source.connect(context.destination)
			source.start(0)
		})
	}
}

MusicManager.prototype.loadBuffer = function(context, path, callback)
{
	var xhr = new XMLHttpRequest()
	xhr.open("GET", path, true)
	xhr.responseType = "arraybuffer"
	
	xhr.onload = function()
	{
		context.decodeAudioData(xhr.response, function(buffer)
		{
			callback(buffer)
		}, function() { console.log("failed to decode audio data") })
	}
	
	xhr.send()
}

MusicManager.prototype.update = function(player)
{
}
