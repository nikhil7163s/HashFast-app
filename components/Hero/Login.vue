<template>
    <div class="hero relative h-dvh hero--center">
        <div class="hero__bg"></div>
        <div class="container z-[2]">
            <div class="grid md:grid-cols-12 gap-5 items-center">
                <div class="md:col-span-5 md:col-start-2 flex flex-col gap-4 text-white md:translate-[-30px]">
                    <NuxtLink to="/" class="flex gap-[10px] items-center text-[18px]">
                        <IconArrowLeft />
                        Back
                    </NuxtLink>

                    <div class="flex-col gap-4 hidden md:flex">
                        <h1 class="text-[38px] font-semibold leading-[1.25]">
                            Check the status of your payment requests
                        </h1>
                    </div>
                </div>
                <div class="md:col-span-5">
                    <div class="animate-slide-up bg-white p-8 rounded-3xl">
                        <div class="flex flex-col gap-4">
                            <h2 class="text-[2rem] text-body">Login</h2>
                            <form @submit.prevent="handleLogin" class="space-y-4">
                                <div class="flex flex-col gap-2">
                                    <label for="email" class="block text-body">Email</label>
                                    <input
                                        v-model="email"
                                        type="email"
                                        id="email"
                                        required
                                        class=""
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label for="password" class="block text-body">Password</label>
                                    <input
                                        v-model="password"
                                        type="password"
                                        id="password"
                                        class=""
                                        placeholder="Password"
                                        required
                                    />
                                </div>
                                <div class="flex gap-4">
                                    <button type="submit" class="btn">Log in</button>
                                </div>
                                <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const router = useRouter();

const handleLogin = async () => {
    error.value = "";
    loading.value = true;

    try {
        const res = await $fetch("/api/auth/login", {
            method: "POST",
            body: { email: email.value, password: password.value },
            credentials: "include", // send cookies
        });

        await router.push("/dashboard/links");
    } catch (err) {
        error.value = err?.data?.message || "Login failed";
    } finally {
        loading.value = false;
    }
};
</script>
