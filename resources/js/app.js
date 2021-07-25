new Vue({
    el: '#app',
    store: store,
    vuetify: new Vuetify({
        theme: {dark: true},
    }),
    data: () => {
        return {
            page: 1,
            loading: true,
            showlist: false
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
        toggleList() {
            this.showlist = !this.showlist
        },
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
        nextPage() {
            this.page++
            this.changePage()
        },
        previousPage() {
            this.page--
            this.changePage()
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
