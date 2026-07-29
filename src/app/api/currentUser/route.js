import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { User } from "@/models/users";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectDB();
        const authToken = request.cookies.get("authToken")?.value;
        if (!authToken) {
            return NextResponse.json(
                { message: "Authentication token missing" },
                { status: 401 }
            );
        }

        const data = jwt.verify(authToken, process.env.JWT_KEY);
        const user = await User.findById(data._id).select("-password");
        
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json(
            { message: "Invalid token or error fetching user", error: error.message },
            { status: 401 }
        );
    }
}