<template>
  <div id="gallery">
    <h2>Gallery</h2>
    <section id="images"></section>
  </div>
</template>

<script>
export default {
  name: "gallery",

  mounted() {
    //get cloudname and preset from local storage
    if (this.$ls.get("cloudname")) {
      this.cloudname = this.$ls.get("cloudname");
    }
    if (this.$ls.get("preset")) {
      this.preset = this.$ls.get("preset");
    }
    //if these aren't set don't allow browse
    /*global cloudinary*/
    /*eslint no-undef: "error"*/
    this.myGallery = cloudinary.galleryWidget({
      container: "#images",
      cloudName: this.cloudname,
      mediaAssets: [{ tag: "browser_upload" }]
    });
    this.myGallery.render();
  },
  beforeDestroy: function() {
    this.myGallery.destroy;
  },
  data() {
    return {
      myGallery: null
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
    }
  }
};
</script>

<style scoped>
#images {
  width: 80%;
  height: 20%;
}
</style>
