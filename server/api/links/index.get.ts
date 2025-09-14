// server/api/links.get.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if (!query.authorId || typeof query.authorId !== "string") {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing or invalid 'authorId'",
        });
    }

    const authorId = query.authorId;

    try {
        const links = await prisma.link.findMany({
            where: { authorId },
            orderBy: { createdAt: "desc" },
            include: {
                author: true,
                payments: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        return links;
    } catch (e) {
        console.error(e);
        return createError({ statusCode: 400, message: "Link query failed" });
    }
});
