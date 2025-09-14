<template>
    <canvas ref="canvasRef" />
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
import QRCode from "qrcode";

const props = defineProps({
    value: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(["change"]);

const canvasRef = ref(null);

const generateQRCode = async () => {
    if (canvasRef.value && props.value) {
        try {
            await QRCode.toCanvas(canvasRef.value, props.value, { errorCorrectionLevel: "L", width: 256 });
            const dataUrl = canvasRef.value.toDataURL();
            emit("change", dataUrl);
        } catch (err) {
            console.error("QR code generation failed", err);
        }
    }
};

onMounted(generateQRCode);

watch(() => props.value, generateQRCode);
</script>
