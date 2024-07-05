import { connectDB } from "@/lib/db";
import { User } from "@/models/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
export async function POST(request) {
    await connectDB()
    try {
        const { email, password } = await request.json();

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
            },
            process.env.JWT_KEY,
            { expiresIn: '1d' }
        );

        const response = NextResponse.json({ message: "Login successful", success: true, user });
        response.cookies.set("authToken", token, { httpOnly: true });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "Invalid credentials", success: false }, { status: 401 });
    }
}
