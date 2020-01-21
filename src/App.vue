<template>
  <div id="app">
    <div>
      <b-navbar class="nav-bg" toggleable="lg" type="dark">
        <b-navbar-brand href="#">Vue Camera</b-navbar-brand>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item to="/">Camera</b-nav-item>
            <b-nav-item
              to="/gallery"
              :disabled="cloudname.length === 0 || preset.length === 0"
            >Gallery</b-nav-item>
          </b-navbar-nav>

          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto">
            <b-nav-item>
              <div class="settings" v-b-modal.modal-prevent-closing>
                <i class="fas fa-cog"></i>
              </div>

              <b-modal
                id="modal-prevent-closing"
                ref="modal"
                title="Cloudinary Upload Info"
                @show="resetModal"
                @hidden="resetModal"
                @ok="handleOk"
              >
                <form ref="form" @submit.stop.prevent="handleSubmit">
                  <b-form-group
                    :state="cloudnameState"
                    label="Cloudname"
                    label-for="cloud-name-input"
                    invalid-feedback="Cloudname is required"
                  >
                    <b-form-input
                      id="cloud-name-input"
                      v-model="cloudname"
                      :state="cloudnameState"
                      required
                    ></b-form-input>
                  </b-form-group>
                  <b-form-group
                    :state="presetState"
                    label="Preset"
                    label-for="preset-input"
                    invalid-feedback="Preset is required"
                  >
                    <b-form-input id="preset-input" v-model="preset" :state="presetState" required></b-form-input>
                  </b-form-group>
                  <b-form-group>
                    <b-form-checkbox
                      id="clearsettings"
                      v-model="clearsettings"
                      name="clearsettings"
                      value="true"
                      unchecked-value="false"
                    >Clear Settings</b-form-checkbox>
                  </b-form-group>
                </form>
              </b-modal>
            </b-nav-item>

            <b-nav-item>
              <div class="settings" v-b-modal.info-modal>
                <i class="fas fa-info-circle"></i>
              </div>

              <b-modal id="info-modal" ref="modal" title="Instructions">
                <p>
                  You need to
                  <a
                    href="https://cloudinary.com/users/register/free"
                    target="_blank"
                  >register for a Cloudinary account</a> to get a cloud name.
                </p>
                <p>
                  Once you have an account go to settings | upload to create an unsigned
                  preset.
                </p>
                <p>
                  For information on creating an unsigned upload preset, look
                  <a
                    href="https://cloudinary.com/documentation/upload_images?query=settings%20upload%20preset&c_query=Upload%20presets#upload_presets"
                    target="_blank"
                  >here.</a>
                  Be sure to choose the unsigned option when creating the upload preset.
                </p>
                <p>
                  Click on the settings icon (gear) to enter your cloud name and preset.
                  This will allow you to upload your images to cloudinary and then view them using the Gallery navigation link.
                </p>
              </b-modal>
            </b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </div>

    <b-container>
      <b-row class="routes">
        <b-col sm="12">
          <router-view></router-view>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: "app",
  created: function() {
    if (this.$ls.get("cloudname")) {
      this.cloudname = this.$ls.get("cloudname");
    }
    if (this.$ls.get("preset")) {
      this.preset = this.$ls.get("preset");
    }
  },
  data() {
    return {
      cloudnameState: null,
      presetState: null,
      clearsettings: "false",
      expire: 3600000
    };
  },
  computed: {
    cloudname: {
      get() {
        return this.$store.state.settings.cloudname;
      },
      set(value) {
        this.$store.commit("updateCloudname", value);
      }
    },
    preset: {
      get() {
        return this.$store.state.settings.preset;
      },
      set(value) {
        this.$store.commit("updatePreset", value);
      }
    }
  },
  methods: {
    checkFormValidity() {
      if (
        this.cloudname &&
        this.cloudname.length > 0 &&
        this.preset &&
        this.preset.length > 0
      )
        return true;
      else {
        this.$bvToast.toast(
          `Enter cloudname and preset to complete form save.`,
          {
            title: "Settings",
            autoHideDelay: 5000,
            appendToast: false
          }
        );
        return false;
      }
    },
    resetModal() {
      this.cloudnameState = null;
      this.presetState = null;
    },
    handleOk(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault();
      // Trigger submit handler
      this.handleSubmit();
    },
    handleSubmit() {
      //clear local storage and return
      if (this.clearsettings === "true") {
        this.cloudname = "";
        this.preset = "";
        this.clearsettings = "false";
        // remove from local storage
        this.$ls.clear();
        this.$nextTick(() => {
          this.$refs.modal.hide();
        });
        return;
      } else {
        // Exit when the form isn't valid
        if (!this.checkFormValidity()) {
          return;
        } else {
          this.$ls.set("cloudname", this.cloudname, this.expire);
          this.$ls.set("preset", this.preset, this.expire);
        }
      }

      // Hide the modal manually
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    }
  }
};
</script>

<style>
#app {
  font-family: "Roboto", "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
a.settings {
  color: black;
}

.settings i {
  font-size: 1rem;
}

input {
  text-transform: lowercase;
}
.routes {
  margin: 10px 0;
}
.nav-bg {
  background-color: #000;
}
.router-link-exact-active {
  color: white !important;
  font-weight: bold;
}
.nav-link {
  color: white !important;
}
.nav-link.disabled {
  color: rgba(255, 255, 255, 0.75) !important;
}
</style>
