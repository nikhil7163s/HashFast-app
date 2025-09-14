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
                        <h1 class="text-[38px] font-semibold">
                            Make payments easier for everyone with
                            <span class="bg-[#138462] inline-block transform rotate-[-1deg] px-4 rounded-md"
                                ><Logo
                            /></span>
                        </h1>
                    </div>
                </div>
                <div class="md:col-span-5">
                    <div class="animate-slide-up bg-white p-8 rounded-3xl">
                        <div class="flex flex-col gap-4" v-if="showCreateForm">
                            <h2 class="text-[2rem] text-body">Register now</h2>
                            <form @submit.prevent="createUser" class="space-y-4">
                                <div class="flex flex-col gap-2">
                                    <label for="email" class="block text-body">Email</label>
                                    <input
                                        v-model="newUser.email"
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
                                        v-model="newUser.password"
                                        type="password"
                                        id="password"
                                        class=""
                                        placeholder="Password"
                                        required
                                    />
                                    <input
                                        v-model="newUser.password2"
                                        type="password"
                                        id="password2"
                                        class=""
                                        placeholder="Confirm password"
                                        required
                                    />
                                </div>
                                <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
                                <div class="flex gap-4">
                                    <button type="submit" :disabled="creating" class="btn">
                                        {{ creating ? "Processing..." : "Register" }}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div v-else-if="showDetailsForm">
                            <h2 class="text-[2rem] text-body">Enter your details</h2>

                            <form @submit.prevent="updateUser" class="space-y-4">
                                <div class="flex flex-col gap-2">
                                    <label for="email" class="block text-body">Name</label>
                                    <input v-model="user.name" type="text" id="name" required class="" />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label for="password" class="block text-body">Hedera Wallet ID</label>
                                    <div class="flex gap-3">
                                        <input
                                            v-model="user.wallet"
                                            type="text"
                                            id="wallet"
                                            class="flex-grow"
                                            placeholder="Type or click 'Detect'"
                                            required
                                        />
                                        <button class="btn btn--dark btn--square" @click="detectWallet">Detect</button>
                                    </div>
                                </div>
                                <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
                                <div class="flex gap-4">
                                    <button type="submit" :disabled="creating" class="btn">
                                        {{ creating ? "Processing..." : "Save" }}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div v-else class="flex flex-col gap-4">
                            <h2 class="text-[2rem] text-body">Registration successful!</h2>
                            <p class="text-body">You can now log in with your email and password.</p>

                            <NuxtLink to="/login" class="btn self-start">Login</NuxtLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { h } from "vue";
import { HederaService } from "~/lib/hedera";

const hederaService = new HederaService();

const showCreateForm = ref(true);
const showDetailsForm = ref(false);
const creating = ref(false);
const newUser = ref({
    email: "",
    password: "",
    password2: "",
});

let userId = null;

const user = ref({
    name: "",
    wallet: "",
});

let error = ref(null);

const detectWallet = async (event) => {
    event.preventDefault();
    try {
        await hederaService.initHashConnect();
        await hederaService.waitForPairing();

        if (hederaService.pairingData) {
            // get last item in array
            user.value.wallet = hederaService.pairingData.accountIds[hederaService.pairingData.accountIds.length - 1];
        }
    } catch (error) {
        console.error("Failed to detect wallet:", error);
    }
};

const createUser = async () => {
    creating.value = true;
    try {
        // check password and password2 match
        if (newUser.value.password !== newUser.value.password2) {
            error.value = "Passwords do not match";
            throw new Error("Passwords do not match");
        }

        try {
            const response = await $fetch("/api/users", {
                method: "POST",
                body: newUser.value,
            });

            userId = response.id;

            // Reset form and refresh data
            newUser.value = { email: "", password: "", password2: "" };
            error.value = null;
            showCreateForm.value = false;
            showDetailsForm.value = true;
        } catch (error) {
            console.error("Failed to create user:", error);
        }
    } catch (error) {
        console.error("Failed to create user:", error);
    } finally {
        creating.value = false;
    }
};

const updateUser = async () => {
    creating.value = true;
    try {
        if (!user.value.wallet.startsWith("0.0.")) {
            error.value = "Invalid Hedera Wallet ID";
            throw new Error("Invalid Hedera Wallet ID");
        }

        await $fetch("/api/users/" + userId, {
            method: "PATCH",
            body: user.value,
        });
        showDetailsForm.value = false;
    } catch (error) {
        console.error("Failed to update user:", error);
    } finally {
        creating.value = false;
    }
};
</script>
