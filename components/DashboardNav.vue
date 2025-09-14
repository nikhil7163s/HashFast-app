<template>
    <nav class="border-b border-body/20 py-4">
        <div class="flex gap-4">
            <NuxtLink
                to="/dashboard/links"
                class="px-3 py-2 hover:bg-body/20 rounded-lg flex items-center gap-2 transition-colors"
                :class="{ 'bg-body/20': active === 'links' }"
            >
                <IconLinkGlow />
                Links
            </NuxtLink>
            <NuxtLink
                to="/dashboard/subscriptions"
                class="px-3 py-2 hover:bg-body/20 rounded-lg flex items-center gap-2 transition-colors"
                :class="{ 'bg-body/20': active === 'subscriptions' }"
            >
                <IconSubscription />
                Subscriptions
            </NuxtLink>
        </div>
    </nav>
</template>

<script setup>
const props = defineProps({
    active: {
        type: String,
        required: true,
    },
});
</script>
