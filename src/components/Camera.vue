<template>
  <div class="camera">
    <!-- <p>Camera State:{{cameraState}}</p> -->
    <b-row>
      <b-col sm="12">
        <div class="actions">
          <b-button-group>
            <b-button v-if="!cameraState" :disabled="isStartEnabled" v-on:click="start">Camera</b-button>
            <b-button v-if="cameraState" :disabled="isStartEnabled" v-on:click="stop">Stop</b-button>
            <b-button v-if="cameraState" :disabled="isStartEnabled" v-on:click="snapshot">Snapshot</b-button>
            <b-button v-if="isPhoto" :disabled="!isPhoto" v-on:click="download">Download</b-button>
            <div v-if="isPhoto" v-b-tooltip.hover>
              <b-button
                :disabled="!isPhoto || settings.cloudname.length === 0 || settings.preset.length === 0"
                v-on:click="upload"
                v-if="isPhoto"
              >Upload</b-button>
            </div>
          </b-button-group>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="12">
        <form class>
          <b-form-select
            v-model="selectedDevice"
            :options="options"
            v-on:change="deviceChange()"
            size="sm"
          ></b-form-select>
        </form>
      </b-col>
    </b-row>

    <b-row>
      <b-col sm="12">
        <div>
          <video v-show="cameraState" playsinline autoplay></video>
          <canvas v-show="!cameraState"></canvas>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
// https://cloudinary.com/documentation/image_upload_api_reference
// https://codepen.io/team/Cloudinary/pen/Edxjbj
// https://support.cloudinary.com/hc/en-us/articles/209754169-Is-it-possible-to-upload-directly-to-Cloudinary-using-pure-Javascript-code-
async function uploadToCloudinary(cloudName, preset, fileData) {
  try {
    let fd = new FormData();
    let url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    fd.append("upload_preset", preset);
    fd.append("tags", "browser_upload");
    fd.append("file", fileData);
    let res = await axios({
      method: "post",
      url: url,
      data: fd
    });
    return await res.data;
  } catch (err) {
    throw err;
  }
}

// import cloudinary from "cloudinary-core"
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "Camera",
  data() {
    return {
      video: null,
      canvas: null,
      fileData: null,
      isStartEnabled: true,
      isPhoto: false,
      stream: null,
      currentStream: null,
      devices: [],
      options: [],
      constraints: {},
      selectedDevice: null,
      cameraState: true
    };
  },
  computed: mapState(["settings"]),
  methods: {
    upload: function() {
      if (
        this.settings.cloudname.length === 0 ||
        this.settings.preset.length === 0
      ) {
        this.$bvToast.toast(
          `Upload to Cloudinary unsuccessful: use settings to provide cloudname and preset`,
          {
            title: "Cloudinary Upload",
            autoHideDelay: 5000,
            appendToast: false
          }
        );
        return;
      }
      uploadToCloudinary(
        this.settings.cloudname,
        this.settings.preset,
        this.fileData
      )
        .then(result => {
          this.$bvToast.toast(`Upload to Cloudinary successful`, {
            title: "Cloudinary Upload",
            autoHideDelay: 5000,
            appendToast: false
          });
          this.cameraState = true;

          // eslint-disable-next-line no-console
          console.log("upload to cloudinary:", result);
        })
        .catch(err => {
          this.$bvToast.toast(
            `Upload to Cloudinary unsuccessful. Check settings.`,
            {
              title: "Cloudinary Upload",
              autoHideDelay: 5000,
              appendToast: false
            }
          );
          // eslint-disable-next-line no-console
          console.log("upload to cloudinary error:", err);
        });
    },
    snapshot: function() {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.canvas
        .getContext("2d")
        .drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      this.fileData = this.canvas.toDataURL("image/jpeg");
      this.isPhoto = true;
      this.cameraState = false;
      //remove any hidden links used for download
      let hiddenLinks = document.querySelectorAll(".hidden_links");
      for (let hiddenLink of hiddenLinks) {
        document.querySelector("body").remove(hiddenLink);
      }
    },
    stop: function() {
      this.video.pause();
      if (this.currentStream) {
        this.currentStream.getTracks().forEach(track => {
          track.stop();
        });
        this.video.srcObject = null;
      }

      this.video.removeAttribute("src");
      this.video.load();
      this.canvas
        .getContext("2d")
        .clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.isPhoto = false;
      this.cameraState = false;
    },
    start: function() {
      this.stop();
      //when starting up again use first option
      this.selectedDevice = this.options[0].value;
      this.getMedia().then(result => {
        this.isStartEnabled = false;
        this.cameraState = true;
        // eslint-disable-next-line no-console
        console.log("start camera:", result);
      });
    },
    download: function() {
      if (this.fileData) {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.canvas
          .getContext("2d")
          .drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        let a = document.createElement("a");
        a.classList.add("hidden-link");
        a.href = this.fileData;
        a.textContent = "";
        a.target = "_blank";
        a.download = "photo.jpeg";
        document.querySelector("body").append(a);
        a.click();
      }
    },
    getMedia: async function() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(
          this.constraints
        );
        window.stream = this.stream;
        this.currentStream = window.stream;
        this.video.srcObject = window.stream;
        return true;
      } catch (err) {
        throw err;
      }
    },
    deviceChange: function() {
      this.stop();
      //don't change selected device
      this.setConstraints();
      this.getMedia().then(result => {
        this.isStartEnabled = false;
        this.cameraState = true;
        // eslint-disable-next-line no-console
        console.log("device change:", result);
      });
    },
    setConstraints: function() {
      const videoContstraints = {};

      if (this.selectedDevice === null) {
        videoContstraints.facingMode = "environment";
      } else {
        videoContstraints.deviceId = {
          exact: this.selectedDevice
        };
      }

      this.constraints = {
        video: videoContstraints,
        audio: false
      };
    },
    getDevices: async function() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return false;
      }
      try {
        let allDevices = await navigator.mediaDevices.enumerateDevices();
        for (let mediaDevice of allDevices) {
          if (mediaDevice.kind === "videoinput") {
            let option = {};
            option.text = mediaDevice.label;
            option.value = mediaDevice.deviceId;
            this.options.push(option);
            this.devices.push(mediaDevice);
          }
        }
        return true;
      } catch (err) {
        throw err;
      }
    }
  },
  mounted() {
    this.canvas = document.querySelector("canvas");
    this.video = document.querySelector("video");
    this.getDevices()
      .then(res => {
        //when first loaded selected device can use 1st option
        this.selectedDevice = this.options[0].value;
        this.setConstraints();
        // eslint-disable-next-line no-console
        console.log("get devices:", res);
      })
      .then(() => {
        this.getMedia().then(res => {
          this.isStartEnabled = false;
          // eslint-disable-next-line no-console
          console.log("get media", res);
        });
      });
  }
};
</script>

<style scoped>
button:disabled {
  background: lightgray;
  color: black;
}
select option:disabled {
  color: lightgray;
  font-weight: bold;
}
form {
  margin: 1em;
}

@media only screen and (min-width: 600px) {
  .btn-group button {
    margin: 0 0.5em;
    border-radius: 1em !important;
    font-size: 1em;
    width: 6em;
  }
}
.hidden-link {
  visibility: hidden;
}
</style>
