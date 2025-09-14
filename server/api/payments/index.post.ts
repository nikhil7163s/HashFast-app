import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { H3Event, sendError, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const link = await prisma.payment.create({ data: body });
        return link;
    } catch (e) {
        console.error(e);
        return createError({ statusCode: 400, message: "Payment creation failed" });
    }
});
