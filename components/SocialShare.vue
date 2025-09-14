<template>
    <div class="social-share">
        <h3 class="font-semibold text-lg">Share on Social Media:</h3>

        <div class="social-share__links flex gap-4">
            <a
                class="social-share__link"
                target="_blank"
                title="Facebook"
                :href="`https://www.facebook.com/sharer/sharer.php?u=${permalink}`"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                    <path
                        d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z"
                    />
                </svg>
            </a>
            <a
                class="social-share__link"
                target="_blank"
                title="Twitter"
                :href="`https://twitter.com/intent/tweet?url=${permalink}&text=${title}`"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                        d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z"
                    />
                </svg>
            </a>
            <a
                class="social-share__link"
                target="_blank"
                title="LinkedIn"
                :href="`https://www.linkedin.com/shareArticle?url=${permalink}&title=${title}`"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path
                        d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z"
                    />
                </svg>
            </a>
            <a
                class="social-share__link"
                target="_blank"
                title="Mail"
                :href="`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
                    'Pay now: ',
                )}${permalink} `"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path
                        d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"
                    />
                </svg>
            </a>
        </div>
    </div>
</template>

<script setup>
// get props
const props = defineProps({
    permalink: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
});
</script>

<style scoped>
.social-share {
    display: flex;
    flex-direction: column;
    position: sticky;
    top: calc(var(--header-height) + 2rem);
    gap: 0.75rem;

    .social-share__links {
        display: flex;
        gap: 0.75rem;
    }

    .social-share__link {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 1px solid var(--color-primary) !important;
        width: 2rem;
        height: 2rem;

        svg {
            width: auto;
            height: 1rem;
        }
    }
}
</style>
