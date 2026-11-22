<script setup>
import { computed } from 'vue';

const props = defineProps({
  lesson: {
    type: Object,
    required: true,
  },
});

defineEmits(['add']);

const teacherNames = computed(() => (props.lesson.teachers || [])
  .map((teacher) => `${teacher.firstName} ${teacher.lastName}`)
  .join(', '));
</script>

<template>
  <article class="card h-100">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <i :class="['fa-solid', lesson.icon, 'lesson-icon']" aria-hidden="true"></i>
        <span :class="lesson.space > 0 ? 'badge text-bg-success' : 'badge text-bg-danger'">
          {{ lesson.space }} spaces
        </span>
      </div>

      <p class="small text-uppercase text-muted mb-1">{{ lesson.topic }}</p>
      <h2 class="h5">{{ lesson.title }}</h2>
      <p class="text-muted mb-3">{{ teacherNames }}</p>

      <div class="d-flex justify-content-between">
        <span><i class="fa-solid fa-location-dot" aria-hidden="true"></i> {{ lesson.location }}</span>
        <strong>£{{ lesson.price }}</strong>
      </div>
    </div>

    <div class="card-footer bg-white border-0 pt-0">
      <button
        class="btn btn-primary w-100"
        type="button"
        :disabled="lesson.space === 0"
        @click="$emit('add', lesson)"
      >
        {{ lesson.space === 0 ? 'Fully booked' : 'Add to cart' }}
      </button>
    </div>
  </article>
</template>
