function MusicManager()
{
	this.musicStarted = false
	
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
			
			var gain = context.createGain()
			gain.gain.value = 0
			
			source.connect(gain)
			gain.connect(context.destination)
			
			layer.buffer = buffer
			layer.source = source
			layer.gain = gain
			
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
	
	this.musicStarted = true
}

MusicManager.prototype.update = function(time, dt, playerHeight)
{
	if (!this.musicStarted)
		return
	
	// update each layer gain according to player position
	for (var i = 0; i < soundData.musicLayers.length; i++)
	{
		var layer = soundData.musicLayers[i]
		
		var fadeSpeed = 0.001 / layer.fadeTime
		var gainValue = layer.gain.gain.value
		if ((playerHeight >= layer.heightRange[0]) && (playerHeight < layer.heightRange[1]))
		{
			gainValue += fadeSpeed * dt
			gainValue = Math.min(gainValue, 1.0)
		}
		else
		{
			gainValue -= fadeSpeed * dt
			gainValue = Math.max(gainValue, 0.0)
		}
		
		layer.gain.gain.value = gainValue
	}
}
