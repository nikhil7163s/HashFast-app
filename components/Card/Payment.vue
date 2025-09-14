<template>
    <a
        :href="`https://hashscan.io/${hederaService.network}/transaction/${hederaService.parseTransactionId(
            transactionId,
        )}`"
        target="_blank"
        title="Inspect"
        class="grid grid-cols-12 gap-5 items-center bg-background/70 p-5 border-b border-body/15"
    >
        <div class="md:col-span-5 hidden md:block">{{ memo }} <i v-if="!memo" class="opacity-15">No memo</i></div>

        <div class="col-span-4 md:col-span-2 flex flex-start">
            <div
                class="rounded-md px-3 py-1 md:py-2"
                :style="`background-color: hsl(${colorHash(payerAccountId)}, 65%, 92%)`"
            >
                {{ payerAccountId }}
            </div>
        </div>
        <div class="col-span-4 md:col-span-2">
            {{ date.date }} <span class="hidden md:inline">{{ date.time }}</span>
        </div>
        <div class="col-span-4 md:col-span-2 flex justify-end">
            <div class="bg-accent/20 text-accent rounded-sm px-3 py-1 md:py-2 whitespace-nowrap">
                + {{ amount }} {{ currency }}
            </div>
        </div>
    </a>
</template>

<script setup>
import { HederaService } from "~/lib/hedera";

const hederaService = new HederaService();

const props = defineProps({
    transactionId: {
        type: String,
        required: true,
    },
    accountId: {
        // receiver account
        type: String,
        required: true,
    },
});

let payerAccountId = props.transactionId.split("@")[0]; // first part of transactionId

const colorHash = (s) => [...s].reduce((h, c) => h + c.charCodeAt(0), 0) % 360;

let transactionData = await hederaService.getTransactionData(props.transactionId, props.accountId);

let amount = parseFloat(transactionData.amount.toFixed(2));
let currency = transactionData.currency;
let date = formatHederaTimestamp(transactionData.timestamp);
let memo = transactionData.memo;

function formatHederaTimestamp(ts) {
    const [s, ns] = ts.split(".");
    const d = new Date(+s * 1000 + +ns.slice(0, 3));
    const dateString = d.toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    // split between date and time

    const [date, time] = dateString.replace(",", "").split(" ");

    return { date, time };
}
</script>
