Vue.component('button-soundboard', {
    props: ['index'],
    data: function () {
        return {
            viewMenu: false,
            sound: null,
            file: null,
            loading: true
        }
    },
    mounted() {
        EventBus.$on('refreshButton', () => {
            try {
                this.sound = this.$store.state.pages[this.$store.state.page].find(p => p.index === this.index)
            } catch (e) {
                this.sound = null
            }
            this.viewMenu = false
            this.loading = false
        })
    },
    methods: {
        async playSound(sound) {
            this.$store.dispatch('playSound', sound)
        },
        addSound() {
            if (![null, undefined].includes(this.file)) {
                this.$store.commit('addSound', {file: this.file, index: this.index})
            }
            this.file = null
        },
        deleteSound() {
            this.$store.commit('deleteSound', this.sound)
        },
        openMenu(e) {
            this.viewMenu = true;
            e.preventDefault();
        },
        closeMenu(e) {
            this.viewMenu = false
            e.preventDefault();
        },
    },
    template: `
      <div v-if="sound !== null && sound !== undefined">
      <v-lazy @click.right="openMenu" transition="fab-transition">
        <v-sheet height="200" elevation="2" rounded="xl"
                 @click="playSound(sound)"
                 color="grey darken-3"
                 block
                 v-ripple
                 v-if="sound.name !== undefined && !viewMenu"
                 style="cursor: pointer"
                 align="center"
                 justify="center"
        >
          <v-container fill-height fluid>
            <v-row align="center"
                   justify="center"
                   style="word-break: break-all;">
              <v-col>
                <div class="bouton">
                  {{ sound.name }}
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-sheet>
      </v-lazy>
      <v-lazy transition="fab-transition">
        <v-btn height="200" elevation="2" rounded
               @click.right="closeMenu" ref="rightMenu"
               @click.left="deleteSound"
               color="grey darken-3"
               v-if="sound.name !== undefined && viewMenu"
               block
        >
          <v-icon class="text-h3">mdi-delete</v-icon>
        </v-btn>
      </v-lazy>
      </div>
      <div v-else>
      <v-file-input type="file" ref="file" style="display: none" v-model="file"
                    @change="addSound" accept="audio/*"></v-file-input>
      <v-btn height="200" elevation="2" rounded
             @click="$refs.file.$refs.input.click()"
             block
      >
        <v-icon class="text-h4" v-if="!loading">mdi-plus</v-icon>
        <v-progress-circular
            v-else
            :size="50"
            indeterminate
        ></v-progress-circular>
      </v-btn>
      </div>
    `
})
