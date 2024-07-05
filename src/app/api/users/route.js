import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/users";
import { NextResponse } from "next/server";

connectDB();

export async function GET(request) {
    try {
        const users = await User.find().select("-password");
        return NextResponse.json({ users, success: true }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Couldn't find users", success: false }, { status: 500 });
    }
}

export async function POST(request) {
    const { username, email, password, profileURL } = await request.json();

    if (password.length < 8) {
        return NextResponse.json({ message: "Password must be at least 8 characters long", success: false }, { status: 400 });
    }

    const user = new User({ username, email, password, profileURL });

    try {
        user.password = bcrypt.hashSync(user.password, parseInt(process.env.BCRYPT_SALT));
        const createdUser = await user.save();
        return NextResponse.json({ message: "Registration successful", user: createdUser, success: true }, { status: 201 });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern.email) {
            return NextResponse.json({ message: "This email is already registered", success: false }, { status: 400 });
        }
        console.log(error);
        return NextResponse.json({ message: "Couldn't create user", success: false }, { status: 500 });
    }
}
