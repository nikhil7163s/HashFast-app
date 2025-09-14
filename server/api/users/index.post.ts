// server/api/index.post.ts
import { z } from "zod";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { H3Event, sendError, createError } from "h3";

const prisma = new PrismaClient();

const UserInput = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be 8+ chars"),
});

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { email, password } = UserInput.parse(body);

        const hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email: email, password: hash },
        });

        const { password: _omit, ...safeUser } = user;

        return safeUser;
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            // Validation error
            throw createError({ statusCode: 400, statusMessage: err.issues[0].message });
        }
        if (err.code === "P2002") {
            // Prisma unique‑constraint error
            throw createError({ statusCode: 409, statusMessage: "Email already in use" });
        }
        sendError(event, err);
    }
});
