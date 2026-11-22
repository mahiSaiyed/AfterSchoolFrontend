<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const lessons = ref([]);
const lessonCatalog = ref([]);
const teachers = ref([]);
const cart = ref([]);
const showCart = ref(false);
const sortBy = ref("topic");
const sortDirection = ref("asc");
const searchText = ref("");
const selectedTeacher = ref("");
const name = ref("");
const phone = ref("");
const loading = ref(true);
const errorMessage = ref("");
const confirmation = ref("");
</script>

<template>
  <header>
    
  </header>

  <main>
  </main>
</template>