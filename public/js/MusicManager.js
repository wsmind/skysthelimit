function MusicManager()
{
	AudioContext = window.AudioContext || window.webkitAudioContext
	var context = new AudioContext()
	
	var loadedLayers = 0
	var self = this
	for (var i = 0; i < soundData.musicLayers.length; i++)
	{
		this.loadBuffer(context, soundData.musicLayers[i], function(layer, buffer)
		{
			console.log("loaded: " + layer.file)
			
			var source = context.createBufferSource()
			source.buffer = buffer
			source.loop = true
			source.connect(context.destination)
			
			layer.buffer = buffer
			layer.source = source
			
			loadedLayers++
			if (loadedLayers == soundData.musicLayers.length)
				self.startMusic()
		})
	}
}

MusicManager.prototype.loadBuffer = function(context, layer, callback)
{
	var xhr = new XMLHttpRequest()
	xhr.open("GET", layer.file, true)
	xhr.responseType = "arraybuffer"
	
	xhr.onload = function()
	{
		context.decodeAudioData(xhr.response, function(buffer)
		{
			callback(layer, buffer)
		}, function() { console.log("failed to decode audio data") })
	}
	
	xhr.send()
}

MusicManager.prototype.startMusic = function()
{
	for (var i = 0; i < soundData.musicLayers.length; i++)
	{
		var layer = soundData.musicLayers[i]
		layer.source.start(0)
	}
}

MusicManager.prototype.update = function(player)
{
}
