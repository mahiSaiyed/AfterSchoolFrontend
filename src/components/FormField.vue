<script setup>
defineProps({
  id: { type: String, required: true },
  modelValue: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String, required: true },
  autocomplete: { type: String, default: 'off' },
  inputmode: { type: String, default: 'text' },
  error: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="mb-3">
    <label class="form-label" :for="id">{{ label }}</label>
    <input
      :id="id"
      class="form-control"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <div v-if="error" class="text-danger small mt-1">{{ error }}</div>
  </div>
</template>
