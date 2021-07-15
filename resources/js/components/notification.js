Vue.component('notification-soundboard', {
    data: function () {
        return {
            message: null,
            type: null,
            snackbar: false,
        }
    },
    mounted() {
        EventBus.$on('notif', data => {
            this.message = data.message
            this.type = data.type
            this.snackbar = true
        })
    },
    methods: {},
    template: `
      <v-snackbar
          dark
          transition="slide-y-transition"
          v-model="snackbar"
          top
          left
          timeout="2000"
          :color="type + ' darken-1'"
      >
      {{ message }}

      <template v-slot:action="{ attrs }">
        <v-btn
            text
            v-bind="attrs"
            @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
      </v-snackbar>
    `
})
