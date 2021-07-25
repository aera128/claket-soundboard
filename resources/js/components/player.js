Vue.component('player-soundboard', {
    props: ['audio'],
    data: function () {
        return {
            paused: false,
            currentTime: 0,
            duration: 0,
            click: false,
            clickWhilePlaying: false,
        }
    },
    mounted() {
        let vm = this
        EventBus.$on('pause', () => {
            this.paused = true
        })
        EventBus.$on('play', () => {
            this.paused = false
        })
        this.interval = setInterval(function () {
            vm.currentTime = vm.audio.currentTime
            vm.duration = vm.audio.duration
        }, 50);
    },
    destroyed() {
        clearInterval(this.interval)
    },
    methods: {
        toggleAudio() {
            if (this.paused) {
                this.audio.play()
                this.audio.playback.play()
            } else {
                this.audio.pause()
                this.audio.playback.pause()
            }

            this.paused = !this.paused
        },
        stopAudio() {
            this.audio.pause()
            this.audio.playback.pause()
            this.audio.currentTime = this.audio.duration
            this.audio.playback.currentTime = this.audio.playback.duration
            this.$store.commit('removeAudio', this.audio)
        },
        mouseUp() {
            this.click = false
            if (this.paused && this.clickWhilePlaying) {
                this.audio.play()
                this.audio.playback.play()
                this.paused = false
                this.clickWhilePlaying = false
            }
            this.changeCurrentTime()
        },
        mouseDown() {
            this.click = true
            if (!this.paused) {
                this.audio.pause()
                this.audio.playback.pause()
                this.paused = true
                this.clickWhilePlaying = true
            }
            this.changeCurrentTime()
        },
        changeCurrentTime() {
            if (this.click) {
                this.audio.currentTime = this.currentTime
                this.audio.playback.currentTime = this.currentTime
                this.currentTime = this.audio.currentTime
            }
        }
    },
    template: `
      <div style="width: 100%" class="mb-3"
      >
      <v-slider
          v-model="currentTime"
          :value="currentTime"
          @mouseup="mouseUp"
          @mousedown="mouseDown"
          @input="changeCurrentTime"
          step="0.00001"
          :max="duration"
          :min="0"
      >
        <template v-slot:prepend>
          <v-btn @click="toggleAudio" fab v-if="!paused" color="grey darken-3">
            <v-icon>mdi-pause</v-icon>
          </v-btn>
          <v-btn @click="toggleAudio" fab v-else color="grey darken-3">
            <v-icon>mdi-play</v-icon>
          </v-btn>
          <v-btn @click="stopAudio" fab class="ml-1" color="grey darken-3">
            <v-icon>mdi-stop</v-icon>
          </v-btn>
        </template>
      </v-slider>
      <div class="player-name text--secondary">
        {{ audio.name + ' : ' + formatTime(currentTime) + ' /  ' + formatTime(duration) + '' }}
      </div>
      </div>
    `
})
