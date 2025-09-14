<template>
    <svg id="chevron-down" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
        <path d="m14 5-6 6-6-6" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
</template>

<script setup>
const props = defineProps({
    color: {
        type: String,
        default: "#8E8E8E",
    },
});
</script>
