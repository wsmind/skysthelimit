function MusicManager()
{
	this.musicStarted = false
	
	AudioContext = window.AudioContext || window.webkitAudioContext
	var context = new AudioContext()
	this.context = context
	
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
	
	for (var name in soundData.effects)
	{
		var sfx = soundData.effects[name]
		sfx.buffers = []
		
		for (var i = 0; i < sfx.files.length; i++)
		{
			console.log(sfx.files[i])
			this.loadSfxBuffer(context, sfx, i, function(sfx, i, buffer)
			{
				console.log("sfx file: " + sfx.files[i])
				
				sfx.buffers.push(buffer)
			})
		}
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

MusicManager.prototype.loadSfxBuffer = function(context, sfx, i, callback)
{
	var xhr = new XMLHttpRequest()
	xhr.open("GET", sfx.files[i], true)
	xhr.responseType = "arraybuffer"
	
	xhr.onload = function()
	{
		context.decodeAudioData(xhr.response, function(buffer)
		{
			callback(sfx, i, buffer)
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

MusicManager.prototype.playSfx = function(name)
{
	var sfx = soundData.effects[name]
	var buffer = sfx.buffers[Math.floor(Math.random() * sfx.buffers.length)]
	
	var source = this.context.createBufferSource()
	source.buffer = buffer
	source.playbackRate.value = sfx.pitch + Math.random() * sfx.pitchRandomization
	
	var gain = this.context.createGain()
	gain.gain.value = sfx.gain
	
	source.connect(gain)
	gain.connect(this.context.destination)
	
	source.start()
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
		
		layer.gain.gain.value = gainValue * soundData.musicGain
	}
}
