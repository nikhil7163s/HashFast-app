<template>
    <main class="">
        <Header :gradient="true" />
        <div class="container flex flex-col justify-center items-center gap-4 pt-40">
            <form
                v-if="showForm"
                @submit.prevent="createLink"
                class="card block bg-white border border-body/10 rounded-2xl relative min-w-full sm:min-w-md sm:w-md pt-16"
            >
                <div class="card__header">
                    <div>
                        <img v-if="link.image" class="" :src="link.image" width="50" height="50" />
                        <div v-else>
                            <IconFlash />
                        </div>
                    </div>
                </div>

                <div class="p-5 flex flex-col gap-4">
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <input
                            type="number"
                            v-model="link.amount"
                            placeholder="Amount"
                            class="sm:col-span-2"
                            min="0"
                            step="any"
                        />
                        <select v-model="link.currency" class="">
                            <option value="*">---</option>
                            <option value="hbar">HBAR</option>
                            <option value="usdc">USDC</option>
                        </select>
                    </div>
                    <div>
                        <input type="text" v-model="link.name" placeholder="Description" />
                    </div>
                    <div>
                        <div class="flex gap-2 items-center cursor-pointer font-light" @click="toggleOptionalFields">
                            {{ showOptionalFields ? "Hide" : "More" }} options
                            <svg
                                width="12"
                                height="12"
                                xmlns="http://www.w3.org/2000/svg"
                                class="transform transition-transform"
                                :class="{ 'rotate-180': showOptionalFields }"
                            >
                                <path
                                    d="m3 5 3 3 3-3"
                                    stroke="#000"
                                    stroke-width="1.5"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </div>

                        <div
                            ref="optional-fields"
                            class="opacity-0 invisible h-0 transition-opacity duration-300 ease-in-out flex flex-col gap-3"
                            :class="{ 'opacity-100 h-auto visible': showOptionalFields }"
                        >
                            <div class="pt-4 flex flex-col gap-1">
                                <h4>Memo (public)</h4>
                                <div>
                                    <input type="text" name="memo" v-model="link.memo" />
                                </div>
                            </div>
                            <div class="flex flex-col gap-1">
                                <h4>Expiration date</h4>

                                <input type="date" name="expires" :value="formattedDate" @input="onDateInput" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="border-t border-t-body/15 p-5">
                    <div class="flex items-center justify-end">
                        <div class="flex flex-grow"></div>
                        <button type="submit" class="btn gap-3">
                            <span>Next</span> <ChevronDown class="-rotate-90" color="#816a37" />
                        </button>
                    </div>
                </div>
            </form>
            <div
                v-else
                class="block bg-white border border-body/10 rounded-2xl relative min-w-full sm:min-w-md sm:w-md"
            >
                <div class="p-5 flex flex-col gap-4 items-start">
                    <div class="btn" @click="goBack"><ChevronDown class="rotate-90 -ml-3" /> Back</div>

                    <h3 class="font-bold text-2xl">Personalized link created!</h3>

                    <p>
                        Your link is ready! You can now share it. Don't lose it because it is not stored on your
                        account.
                    </p>

                    <div class="flex w-full">
                        <a
                            :href="linkWithParams"
                            class="flex flex-grow gap-2 items-center cursor-pointer"
                            @click="handleCopyClick"
                        >
                            {{ copied ? "Copied!" : "Copy link" }} <IconCopy />
                        </a>

                        <NuxtLink :to="linkWithParams + '&qr=true'" class="btn btn--small btn--dark flex gap-2"
                            ><IconLink color="#fff" />Show QR</NuxtLink
                        >
                    </div>

                    <SocialShare :permalink="linkWithParams" :title="'Payment request: ' + link.name" />
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref } from "vue";
import { useRequestURL } from "nuxt/app";
import ChevronDown from "~/components/Icon/ChevronDown.vue";
const route = useRoute();
const { user, loading, error, isLoggedIn, fetchUser } = useAuth();
await fetchUser();

useHead({
    title: "Personalize link - HashFast",
});

const url = useRequestURL();
const fullUrl = url.href;
const username = ref(null);
const showOptionalFields = ref(false);
const showForm = ref(true);
const linkWithParams = ref(null);
const copied = ref(false);
const newDetails = ref({});

const { data: baseLink } = await useAsyncData("baseLink", () => $fetch(`/api/links/${route.params.slug}`));

// deep copy baselink to link
const link = ref({
    ...baseLink.value,
});

if (user) {
    username.value = user.value.name;
}

const formattedDate = computed(() => {
    return link.value.expires ? link.value.expires.substring(0, 10) : "";
});

function onDateInput(e) {
    const input = e.target;
    link.value.expires = input.value ? new Date(input.value) : null;
}

const goBack = () => {
    showForm.value = true;
    linkWithParams.value = null;
};

const toggleOptionalFields = () => {
    showOptionalFields.value = !showOptionalFields.value;
};

const createLink = async () => {
    try {
        for (const [key, value] of Object.entries(baseLink.value)) {
            if (value !== link.value[key]) {
                newDetails.value[key] = link.value[key];
            }
        }

        // check newDetails is not empty
        if (Object.keys(newDetails.value).length === 0) {
            return;
        }

        let viewPath = fullUrl.replace("/params/", "/view/");

        let encodedUrlParams = btoa(JSON.stringify(newDetails.value));

        linkWithParams.value = viewPath + "?p=" + encodedUrlParams;
        showForm.value = false;
    } catch (error) {
        console.error("Failed to create link:", error);
    }
};

function handleCopyClick(event) {
    event.preventDefault();
    copyLink();
}

const copyLink = async () => {
    try {
        await navigator.clipboard.writeText(linkWithParams.value);
        copied.value = true;

        setTimeout(() => {
            copied.value = false;
        }, 5000);
    } catch (err) {
        console.error("Failed to copy:", err);
    }
};
</script>
