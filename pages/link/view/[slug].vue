<template>
    <main class="min-h-dvh flex justify-center items-center">
        <Header :gradient="true" v-if="user" />

        <div
            class="container flex flex-col justify-center items-center gap-4 w-full sm:w-md"
            :class="{ 'py-40': user }"
        >
            <div class="card bg-white border border-body/10 rounded-2xl relative pt-14 w-full" v-if="link">
                <div class="card__header">
                    <img v-if="link.image" :src="link.image" width="60" height="60" />
                    <div v-else>
                        <IconFlash />
                    </div>
                </div>

                <div
                    v-if="route.query.qr"
                    class="flex flex-col gap-0 pb-4 items-center justify-center border-b border-body/15"
                >
                    <QrCode :value="url" @change="onUrlChange" />

                    <a :href="route.path" class="flex flex-grow gap-2 items-center cursor-pointer" @click="copyLink">
                        {{ copied ? "Copied!" : "Copy link" }} <IconCopy />
                    </a>
                </div>

                <div class="p-5 flex flex-col gap-4" v-if="link.id">
                    <h3 class="font-bold text-xl" v-if="baseLink.amount && baseLink.currency">
                        To pay: {{ link.amount }} <span class="uppercase">{{ link.currency }}</span>
                    </h3>
                    <div v-else-if="!isQrUrl" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <input type="text" placeholder="Enter the amount" class="sm:col-span-2" v-model="link.amount" />

                        <input
                            v-if="baseLink.currency != '*' && link.currency"
                            type="text"
                            v-model="link.currency"
                            disabled
                            class="uppercase"
                        />
                        <select v-else v-model="link.currency" default="hbar">
                            <option value="hbar">HBAR</option>
                            <option value="usdc">USDC</option>
                        </select>
                    </div>
                    <div v-else>
                        <p>Scan the QR code to pay with {{ currencies }}</p>
                    </div>

                    <div v-if="link.name">
                        <h4>Description:</h4>
                        <p class="opacity-50">{{ link.name }}</p>
                    </div>

                    <div v-if="link.memo">
                        <h4>Memo (public):</h4>
                        <p class="opacity-50">{{ link.memo }}</p>
                    </div>

                    <div v-if="link.expires">
                        <h4>Payment due date:</h4>
                        <div class="flex justify-between gap-3 items-center">
                            <p class="opacity-50">{{ new Date(link.expires).toLocaleDateString("en-US") }}</p>
                            <span v-if="expired" class="bg-body/20 text-body rounded-sm px-3">expired</span>
                        </div>
                    </div>
                </div>

                <div v-else>No baseLink</div>

                <div class="border-t border-t-body/15 p-5">
                    <div class="flex items-start">
                        <div class="flex flex-grow" v-if="receiver">
                            <ul>
                                <li>
                                    To: <span class="opacity-50">{{ receiver.name }}</span>
                                </li>
                                <li>
                                    Wallet: <span class="opacity-50">{{ receiver.wallet }}</span>
                                </li>
                            </ul>
                        </div>

                        <div
                            v-if="
                                !route.query.qr &&
                                !expired &&
                                baseLink &&
                                ((baseLink.maxPayments && numPayments < baseLink.maxPayments) ||
                                    !baseLink.maxPayments) &&
                                !isPaid
                            "
                            class="btn gap-3"
                            :class="{ 'btn--disabled': !link.amount }"
                            @click="link.amount ? handlePayment() : null"
                        >
                            <IconHedera class="-ml-3" />
                            <span>Pay<span class="hidden md:inline"> now</span></span>
                        </div>

                        <span
                            v-if="
                                baseLink &&
                                baseLink.maxPayments != null &&
                                numPayments >= baseLink.maxPayments &&
                                !isPaid
                            "
                            class="bg-accent/20 text-accent rounded-sm px-3"
                            >Fully paid</span
                        >

                        <span v-if="isPaid" class="bg-accent/20 text-accent rounded-2xl px-3">Payment received!</span>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-4 text-center" v-if="!isPaid">
                <p>or</p>
                <NuxtLink v-if="route.query.qr" :to="route.path" class="btn btn--small btn--dark"
                    >Pay on this device</NuxtLink
                >
                <NuxtLink v-else :to="qrUrl" class="btn btn--small btn--dark">Pay with another device</NuxtLink>
            </div>
        </div>
    </main>
