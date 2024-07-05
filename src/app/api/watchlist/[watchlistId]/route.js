import { Watchlist } from "@/models/watchlist"
import { NextResponse } from "next/server"

export async function DELETE(request, { params }) {
    try {
        const { watchlistId } = params
        const watchlist = await Watchlist.findByIdAndDelete(watchlistId)
        if (!watchlist) {
            return NextResponse.json({ status: 404, message: 'watchlist not found' })
        }
        return NextResponse.json({ status: 200, message: 'watchlist deleted' })
    } catch (error) {
        return NextResponse.json({ status: 500, message: error.message })
        console.log(error);
    }
}