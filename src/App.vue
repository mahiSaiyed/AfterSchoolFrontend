<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { request } from "./utils/request.js";
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

// Validation computed properties
const validName = computed(() =>
    /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(name.value.trim()),
);
const validPhone = computed(() => /^\d+$/.test(phone.value.trim()));
const canCheckout = computed(
    () => cart.value.length > 0 && validName.value && validPhone.value,
);
const cartCount = computed(() =>
    cart.value.reduce((sum, item) => sum + item.quantity, 0),
);

async function loadLessons() {
    loading.value = true;
    errorMessage.value = "";
    try {
        const query = new URLSearchParams();
        if (selectedTeacher.value)
            query.set("teacherId", selectedTeacher.value);

        const path = searchText.value.trim()
            ? `/search?${new URLSearchParams({
                  q: searchText.value.trim(),
                  ...Object.fromEntries(query),
              })}`
            : `/lessons${query.size ? `?${query}` : ""}`;
        const results = await request(path);
        const visibleIds = new Set(results.map((lesson) => lesson._id));
        const visibleLessons = results.map((result) => {
            const existing = lessonCatalog.value.find(
                (lesson) => lesson._id === result._id,
            );
            const updated = { ...existing, ...result };
            if (
                existing &&
                cart.value.some((item) => item.lessonId === result._id)
            ) {
                updated.space = existing.space;
            }
            return updated;
        });

        lessonCatalog.value = [
            ...lessonCatalog.value.filter(
                (lesson) => !visibleIds.has(lesson._id),
            ),
            ...visibleLessons,
        ];
        lessons.value = visibleLessons;
    } catch (error) {
        errorMessage.value = error.message;
    } finally {
        loading.value = false;
    }
}

const sortedLessons = computed(() =>
    [...lessons.value].sort((a, b) => {
        const left = a[sortBy.value];
        const right = b[sortBy.value];
        const comparison =
            typeof left === "number"
                ? left - right
                : String(left ?? "").localeCompare(
                      String(right ?? ""),
                      undefined,
                      { sensitivity: "base" },
                  );
        return sortDirection.value === "asc" ? comparison : -comparison;
    }),
);

async function loadTeachers() {
    teachers.value = await request("/teachers");
}

function addToCart(lesson) {
    if (lesson.space < 1) return;
    lesson.space -= 1;
    const item = cart.value.find((entry) => entry.lessonId === lesson._id);
    if (item) {
        item.quantity += 1;
    } else {
        cart.value.push({
            lessonId: lesson._id,
            topic: lesson.topic,
            location: lesson.location,
            price: lesson.price,
            quantity: 1,
        });
    }
    confirmation.value = "";
}

function removeFromCart(item) {
    const lesson = lessonCatalog.value.find(
        (entry) => entry._id === item.lessonId,
    );
    if (lesson) lesson.space += item.quantity;
    cart.value = cart.value.filter((entry) => entry.lessonId !== item.lessonId);
}
//Checkout function
async function checkout() {
    if (!canCheckout.value) return;
    errorMessage.value = "";
    let orderSubmitted = false;

    try {
        const checkoutItems = cart.value.map((item) => {
            const lesson = lessonCatalog.value.find(
                (entry) => entry._id === item.lessonId,
            );
            if (!lesson || lesson.space < 0) {
                throw new Error(
                    "A lesson is no longer available. Refresh and try again.",
                );
            }
            return { item, lesson };
        });
        const order = {
            name: name.value.trim(),
            phoneNumber: phone.value.trim(),
            lessonIDs: cart.value.map((item) => item.lessonId),
            space: cartCount.value,
            items: cart.value.map(({ lessonId, quantity }) => ({
                lessonId,
                quantity,
            })),
        };

        await request("/orders", {
            method: "POST",
            body: JSON.stringify(order),
        });
        orderSubmitted = true;

        for (const { item, lesson } of checkoutItems) {
            const updated = await request(
                `/lessons/${encodeURIComponent(item.lessonId)}`,
                {
                    method: "PUT",
                    body: JSON.stringify({ space: lesson.space }),
                },
            );
            lesson.space = updated.space;
        }

        cart.value = [];
        name.value = "";
        phone.value = "";
        confirmation.value = "Your order has been submitted.";
        showCart.value = false;
    } catch (error) {
        if (orderSubmitted) {
            cart.value = [];
            name.value = "";
            phone.value = "";
            showCart.value = false;
            confirmation.value = "Your order was submitted.";
            errorMessage.value = `Lesson availability could not be fully updated. Contact the lesson provider before placing another order. ${error.message}`;
            return;
        }
        errorMessage.value = error.message;
    }
}

onMounted(async () => {
    let teachersError = "";
    try {
        await loadTeachers();
    } catch (error) {
        teachersError = error.message;
    }
    await loadLessons();
    if (teachersError && !errorMessage.value) {
        errorMessage.value = `Unable to load teachers: ${teachersError}`;
    }
});
</script>

<template>
    <main class="container py-4">
        <header class="d-flex justify-content-between align-items-center mb-3">
            <h1 class="h2 mb-0">After-School Lessons</h1>
            <button
                class="btn btn-outline-primary"
                type="button"
                :disabled="cartCount === 0"
                @click="showCart = !showCart">
                {{ showCart ? "Lessons" : "Cart" }} ({{ cartCount }})
            </button>
        </header>

        <p class="mb-4">Choose a lesson and add it to your cart.</p>

        <div v-if="confirmation" class="alert alert-success" role="status">
            {{ confirmation }}
        </div>
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
        </div>

        <section v-if="!showCart">
            <LessonFilters
                :search-text="searchText"
                :teachers="teachers"
                :selected-teacher="selectedTeacher"
                :sort-by="sortBy"
                :sort-direction="sortDirection"
                @search-input="searchLessons"
                @teacher-change="changeTeacher"
                @sort-by-change="sortBy = $event"
                @sort-direction-change="sortDirection = $event" />
            <p v-if="loading">Loading lessons...</p>
            <p v-else-if="lessons.length === 0">
                No lessons match your search.
            </p>
            <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                <div
                    v-for="lesson in sortedLessons"
                    :key="lesson._id"
                    class="col">
                    <LessonCard :lesson="lesson" @add="addToCart" />
                </div>
            </div>
        </section>
        <ShoppingCart
            v-else
            :cart="cart"
            :name="name"
            :phone="phone"
            :valid-name="validName"
            :valid-phone="validPhone"
            :can-checkout="canCheckout"
            @remove="removeFromCart"
            @browse="showCart = false"
            @update-name="name = $event"
            @update-phone="phone = $event"
            @checkout="checkout" />
    </main>
</template>
