// server/api/links.get.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const { id } = event.context.params ?? {};

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Missing ID" });
    }

    try {
        await prisma.link.delete({
            where: { id },
        });
        return;
    } catch (e) {
        return createError({ statusCode: 400, message: "Link deletion failed" });
    }
});
