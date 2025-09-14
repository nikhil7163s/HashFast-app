import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export default defineEventHandler(async (event) => {
    const url = getRequestURL(event).pathname;
    const method = event.method;

    const publicRoutes = [
        { path: "/", method: "ANY" },
        { path: "/login", method: "ANY" },
        { path: "/register", method: "ANY" },
        { pathPrefix: "/link/view/", method: "ANY" },
        { pathPrefix: "/api/auth", method: "ANY" },
        { pathPrefix: "/api/users", method: "ANY" },
        { pathPrefix: "/api/payments", method: "POST" },
        { regex: /^\/api\/links\/[^/]+$/, method: "GET" }, // Allow GET /api/links/:id
    ];

    const isPublic = publicRoutes.some(({ path, pathPrefix, regex, method: allowedMethod }) => {
        const matchPath =
            (path && url === path) || (pathPrefix && url.startsWith(pathPrefix)) || (regex && regex.test(url));
        const matchMethod = allowedMethod === "ANY" || allowedMethod === method;
        return matchPath && matchMethod;
    });
    if (isPublic) return;

    const token = getCookie(event, "auth_token");
    if (!token) {
        return sendRedirect(event, "/login", 302);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        event.context.user = decoded;
    } catch (err) {
        throw createError({ statusCode: 401, message: "Invalid or expired token" });
    }
});
