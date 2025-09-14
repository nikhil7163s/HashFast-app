<template>
    <main>
        <Header :gradient="true" />
        <div class="container flex flex-col justify-center items-center gap-4 pt-40">
            <h1 class="text-6xl font-bold text-red-600">{{ error.statusCode || 500 }}</h1>
            <p class="mt-4 text-lg text-gray-600">
                {{ error.statusMessage || "An unexpected error occurred." }}
            </p>
            <NuxtLink to="/" class="btn btn--small btn--dark">Back to Home</NuxtLink>
        </div>
    </main>
</template>

<script setup>
const error = useError();
</script>
