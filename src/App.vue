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

onMounted(async () => {
    await loadLessons();
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
            // Lesson search and filter controls

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
    </main>
</template>