</template>

<script setup>
import { HederaService } from "~/lib/hedera";
import { QrCode } from "#components";
import { ref, computed, watchEffect, onMounted } from "vue";

const route = useRoute();

const baseLink = ref(null);
const link = ref(null);
const receiver = ref(null);

const isPaid = ref(false);
const copied = ref(false);
const paymentUrl = ref(null);
const qrUrl = ref(route.path + "?qr=true");
console.log(route.query.qr);

const isQrUrl = computed(() => route.query.qr === "true");

const url = ref("");

const hederaService = new HederaService();

// get url params
const encodedParams = route.query;

let params = {};
if (encodedParams && encodedParams.p) {
    params = JSON.parse(atob(encodedParams.p));
}

const fetchBaseLink = async () => {
    try {
        baseLink.value = await $fetch(`/api/links/${route.params.slug}`);

        // add url param values to baselink
        if (Object.keys(params).length > 0) {
            for (const [key, value] of Object.entries(params)) {
                if (baseLink.value[key] != value) {
                    console.log(`Updating ${key} to ${value}`);
                    baseLink.value[key] = value;
                }
            }
        }
        // Make a shallow copy to work on
        link.value = { ...baseLink.value };

        // add accountId
        const { data: toUser } = await useAsyncData("toUser", () => $fetch(`/api/users/${link.value.authorId}`));
        link.value.accountId = toUser.value.wallet;

        // Fetch receiver after baseLink is loaded
        receiver.value = await $fetch(`/api/users/${baseLink.value.authorId}`);
    } catch (err) {
        console.error("Failed to fetch baseLink or receiver:", err);
    }
};
await fetchBaseLink();

const numPayments = computed(() => baseLink.value?.payments?.length || 0);

// User auth (assuming useAuth is composable returning refs)
const { user, loading, error, isLoggedIn, fetchUser } = useAuth();

if (process.client) {
    await fetchUser();
}

if (error) {
    console.log("Auth error:", error.value);
}

// Computed currencies string, safe
const currencies = computed(() => {
    return link.value?.currency ? link.value.currency.toUpperCase() : "HBAR or USDC";
});

// Copy link function
const copyLink = async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 5000);
    } catch (err) {
        console.error("Failed to copy:", err);
    }
};

// Check expiration
const isExpired = (date) => {
    if (!date) return false;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const dateStr = date.split("T")[0];
    return dateStr < todayStr;
};

const expired = computed(() => isExpired(baseLink.value?.expires));

// Update url on mount
onMounted(() => {
    if (typeof window !== "undefined") {
        url.value = window.location.href.split("?")[0] + "?pay=true";
    }
});

// Payment handler
const handlePayment = async () => {
    try {
        const response = await hederaService.sendPayment(link.value);

        if (typeof response !== "object") {
            throw new Error(response);
        }

        const { transactionId, receipt } = response;

        if (receipt.status._code === 22) {
            isPaid.value = true;
            try {
                await $fetch("/api/payments", {
                    method: "POST",
                    body: { transactionId, linkId: link.value.id },
                });
            } catch (storeErr) {
                console.error("Failed to store payment:", storeErr);
            }
        } else {
            console.log("Payment receipt:", receipt);
        }
    } catch (err) {
        console.error("Failed to send payment:", err);
    }
};

// onUrlChange handler
const onUrlChange = (newUrl) => {
    paymentUrl.value = newUrl;
};

// Update page title reactively
watchEffect(() => {
    let title = "HashFast";
    if (receiver.value) {
        if (link.value?.amount && link.value?.currency) {
            title = `Pay ${link.value.amount} ${link.value.currency.toUpperCase()} to ${receiver.value.name}`;
        } else {
            title = `Pay ${receiver.value.name}`;
        }
    }
    useHead({ title, meta: [{ name: "description", content: "Pay quickly on Hedera with HashFast." }] });
});
</script>
