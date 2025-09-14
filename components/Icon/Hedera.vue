<template>
    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" :fill="color" />
        <path
            d="M17 17h-1.562v-3.392H8.562V17H7V6h1.562v3.31h6.876V6H17v11Zm-8.364-4.661h6.876v-1.753H8.636v1.753Z"
            :fill="color2"
        />
    </svg>
</template>

<script setup>
const props = defineProps({
    color: {
        type: String,
        default: "#000",
    },
});

const color2 = props.color === "#000" ? "#fff" : "#000";
</script>
