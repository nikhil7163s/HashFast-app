// server/api/links/[id].ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const { id } = event.context.params ?? {};

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Missing ID" });
    }

    const link = await prisma.link.findUnique({
        where: { id },
        include: { payments: true },
    });

    if (!link) {
        throw createError({ statusCode: 404, statusMessage: "Link not found" });
    }

    return link;
});
