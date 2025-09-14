<template>
    <main>
        <Header :gradient="true" />

        <section class="section">
            <div class="container flex flex-col gap-8">
                <DashboardNav :active="'links'" />
                <div class="flex gap-5 flex-wrap md:flex-nowrap">
                    <div class="flex gap-2 order-1 flex-grow">
                        <div class="btn" :class="{ 'btn--light': !showAll }" @click="handleFilterAll">All</div>
                        <div class="btn" :class="{ 'btn--light': showAll }" @click="handleFilterActive">Active</div>
                    </div>

                    <input
                        v-model="searchText"
                        type="text"
                        class="!bg-white order-3 md:order-2"
                        placeholder="Search links"
                    />

                    <NuxtLink to="/create" class="btn gap-3 order-2 md:order-3">
                        <span class="flex justify-center items-center size-6 bg-black rounded-full -ml-3 text-primary"
                            >+</span
                        >
                        New link
                    </NuxtLink>
                </div>

                <ClientOnly>
                    <div v-if="!loading && isLoggedIn && filteredLinks.length > 0">
                        <TransitionGroup class="flex flex-col gap-2" name="list" tag="div">
                            <CardLink
                                v-for="(link, index) in filteredLinks"
                                :key="link.id"
                                :lastLogin="user.lastLogin"
                                v-bind="link"
                                :handleDelete="handleDelete"
                            />
                        </TransitionGroup>
                    </div>

                    <div v-else class="flex flex-col gap-4">
                        <h2 class="text-xl text-body">No links found</h2>
                        <p class="text-body" v-if="showAll && searchText == ''">You don't have any links yet.</p>
                    </div>
                </ClientOnly>
            </div>
        </section>
    </main>
</template>

<script setup>
import { ref } from "vue";

useHead({
    title: "Dashboard - HashFast",
});

const searchText = ref("");
const showAll = ref(true);
const allLinks = ref([]);

const { user, loading, error, isLoggedIn, fetchUser } = useAuth();

if (process.client) {
    await fetchUser();
}

if (user.value) {
    try {
        allLinks.value = await $fetch("/api/links", {
            query: { authorId: user.value.id }, // filtered
        });
    } catch (error) {
        console.error("Failed to fetch links:", error);
    }
}

const links = computed(() => {
    return showAll.value ? allLinks.value : allLinks.value.filter((link) => isActiveLink(link));
});

const filteredLinks = computed(() => {
    const term = searchText.value.toLowerCase();
    if (!term) return links.value;
    return links.value.filter((link) => (link.name ? link.name.toLowerCase().includes(term) : false));
});

const handleFilterActive = function () {
    // links.value = links.value.filter((link) => isActiveLink(link));
    showAll.value = false;
};

const handleFilterAll = function () {
    // links.value = allLinks.value;
    showAll.value = true;
};

const handleDelete = async (id) => {
    try {
        await $fetch(`/api/links/${id}`, {
            method: "DELETE",
        });

        allLinks.value = allLinks.value.filter((link) => link.id !== id);
    } catch (error) {
        if (error.statusCode === 400) {
            console.error("Error:", error.message);
        }
    }
};

const isActiveLink = function (link) {
    const now = new Date();
    return link.expires
        ? new Date(link.expires) >= new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        : true;
};
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
    transition: all 0.2s linear;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
}
</style>
