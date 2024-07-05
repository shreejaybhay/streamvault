import { User } from "@/models/users";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(request, { params }) {
    const { userId } = params
    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return NextResponse.json({ message: "User not found", success: false }, { status: 404 })
        }
        return NextResponse.json(user)
    } catch (error) {
        console.log("Error getting user", error);
        return NextResponse.json({ message: " Could not find user", success: false }, { status: 404 })
    }
}

export async function DELETE(request, { params }) {
    const { userId } = params
    try {
        await User.deleteOne({ _id: userId });
        return NextResponse.json({ message: "User deleted", success: true })
    } catch (error) {
        console.log("Error deleting user", error);
        return NextResponse.json({ message: "Could not delete user", success: false }, { status: 404 })
    }
}

export async function PUT(request, { params }) {
    const { userId } = params;
    const { username, password, profileURL } = await request.json();

    try {
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
        }
        if (username) {
            user.username = username;
        }
        if (profileURL) {
            user.profileURL = profileURL;
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        const updatedUser = await user.save();
        return NextResponse.json({ message: "User updated successfully", user: updatedUser, success: true });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ message: "Error updating user", success: false }, { status: 500 });
    }
}
