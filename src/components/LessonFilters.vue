<script setup>
defineProps({
  searchText: { type: String, required: true },
  teachers: { type: Array, default: () => [] },
  selectedTeacher: { type: String, required: true },
  sortBy: { type: String, required: true },
  sortDirection: { type: String, required: true },
});
// Define emits for the events that this component will emit
const emit = defineEmits([
  'search-input',
  'teacher-change',
  'sort-by-change',
  'sort-direction-change',
]);
</script>

<template>
  <div class="row g-2 align-items-end mb-3">
    <div class="col-12 col-md-4">
      <label class="form-label" for="lesson-search">Search</label>
      <input
        id="lesson-search"
        class="form-control"
        type="search"
        placeholder="Search lessons"
        :value="searchText"
        @input="emit('search-input', $event.target.value)"
      />
    </div>

    <div class="col-12 col-md-3">
      <label class="form-label" for="teacher-filter">Teacher</label>
      <select
        id="teacher-filter"
        class="form-select"
        :value="selectedTeacher"
        @change="emit('teacher-change', $event.target.value)"
      >
        <option value="">All teachers</option>
        <option v-for="teacher in teachers" :key="teacher._id" :value="teacher._id">
          {{ teacher.firstName }} {{ teacher.lastName }}
        </option>
      </select>
    </div>

    <div class="col-6 col-md-2">
      <label class="form-label" for="sort-by">Sort by</label>
      <select
        id="sort-by"
        class="form-select"
        :value="sortBy"
        @change="emit('sort-by-change', $event.target.value)"
      >
        <option value="topic">Subject</option>
        <option value="location">Location</option>
        <option value="price">Price</option>
        <option value="space">Availability</option>
      </select>
    </div>

    <div class="col-6 col-md-3">
      <label class="form-label" for="sort-direction">Order</label>
      <select
        id="sort-direction"
        class="form-select"
        :value="sortDirection"
        @change="emit('sort-direction-change', $event.target.value)"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  </div>
</template>
