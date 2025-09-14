<template>
    <div
        class="card-link bg-white rounded-2xl shadow-sm hover:shadow-[1px_1px_7px_rgba(30,30,30,0.2)] border border-body/10 transition-shadow duration-300 cursor-pointer"
    >
        <div class="grid grid-cols-3 lg:grid-cols-12 gap-5 items-center flex-start relative p-5" @click="togglePanel">
            <div
                class="col-span-3 lg:col-span-5 flex items-center gap-4 border-b border-body/15 pb-5 lg:pb-0 lg:border-none"
            >
                <div class="card-link__circle">
                    <div class="card-link__circle__inner">
                        <img v-if="image" className="" :src="image" width="60" height="60" />
                        <div v-else>
                            <IconFlash />
                        </div>
                    </div>
                    <div
                        class="absolute -bottom-2 bg-primary rounded-2xl text-xs p-1 px-2 text-[#816a37] text-center whitespace-nowrap"
                        v-if="amount != null || currency != '*'"
                    >
                        {{ amount }} {{ currency !== "*" ? currency.toUpperCase() : "" }}
                    </div>
                </div>
                <div class="flex flex-col">
                    <h3 class="color-body font-regular text-lg">
                        {{ name }}
                        <i v-if="!name">No description</i>
                    </h3>
                    <span class="color-body/50 text-sm font-normal">
                        <span v-if="memo"
                            >Memo: <span class="opacity-50">{{ memo }}</span></span
                        >
                        <i v-if="!memo" class="opacity-15">No memo</i></span
                    >
                </div>
            </div>
            <div class="lg:col-span-2 flex flex-start">
                <span
                    v-if="maxPayments !== null || payments.length > 0"
                    class="relative flex items-center gap-2 rounded-sm px-3 py-1 lg:py-2 whitespace-nowrap"
                    :class="{
                        'bg-primary/20 text-primary': getColor(maxPayments, payments.length) === 'primary', // yellow
                        'bg-accent/20 text-accent': getColor(maxPayments, payments.length) === 'accent', // green
                        'bg-body/20 text-body': getColor(maxPayments, payments.length) === 'body',
                    }"
                >
                    <!-- <div
                        class="absolute bg-accent text-white leading-none rounded-full top-[-8px] right-[-8px] size-[16px] flex items-center justify-center text-xs visible transition-opacity duration-300 ease-in-out"
                        :class="{
                            'opacity-0 invisible': numNewPayments == 0,
                        }"
                    >
                        {{ numNewPayments }}
                    </div> -->
                    <span class="font-bold flex gap-1">
                        <span>{{ payments.length }}</span>
                        <span v-if="maxPayments" class="font-normal">/</span>
                        <span class="font-normal" v-if="maxPayments">{{ maxPayments }}</span>
                    </span>
                </span>
            </div>

            <div class="lg:col-span-2">
                <div>{{ new Date(createdAt).toLocaleDateString("en-US") }}</div>
                <div v-if="expires" class="text-sm opacity-40">
                    Expires: {{ new Date(expires).toLocaleDateString("en-US") }}
                </div>
            </div>
            <div class="lg:col-span-2 flex flex-col items-end">
                <div class="bg-primary/20 text-primary rounded-md px-3 py-1 lg:py-2" v-if="state == 'waiting'">
                    waiting
                </div>
                <div class="bg-body/20 text-body rounded-sm px-3 py-1 lg:py-2" v-else-if="state == 'expired'">
                    expired
                </div>
                <div class="bg-accent/20 text-accent rounded-sm px-3 py-1 lg:py-2 whitespace-nowrap" v-else>
                    <div v-if="currency == '*'">active</div>
                    <div v-else class="uppercase flex gap-2 items-center">+ {{ totalAmount }} {{ currency }}</div>
                </div>
            </div>
            <div class="lg:col-span-1 absolute flex justify-end top-10 right-5 lg:relative lg:top-auto lg:right-auto">
                <IconChevronDown :class="{ 'rotate-180': showPanel }" class="transform transition-transform" />
            </div>
        </div>
        <div class="hidden-grid-panel" :class="{ 'is-active': showPanel }" ref="panel">
            <div class="overflow-hidden border-t border-body/15">
                <div class="max-h-[205px] overflow-y-scroll no-scrollbar relative">
                    <CardPayment
                        v-for="(payment, index) in payments"
                        :key="payment.transactionId"
                        :="payment"
                        :accountId="toUser.wallet"
                    />
                </div>

                <div class="flex gap-5 p-5">
                    <div class="flex flex-grow items-center gap-2">
                        <NuxtLink :to="`/link/share/${id}`" class="flex gap-1 items-center"><IconLink />Share</NuxtLink>
                        <NuxtLink :to="`/link/params/${id}`" class="flex gap-1 items-center"
                            ><IconPersons />Personalize</NuxtLink
                        >
                    </div>
                    <div class="flex">
                        <div class="cursor-pointer" @click="handleDelete(id)"><IconTrash /></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { HederaService } from "~/lib/hedera";
import IconTrash from "../Icon/Trash.vue";
import { useAsyncData } from "nuxt/app";

const hederaService = new HederaService();

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    authorId: {
        type: String,
        required: true,
    },
    name: {
        type: [String, null],
        required: false,
    },
    memo: {
        type: [String, null],
        required: false,
    },
    image: {
        type: [String, null],
        required: false,
    },
    amount: {
        type: [String, null],
        required: false,
    },
    currency: {
        type: [String, null],
        required: false,
    },
    maxPayments: {
        type: [Number, null],
        required: false,
    },
    payments: {
        type: Array,
        required: false,
    },
    createdAt: {
        type: String,
        required: true,
    },
    expires: {
        type: String,
        required: false,
    },
    handleDelete: {
        type: Function,
        required: true,
    },
    lastLogin: {
        type: String,
        required: true,
    },
});

const totalAmount = ref(0);
const state = ref("waiting");
const numNewPayments = ref(0); // to do

const getColor = function (maxPayments, numPayments) {
    if (maxPayments != null && numPayments >= maxPayments) {
        return "accent"; //green
    }
    if (numPayments > 0 && maxPayments == null) {
        return "accent"; // green
    }
    if (numPayments > 0) {
        return "primary"; //yellow
    }
    return "body";
};

// map all payment transactionIds
let paymentIds = props.payments.map((payment) => payment.transactionId);

const { data: toUser } = await useAsyncData("toUser", () => $fetch(`/api/users/${props.authorId}`));

totalAmount.value = await hederaService.getTotalTransactionAmount(paymentIds, toUser.value?.wallet);

if (totalAmount.value > 0) {
    state.value = "active";
}

const isExpired = (date) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const dateStr = date.split("T")[0];

    return dateStr < todayStr;
};

if (props.expires) {
    if (isExpired(props.expires)) {
        state.value = "expired";
    }
}

// if (props.payments.length > 0) {
//     numNewPayments.value = props.payments.filter((payment) => payment.createdAt > props.lastLogin).length;
// }

const showPanel = ref(false);

function togglePanel() {
    if (showPanel.value == false) {
        // opening panel
        // numNewPayments.value = 0;
    }
    showPanel.value = !showPanel.value;
}
</script>

<style scoped>
.card-link {
    .card-link__circle {
        position: relative;
        width: 4rem;
        height: 4rem;
        border-radius: 50em;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--color-secondary);
        padding: 0.75rem;

        .card-link__circle__inner {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1rem !important;
        }
    }
}
</style>
