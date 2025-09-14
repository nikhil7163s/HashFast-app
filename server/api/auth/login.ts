// server/api/auth/login.ts
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const JWT_SECRET = process.env.JWT_SECRET as string;
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { email, password } = body;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw createError({ statusCode: 401, message: "Invalid credentials" });
    }

    await prisma.user.update({
        where: { email },
        data: {
            lastLogin: new Date(),
        },
    });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw createError({ statusCode: 401, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: "7d" });

    setCookie(event, "auth_token", token, {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
});
