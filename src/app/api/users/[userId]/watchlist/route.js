import { Watchlist } from "@/models/watchlist";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { userId } = params;
        const watchlists = await Watchlist.find({ userId: userId });
        return NextResponse.json(watchlists);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 500, message: "Failed to get watchlist" });
    }
}
