<template>
    <NuxtPage :key="pageKey" />
</template>

<style scoped></style>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const forceRemountRoutes = ["link-view-id", "link-share-id", "link-params-id"];

const pageKey = computed(() => {
    if (forceRemountRoutes.includes(route.name)) {
        return route.fullPath; // full reload for these
    }
    return route.name; // normal reuse for others
});
</script>
