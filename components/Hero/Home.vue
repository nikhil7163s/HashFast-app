<template>
    <div class="hero relative pt-20 min-h-dvh hero--center">
        <div class="hero__bg"></div>
        <div class="container z-[2]">
            <div class="grid md:grid-cols-12 gap-y-10 gap-x-5 items-center">
                <div class="md:col-span-4 min-height-[600px]">
                    <div class="bg-[#fff9f4] w-full h-[600px] rounded-4xl text-center animate-slide-up overflow-hidden">
                        <img src="/images/hero-screenshot.png" alt="hero" class="w-full h-full object-contain" />
                    </div>
                </div>
                <div class="md:col-span-5 md:col-start-6 order-first md:order-last">
                    <div class="animate-slide-up flex flex-col flex-start gap-4 text-white">
                        <h1 class="font-semibold text-6xl">Fast payments for everyone</h1>
                        <p class="text-2xl font-regular opacity-75">
                            With HashFast, you can quickly create payment links to request money from others. It
                            supports HBAR and USDC payments on Hedera.
                        </p>
                        <NuxtLink to="/register" class="btn self-start">Get Started</NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup></script>
