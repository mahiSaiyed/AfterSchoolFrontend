<script setup>
import { computed } from 'vue';
import FormField from './FormField.vue';

const props = defineProps({
  cart: { type: Array, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  validName: { type: Boolean, required: true },
  validPhone: { type: Boolean, required: true },
  canCheckout: { type: Boolean, required: true },
});

defineEmits(['remove', 'browse', 'update-name', 'update-phone', 'checkout']);

const total = computed(() => props.cart
  .reduce((sum, item) => sum + item.price * item.quantity, 0));
</script>

<template>
  <section>
    <h2 class="h3 mb-3">Shopping Cart</h2>

    <div v-if="cart.length === 0" class="alert alert-info">
      <p>Your cart is empty.</p>
      <button class="btn btn-outline-primary" type="button" @click="$emit('browse')">
        Browse lessons
      </button>
    </div>

    <div v-else class="row g-3">
      <div class="col-12 col-lg-7">
        <ul class="list-group">
          <li
            v-for="item in cart"
            :key="item.lessonId"
            class="list-group-item d-flex justify-content-between align-items-center gap-3"
          >
            <div>
              <strong>{{ item.topic }}</strong>
              <div class="text-muted small">{{ item.location }} · £{{ item.price }} each</div>
              <div class="small">Quantity: {{ item.quantity }}</div>
            </div>
            <div class="text-end">
              <strong>£{{ item.price * item.quantity }}</strong>
              <div>
                <button class="btn btn-link btn-sm text-danger p-0" type="button" @click="$emit('remove', item)">
                  Remove
                </button>
              </div>
            </div>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <strong>Total</strong>
            <strong>£{{ total }}</strong>
          </li>
        </ul>
      </div>

      <div class="col-12 col-lg-5">
        <form class="card card-body" @submit.prevent="$emit('checkout')">
          <h3 class="h5">Checkout</h3>
          <FormField
            id="customer-name"
            :model-value="name"
            label="Name"
            placeholder="Your name"
            autocomplete="name"
            :error="name && !validName ? 'Use letters and spaces only.' : ''"
            @update:model-value="$emit('update-name', $event)"
          />
          <FormField
            id="customer-phone"
            :model-value="phone"
            label="Phone"
            placeholder="Your phone number"
            autocomplete="tel"
            inputmode="numeric"
            :error="phone && !validPhone ? 'Use digits only.' : ''"
            @update:model-value="$emit('update-phone', $event)"
          />
          <button class="btn btn-success" type="submit" :disabled="!canCheckout">
            Submit order
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
