<template>
  <div class="home">
    <camera></camera>
  </div>
</template>

<script>
import Camera from "@/components/Camera.vue";
export default {
  name: "Home",
  data() {
    return {
    };
  },
  components: {
    camera: Camera
  },
};
</script>

