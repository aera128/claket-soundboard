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
                if (this.file.size > 40960000) {
                    EventBus.$emit('notif', {message: '40MB max', type: 'error'})
                } else {
                    this.$store.commit('addSound', {file: this.file, index: this.index})
                }
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
        changeCoef() {
            this.$store.commit('changeCoef', this.sound, this.sound.coef)
        }
    },
    template: `
      <div v-if="sound !== null && sound !== undefined">
      <v-lazy @click.right="openMenu" transition="fab-transition">
        <v-sheet height="175" elevation="2" rounded="xl"
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
      <v-lazy transition="scroll-y-reverse-transition">
        <v-btn height="50" elevation="2" rounded
               style="margin-bottom: 12px"
               @click="deleteSound"
               color="red darken-3"
               v-if="sound.name !== undefined && viewMenu"
               block
        >
          <v-icon class="text-h4">mdi-delete</v-icon>
        </v-btn>
      </v-lazy>
      <v-lazy transition="scroll-y-reverse-transition">
        <v-sheet height="50" elevation="2" rounded="xl"
                 style="margin-bottom: 12px"
                 color="grey darken-3"
                 v-if="sound.name !== undefined && viewMenu"
        >
          <v-container>
            <v-row>
              <v-col>
                <v-slider v-model="sound.coef" :value="sound.coef" class="mt-n1" step="0.001" :min="0" :max="1"
                          @change="changeCoef">
                  <template v-slot:thumb-label="{ value }">
                    {{ (value * 100).toFixed(0) + '%' }}
                  </template>
                  <template v-slot:prepend>
                    <v-icon>mdi-volume-high</v-icon>
                  </template>
                </v-slider>
              </v-col>
            </v-row>
          </v-container>
        </v-sheet>
      </v-lazy>
      <v-lazy transition="scroll-y-reverse-transition">
        <v-btn height="50" elevation="2" rounded
               @click="closeMenu" ref="rightMenu"
               color="grey darken-3"
               class="red--text"
               v-if="sound.name !== undefined && viewMenu"
               block
        >
          Close
        </v-btn>
      </v-lazy>
      </div>
      <div v-else>
      <v-file-input type="file" ref="file" style="display: none" v-model="file"
                    @change="addSound" accept="audio/*"></v-file-input>
      <v-btn height="175" elevation="2" rounded
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
      <script>
      import VSlider from "./vuetify.min";
      import VContainer from "./vuetify.min";
      import VRow from "./vuetify.min";
      import VCol from "./vuetify.min";

      export default {
        components: {VCol, VRow, VContainer, VSlider}
      }
      </script>`
})
