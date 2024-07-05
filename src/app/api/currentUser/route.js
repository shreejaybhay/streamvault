import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { User } from "@/models/users";
import { NextResponse } from "next/server";

export async function GET(request) {
    await connectDB()
    const authToken = request.cookies.get("authToken")?.value
    const data = jwt.verify(authToken, process.env.JWT_KEY)
    const user = await User.findById(data._id).select("-password")
    return NextResponse.json(user)
}