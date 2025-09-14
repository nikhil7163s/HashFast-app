<template>
    <main>
        <Header :gradient="true" />

        <section class="section">
            <div class="container flex flex-col gap-8">
                <DashboardNav :active="'subscriptions'" />

                <p>Coming soon</p>
            </div>
        </section>
    </main>
</template>

<script setup>
const { user, loading, error, isLoggedIn, fetchUser } = useAuth();
await fetchUser();
</script>
