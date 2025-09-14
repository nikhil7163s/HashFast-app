// server/api/links/[id].ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const { id } = event.context.params ?? {};

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Missing ID" });
    }

    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    return user;
});
