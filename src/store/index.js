import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        settings: {
            cloudname: '',
            preset: ''
        }
    },
    mutations: {
        updateCloudname(state, cloudname) {
            state.settings.cloudname = cloudname
        },
        updatePreset(state, preset) {
            state.settings.preset = preset
        }
    }
})

export default store