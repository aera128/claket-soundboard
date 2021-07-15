function _arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function _base64ToArrayBuffer(base64) {
    let binary_string = window.atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

new Vue({
    el: '#app',
    store: store,
    vuetify: new Vuetify({
        theme: {dark: true},
    }),
    data: () => {
        return {
            page: 1,
            loading: true
        }
    },
    mounted() {
        this.getData()
        this.getConfig()
        EventBus.$on('refreshData', () => {
            this.getData()
        })
        EventBus.$on('loaded', () => {
            this.loading = false
        })
        EventBus.$on('loading', () => {
            this.loading = true
        })
    },
    methods: {
        deletePage() {
            if (confirm('Supprimer la page ?')) {
                this.$store.commit('deletePage')
            }
        },
        activeLoop() {
            this.$store.commit('activeLoop')
        },
        desactiveLoop() {
            this.$store.commit('desactiveLoop')
        },
        activePlayback() {
            this.$store.commit('activePlayback')
        },
        desactivePlayback() {
            this.$store.commit('desactivePlayback')
        },
        stopAll() {
            this.$store.dispatch('stopAll')
        },
        pauseAll() {
            this.$store.dispatch('pauseAll')
        },
        resumeALl() {
            this.$store.dispatch('resumeAll')
        },
        changePage() {
            if (this.page < 1) {
                this.page = 1
            }
            if (this.page > 1000) {
                this.page = 1000
            }
            this.$store.commit('setPage', this.page)
        },
        async getData() {
            this.loading = true
            Neutralino.storage.getData({
                bucket: 'soundboard-sounds'
            }).then(r => {
                let pages = JSON.parse(r.data)
                if (pages !== null) {
                    this.$store.commit('setPages', pages)
                }
                EventBus.$emit('refreshButton')
                this.loading = false
            }).catch(() => {
                EventBus.$emit('refreshButton')
                this.loading = false
            });
        },
        async getConfig() {
            Neutralino.storage.getData({
                bucket: 'soundboard-playback'
            }).then(r => {
                let playback = JSON.parse(r.data)
                this.$store.commit('setPlayback', playback)
            }).catch(() => {
                Neutralino.storage.putData({
                    bucket: 'soundboard-playback',
                    data: JSON.stringify(this.$store.state.playback)
                });
            });
        }
    },
    watch: {}
})
