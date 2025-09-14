<template>
    <main>
        <Header />

        <Hero-Home />
    </main>
</template>

<script setup>
const { user, loading, error, isLoggedIn, fetchUser, logout } = useAuth();

// if (process.client) {
await fetchUser();
// }

if (user.value) {
    navigateTo("/dashboard/links");
}

useHead({
    title: "HashFast",
});
</script>
