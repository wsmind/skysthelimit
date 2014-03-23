var soundData = {
	"musicLayers": [
		{
			file: "data/music_layer_bass.wav",
			heightRange: [9, 25],
			fadeTime: 3,
		},
		{
			file: "data/music_layer_folk.wav",
			heightRange: [0, 25],
			fadeTime: 3,
		},
		{
			file: "data/Wind_6036_01.wav",
			heightRange: [0, 25],
			fadeTime: 1,
		},
		{
			file: "data/music_loop_guit_elec_04.wav",
			heightRange: [1, 25],
			fadeTime: 3,
		},
		{
			file: "data/boucle_drum_8bit.wav",
			heightRange: [0, 25],
			fadeTime: 3,
		},
		{
			file: "data/Boucle_8bit.wav",
			heightRange: [0, 25],
			fadeTime: 3,
		}
	],
	
	musicGain: 1.0,
	
	effects: {
		"walk": {
			files: [
				"data/footstepleft.wav",
				"data/footstepright.wav"
			],
			gain: 1.0,
			pitch: 1.0,
			pitchRandomization: 0.4
		},
		"jump": {
			files: [
				"data/jump.wav"
			],
			gain: 1.1,
			pitch: 0.9,
			pitchRandomization: 0.1
		},
		"hitGround": {
			files: [
				"data/retombedusaut.wav"
			],
			gain: 0.7,
			pitch: 1.0,
			pitchRandomization: 0.0
		},
		"slidingBlock": {
			files: [
				"data/pierrequiglisse.wav"
			],
			gain: 1.1,
			pitch: 1.0,
			pitchRandomization: 0.1
		}
	},
	
	stepDuration: 0.3
}
