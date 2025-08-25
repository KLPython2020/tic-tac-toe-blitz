// audio.js - ENHANCED Audio System with Background Music
class AudioSystem {
    constructor() {
        this.isEnabled = true
        this.context = null
        this.sounds = {}
        
        // NEW: Background music system
        this.musicEnabled = false
        this.backgroundMusic = null
        this.musicGainNode = null
        this.musicVolume = 0.3 // 30% volume for background music
        this.isMusicPlaying = false
    }

    async init() {
        try {
            // Initialize Web Audio API
            this.context = new (window.AudioContext || window.webkitAudioContext)()
            
            // Create master gain node for music
            this.musicGainNode = this.context.createGain()
            this.musicGainNode.connect(this.context.destination)
            this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.context.currentTime)
            
            console.log('ðŸ”Š Audio system initialized')
            return true
        } catch (error) {
            console.warn('Audio not supported:', error)
            return false
        }
    }

    setEnabled(enabled) {
        this.isEnabled = enabled
        console.log(`ðŸ”Š Audio ${enabled ? 'enabled' : 'disabled'}`)
    }

    /**
     * NEW: Set music enabled state
     * @param {boolean} enabled - Whether music should be enabled
     */
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled
        
        if (enabled && !this.isMusicPlaying) {
            this.startBackgroundMusic()
        } else if (!enabled && this.isMusicPlaying) {
            this.stopBackgroundMusic()
        }
        
        console.log(`ðŸŽµ Background music ${enabled ? 'enabled' : 'disabled'}`)
    }

    /**
     * NEW: Start background music loop
     */
    startBackgroundMusic() {
        if (!this.context || !this.musicEnabled || this.isMusicPlaying) return
        
        try {
            this.playBackgroundLoop()
            this.isMusicPlaying = true
            console.log('ðŸŽµ Background music started')
        } catch (error) {
            console.warn('Failed to start background music:', error)
        }
    }

    /**
     * NEW: Stop background music
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.stop()
                this.backgroundMusic = null
            } catch (error) {
                console.warn('Error stopping background music:', error)
            }
        }
        this.isMusicPlaying = false
        console.log('ðŸŽµ Background music stopped')
    }

    /**
     * NEW: Create and play background music loop
     */
    playBackgroundLoop() {
        if (!this.context || !this.musicGainNode) return
        
        // Create a simple, non-intrusive background melody
        const playMusicNote = (frequency, startTime, duration, volume = 0.1) => {
            const oscillator = this.context.createOscillator()
            const gainNode = this.context.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(this.musicGainNode)
            
            oscillator.frequency.setValueAtTime(frequency, startTime)
            oscillator.type = 'sine'
            
            // Smooth attack and release
            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.1)
            gainNode.gain.linearRampToValueAtTime(volume * 0.7, startTime + duration - 0.1)
            gainNode.gain.linearRampToValueAtTime(0, startTime + duration)
            
            oscillator.start(startTime)
            oscillator.stop(startTime + duration)
        }
        
        // Create a simple ambient melody pattern
        const createMusicPattern = () => {
            const now = this.context.currentTime
            const baseTime = now + 0.1
            
            // Gentle, ambient chord progression
            const progression = [
                // C major chord (peaceful)
                [261.63, 329.63, 392.00], // C, E, G
                [246.94, 311.13, 369.99], // B, D#, F#
                [220.00, 277.18, 329.63], // A, C#, E
                [246.94, 293.66, 369.99], // B, D, F#
            ]
            
            progression.forEach((chord, chordIndex) => {
                const chordStartTime = baseTime + (chordIndex * 4) // 4 seconds per chord
                
                chord.forEach((frequency, noteIndex) => {
                    // Stagger notes slightly for a gentler effect
                    const noteStartTime = chordStartTime + (noteIndex * 0.1)
                    playMusicNote(frequency, noteStartTime, 3.5, 0.05) // Very quiet
                })
            })
            
            // Schedule next iteration
            if (this.musicEnabled && this.isMusicPlaying) {
                setTimeout(() => {
                    if (this.musicEnabled && this.isMusicPlaying) {
                        createMusicPattern()
                    }
                }, 16000) // 16 second loop (4 chords Ã— 4 seconds)
            }
        }
        
        createMusicPattern()
    }

    /**
     * NEW: Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume))
        if (this.musicGainNode) {
            this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.context.currentTime)
        }
    }

    play(soundName) {
        if (!this.isEnabled || !this.context) return
        
        // Generate simple tones for different sounds
        const frequencies = {
            'bomb-hit': 200,      // Deep boom
            'life-lost': 150,     // Sad tone
            'life-saved': 800,    // Happy tone
            'timer-expired': 300, // Basketball buzzer
            'victory': 1000,      // Success
            'tie': 600,           // Neutral end
            'turn-change': 400,   // Neutral
            'new-game': 500,      // Start tone
            'game-start': 600,    // Begin
            'game-over': 250      // Low game over tone
        }
        
        const frequency = frequencies[soundName] || 440
        
        // Special handling for different sound types
        if (soundName === 'life-saved') {
            this.playSuccessSound()
        } else if (soundName === 'life-lost') {
            this.playErrorSound()
        } else if (soundName === 'victory') {
            this.playVictorySound()
        } else if (soundName === 'timer-expired') {
            this.playBuzzerSound()
        } else {
            this.playTone(frequency, 0.3) // Play for 300ms
        }
    }

    playTone(frequency, duration, volume = 0.1) {
        if (!this.context) return
        
        const oscillator = this.context.createOscillator()
        const gainNode = this.context.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.context.destination)
        
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime)
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(volume, this.context.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration)
        
        oscillator.start(this.context.currentTime)
        oscillator.stop(this.context.currentTime + duration)
    }

    playSuccessSound() {
        if (!this.context) return
        
        // Play a pleasant ascending chord for correct answers
        const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.3, 0.15)
            }, index * 100)
        })
    }

    playErrorSound() {
        if (!this.context) return
        
        // Play a descending minor chord for wrong answers
        const frequencies = [440, 369.99, 293.66] // A4, F#4, D4
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 0.12)
            }, index * 80)
        })
    }

    playVictorySound() {
        if (!this.context) return
        
        // Play a triumphant ascending sequence
        const frequencies = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.4, 0.2)
            }, index * 150)
        })
    }

    playBuzzerSound() {
        if (!this.context) return
        
        // Play a harsh buzzer sound for timer expiration
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.playTone(200, 0.2, 0.15)
            }, i * 250)
        }
    }

    /**
     * NEW: Resume audio context if suspended (for autoplay policies)
     */
    async resumeContext() {
        if (this.context && this.context.state === 'suspended') {
            try {
                await this.context.resume()
                console.log('ðŸ”Š Audio context resumed')
            } catch (error) {
                console.warn('Failed to resume audio context:', error)
            }
        }
    }

    /**
     * NEW: Get current audio status
     */
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            musicEnabled: this.musicEnabled,
            isMusicPlaying: this.isMusicPlaying,
            contextState: this.context ? this.context.state : 'not-initialized',
            musicVolume: this.musicVolume
        }
    }

    /**
     * NEW: Cleanup method
     */
    cleanup() {
        this.stopBackgroundMusic()
        if (this.context) {
            this.context.close()
        }
    }
}

// Make it global
window.AudioSystem = AudioSystem