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
        gotDevices: false
    },
    mutations: {
        gotDevices(state) {
            state.gotDevices = true
        },
        addSound(state, sound) {
            EventBus.$emit('loading')
            sound.file.arrayBuffer().then(b => {
                    let data = _arrayBufferToBase64(b)
                    let file = {
                        id: guidGenerator(),
                        name: sound.file.name,
                        type: sound.file.type,
                        index: sound.index,
                        coef: 1,
                        data: data
                    }
                    if (state.pages[state.page] === undefined) {
                        state.pages[state.page] = []
                    }
                    state.pages[state.page].push(file)
                    Neutralino.storage.putData({
                        bucket: 'soundboard-sounds',
                        data: JSON.stringify(state.pages)
                    })
                        .then(() => {
                                EventBus.$emit('refreshButton')
                                EventBus.$emit('loaded')
                                EventBus.$emit('notif', {message: 'Sound loaded', type: 'success'})
                            }
                        )
                        .catch(() => {
                                EventBus.$emit('refreshButton')
                                EventBus.$emit('loaded')
                                EventBus.$emit('notif', {message: 'Error', type: 'error'})
                            }
                        );
                }
            )
        },
        changeCoef(state, sound, coef) {
            try {
                // state.pages[state.page].filter(f => f === sound)[0].coef = coef
                Neutralino.storage.putData({
                    bucket: 'soundboard-sounds',
                    data: JSON.stringify(state.pages)
                })
                    .then(() => {
                        }
                    )
                    .catch(() => {
                        }
                    );
                state.audios.forEach(audio => {
                    if (audio.sound.id === sound.id) {
                        audio.volume = state.volume * audio.sound.coef
                        if (state.playback === true) {
                            audio.playback.volume = state.volume * audio.sound.coef
                        }
                    }
                })
            } catch (e) {
            }
        },
        deleteSound(state, sound) {
            EventBus.$emit('loading')
            state.pages[state.page] = state.pages[state.page].filter(f => f !== sound)
            Neutralino.storage.putData({
                bucket: 'soundboard-sounds',
                data: JSON.stringify(state.pages)
            })
                .then(() => {
                    sound = null
                    EventBus.$emit('loaded')
                    EventBus.$emit('refreshButton')
                    EventBus.$emit('notif', {message: 'Sound deleted', type: 'success'})
                })
                .catch(() => {
                    sound = null
                    EventBus.$emit('loaded')
                    EventBus.$emit('refreshButton')
                    EventBus.$emit('notif', {message: 'Error', type: 'error'})
                });
        },
        setPages(state, pages) {
            state.pages = pages
        },
        setPage(state, page) {
            state.page = page
            EventBus.$emit('refreshButton')
        },
        addAudio(state, audio) {
            state.audios.unshift(audio)
        },
        removeAudio(state, audio) {
            state.audios = state.audios.filter(a => a.uid !== audio.uid)
            URL.revokeObjectURL(audio.url);
            audio.playback = null
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
            state.audios.forEach(a => {
                a.volume = volume
                if (state.playback === true) {
                    a.playback.volume = volume * audio.sound.coef
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
            state.audios.forEach(audio => {
                try {
                    audio.loop = state.loop
                    audio.playback.loop = state.loop
                } catch (e) {
                }
            })
        },
        desactiveLoop(state) {
            state.loop = false
            state.audios.forEach(audio => {
                try {
                    audio.loop = state.loop
                    audio.playback.loop = state.loop
                } catch (e) {
                }
            })
        },
        activePlayback(state) {
            state.playback = true
            state.audios.forEach(audio => {
                try {
                    audio.playback.volume = state.volume * audio.sound.coef
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
            state.audios.forEach(audio => {
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
                state.audios.forEach(audio => {
                    try {
                        audio.playback.volume = state.volume * audio.sound.coef
                    } catch (e) {
                    }
                })
            } else {
                state.audios.forEach(audio => {
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
            if (sound.coef === undefined) {
                sound.coef = 1
            }
            audio.src = url;
            audio.sound = sound
            audio.volume = context.state.volume * sound.coef
            audio.name = sound.name
            audio.loop = context.state.loop
            audio.uid = guidGenerator()

            audio.playback = audio.cloneNode()
            if (context.state.playback === false || context.state.audioOutput.deviceId === 'default') {
                audio.playback.volume = 0
            } else {
                audio.playback.volume = context.state.volume * sound.coef
            }
            audio.playback.loop = context.state.loop
            this.commit('addAudio', audio)
            audio.setSinkId(context.state.audioOutput.deviceId).then(() => {
                audio.play()
                audio.playback.play()
                context.state.paused = false
            })
        },
        stopAll(context) {
            context.state.audios.forEach(audio => {
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
            context.state.audios.forEach(audio => {
                try {
                    audio.pause()
                    audio.playback.pause()
                } catch (e) {
                }
            })
            context.state.paused = true
            EventBus.$emit('pause')
        },
        resumeAll(context) {
            context.state.audios.forEach(audio => {
                try {
                    audio.play()
                    audio.playback.play()
                } catch (e) {
                }
            })
            context.state.paused = false
            EventBus.$emit('play')
        }
    }
})
