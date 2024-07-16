import { User } from "@/models/users";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(request, { params }) {
  const { userId } = params;
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Error fetching user", success: false }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { userId } = params;
  const { password } = await request.json();

  try {
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Password is incorrect", success: false }, { status: 400 });
    }

    await User.deleteOne({ _id: userId });
    return NextResponse.json({ message: "User deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Error deleting user", success: false }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { userId } = params;
  const { username, oldPassword, newPassword, profileURL } = await request.json();

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
    if (newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ message: "Old password is incorrect", success: false }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();
    return NextResponse.json({ message: "User updated successfully", user: updatedUser, success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Error updating user", success: false }, { status: 500 });
  }
}