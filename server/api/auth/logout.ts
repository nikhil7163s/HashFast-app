// server/api/auth/logout.ts

export default defineEventHandler(async (event) => {
    deleteCookie(event, "auth_token");
    return { message: "Logout successful" };
});
