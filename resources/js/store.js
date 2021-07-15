Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        pages: [],
        audios: [],
        audioOutputs: [],
        audioOutput: null,
        volume: 0.5,
        page: 1,
        paused: false,
        loop: false,
        playback: true,
    },
    mutations: {
        addSound(state, sound) {
            EventBus.$emit('loading')
            sound.file.arrayBuffer().then(b => {
                    let data = _arrayBufferToBase64(b)
                    let file = {
                        name: sound.file.name,
                        type: sound.file.type,
                        index: sound.index,
                        data: data
                    }
                    if (state.pages[state.page] === undefined) {
                        state.pages[state.page] = []
                    }
                    state.pages[state.page].push(file)
                    EventBus.$emit('refreshButton')
                    Neutralino.storage.putData({
                        bucket: 'soundboard-sounds',
                        data: JSON.stringify(state.pages)
                    })
                        .then(() => {
                                EventBus.$emit('loaded')
                                EventBus.$emit('notif', {message: 'Sound loaded', type: 'success'})
                            }
                        )
                        .catch(() => {
                                EventBus.$emit('loaded')
                                EventBus.$emit('notif', {message: 'Error', type: 'error'})
                            }
                        );
                }
            )
        },
        deleteSound(state, sound) {
            state.pages[state.page] = state.pages[state.page].filter(f => f !== sound)
            EventBus.$emit('refreshButton')
            Neutralino.storage.putData({
                bucket: 'soundboard-sounds',
                data: JSON.stringify(state.pages)
            })
                .then(() => {
                    sound = null
                    EventBus.$emit('notif', {message: 'Sound deleted', type: 'success'})
                })
                .catch(() => {
                    sound = null
                    EventBus.$emit('notif', {message: 'Error', type: 'error'})
                });
        },
        setPages(state, pages) {
            state.pages = pages
        },
        setPage(state, page) {
            state.page = page
            EventBus.$emit('refreshData')
        },
        addAudio(state, audio) {
            state.audios.push(audio)
        },
        removeAudio(state, audio) {
            state.audios = state.audios.filter(a => a !== audio)
            audio = null
        },
        setAudioOutputs(state, outputs) {
            state.audioOutputs = outputs
        },
        setAudioOutput(state, output) {
            state.audioOutput = output
            Neutralino.storage.putData({
                bucket: 'output-device',
                data: JSON.stringify(output)
            });
        },
        setVolume(state, volume) {
            state.volume = volume
            state.audios.map(a => {
                a.volume = volume
                if (state.playback === true) {
                    a.playback.volume = volume
                }
            })
        },
        deletePage(state) {
            state.pages[state.page] = []
            EventBus.$emit('refreshButton')
            Neutralino.storage.putData({
                bucket: 'soundboard-sounds',
                data: JSON.stringify(state.pages)
            })
                .then(() => {
                    sound = null
                    EventBus.$emit('notif', {message: 'Page deleted', type: 'success'})
                })
                .catch(() => {
                    sound = null
                    EventBus.$emit('notif', {message: 'Error', type: 'error'})
                });
        },
        activeLoop(state) {
            state.loop = true
            state.audios.map(audio => {
                try {
                    audio.loop = state.loop
                    audio.playback.loop = state.loop
                } catch (e) {
                }
            })
        },
        desactiveLoop(state) {
            state.loop = false
            state.audios.map(audio => {
                try {
                    audio.loop = state.loop
                    audio.playback.loop = state.loop
                } catch (e) {
                }
            })
        },
        activePlayback(state) {
            state.playback = true
            state.audios.map(audio => {
                try {
                    audio.playback.volume = state.volume
                } catch (e) {
                }
            })
            Neutralino.storage.putData({
                bucket: 'soundboard-playback',
                data: JSON.stringify(state.playback)
            });
        },
        desactivePlayback(state) {
            state.playback = false
            state.audios.map(audio => {
                try {
                    audio.playback.volume = 0
                } catch (e) {
                }
            })
            Neutralino.storage.putData({
                bucket: 'soundboard-playback',
                data: JSON.stringify(state.playback)
            });
        },
        setPlayback(state, playback) {
            state.playback = playback
            if (playback === true) {
                state.audios.map(audio => {
                    try {
                        audio.playback.volume = state.volume
                    } catch (e) {
                    }
                })
            } else {
                state.audios.map(audio => {
                    try {
                        audio.playback.volume = 0
                    } catch (e) {
                    }
                })
            }
        }

    },
    actions: {
        playSound(context, sound) {
            let buffer = _base64ToArrayBuffer(sound.data)
            const blob = new Blob([buffer], {type: sound.type});
            const url = window.URL.createObjectURL(blob);

            const audio = new Audio();
            // Clean up the URL Object after we are done with it
            audio.addEventListener("load", () => {
                URL.revokeObjectURL(url);
            });

            let store = this
            audio.addEventListener("ended", () => {
                store.commit('removeAudio', audio)
            });

            audio.src = url;
            audio.volume = context.state.volume
            audio.name = sound.name
            audio.loop = context.state.loop

            audio.playback = audio.cloneNode()
            if (context.state.playback === false || context.state.audioOutput.deviceId === 'default') {
                audio.playback.volume = 0
            }
            this.commit('addAudio', audio)
            audio.setSinkId(context.state.audioOutput.deviceId).then(() => {
                audio.play()
                audio.playback.play()
                context.state.paused = false
            })
        },
        stopAll(context) {
            context.state.audios.map(audio => {
                try {
                    audio.pause()
                    audio.playback.pause()
                    audio.currentTime = audio.duration
                    context.commit('removeAudio', audio)
                } catch (e) {
                }
            })
        },
        pauseAll(context) {
            context.state.audios.map(audio => {
                try {
                    audio.pause()
                    audio.playback.pause()
                } catch (e) {
                }
            })
            context.state.paused = true
        },
        resumeAll(context) {
            context.state.audios.map(audio => {
                try {
                    audio.play()
                    audio.playback.play()
                } catch (e) {
                }
            })
            context.state.paused = false
        }
    }
})
