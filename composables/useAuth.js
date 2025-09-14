import { ref, computed } from "vue";

const user = ref(null);
const loading = ref(false);
const error = ref(null);

export function useAuth() {
    const isLoggedIn = computed(() => !!user.value);

    const fetchUser = async () => {
        // return;

        loading.value = true;
        error.value = null;

        try {
            const { data } = await useFetch("/api/auth/me", { server: true });
            user.value = data.value?.user || null;
        } catch (err) {
            error.value = err;
            user.value = null;
        } finally {
            loading.value = false;
        }
    };

    const logout = async () => {
        try {
            await $fetch("/api/auth/logout", { method: "POST", credentials: "include" });
            user.value = null;
            // await navigateTo("/");

            // refresh page
            location.reload();
        } catch (err) {
            console.error("Failed to logout:", err);
        }
    };

    return {
        user,
        loading,
        error,
        isLoggedIn,
        fetchUser,
        logout,
    };
}
