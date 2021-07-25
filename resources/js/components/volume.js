Vue.component('volume-soundboard', {
    props: ['audio'],
    data: function () {
        return {
            volume: 0.5,
        }
    },
    mounted() {
        Neutralino.storage.getData({
            bucket: 'soundboard-volume'
        }).then(r => {
            this.volume = JSON.parse(r.data)
            this.$store.commit('setVolume', this.volume)
        }).catch(() => {
        });
    },
    methods: {
        async setVolume() {
            if (this.volume !== null) {
                this.$store.commit('setVolume', this.volume)
                Neutralino.storage.putData({
                    bucket: 'soundboard-volume',
                    data: JSON.stringify(this.volume)
                });
            }
        }
    },
    template: `
      <v-slider v-model="volume" :value="volume" step="0.001" :min="0" :max="1"
                @input="setVolume()" thumb-label>
      <template v-slot:thumb-label="{ value }">
        {{ (value * 100).toFixed(0) + '%' }}
      </template>
      <template v-slot:prepend>
        <v-icon v-if="volume>=0.75">mdi-volume-high</v-icon>
        <v-icon v-if="volume > 0.25 && volume<0.75">mdi-volume-medium</v-icon>
        <v-icon v-if="volume > 0 && volume<=0.25">mdi-volume-low</v-icon>
        <v-icon v-if="volume === 0 ">mdi-volume-variant-off</v-icon>
      </template>
      </v-slider>
    `
})
