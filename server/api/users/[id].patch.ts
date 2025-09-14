import { z } from "zod";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { H3Event, sendError, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const { id } = event.context.params ?? {};
    const body = await readBody(event);

    try {
        const user = await prisma.user.update({
            where: { id },
            data: body,
        });
        return user;
    } catch (e) {
        return createError({ statusCode: 400, message: "User update failed" });
    }
});
