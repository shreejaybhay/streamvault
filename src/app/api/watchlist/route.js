import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Watchlist } from "@/models/watchlist";
import { connectDB } from "@/lib/db";

export async function GET(request) {
    try {
        await connectDB()
        const watchlists = await Watchlist.find();
        return NextResponse.json(watchlists);
    } catch (error) {
        console.log(error);
        return NextResponse.status(500).json({ message: 'Error fetching watchlists' });
    }
}

export async function POST(request) {
    try {
        await connectDB()
        const { movieIds, tvShowIds, animeIds } = await request.json();
        const authToken = request.cookies.get("authToken")?.value;
        const data = jwt.verify(authToken, process.env.JWT_KEY);
        const userId = data._id;

        const newWatchlist = new Watchlist({
            movieIds,
            tvShowIds,
            animeIds,
            userId
        });

        const createdWatchlist = await newWatchlist.save();
        return NextResponse.json(createdWatchlist, { status: 201 });
    } catch (error) {
        console.error("Error creating watchlist:", error);
        return NextResponse.json({ message: "Error creating watchlist. Please try again later." });
    }
}
