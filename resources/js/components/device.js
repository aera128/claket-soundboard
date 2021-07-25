Vue.component('device-soundboard', {
    data: function () {
        return {
            output_items: [],
            output: null,
        }
    },
    mounted() {
        this.getDevices()
    },
    methods: {
        changeDevice() {
            this.$store.commit("setAudioOutput", this.output)
        },
        getDevices() {
            navigator.mediaDevices.getUserMedia({audio: true}).then(() => {
                navigator.mediaDevices.enumerateDevices().then(async devices => {
                    this.$store
                        .commit(
                            'setAudioOutputs',
                            devices
                                .filter(d => d.kind === 'audiooutput')
                                .map(d => d = {deviceId: d.deviceId, kind: d.kind, label: d.label, groupId: d.groupId}))
                    this.output_items = this.$store.state.audioOutputs
                    try {
                        let response = await Neutralino.storage.getData({
                            bucket: 'output-device'
                        });
                        this.output = this.$store.state.audioOutputs.filter(a => a.label === JSON.parse(response.data).label)[0]
                        this.$store.commit('setAudioOutput', this.output)
                        this.$store.commit('gotDevices')
                    } catch (e) {
                        this.output = this.$store.state.audioOutputs[0]
                        this.$store.commit('setAudioOutput', this.output)
                        this.$store.commit('gotDevices')
                    }
                })
            })
                .catch(() => {
                    this.getDevices()
                    EventBus.$emit('notif', {
                        message: 'Please accept audio permission to load audio outputs',
                        type: 'error'
                    })
                })
        }
    },
    template: `
      <v-select :items="output_items" label="Output" item-text="label" return-object
                v-model="output" @input="changeDevice" outlined></v-select>
    `
})
