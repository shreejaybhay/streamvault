export default function Loading() {
    return (
        <section className="flex items-center justify-center min-h-screen bg-base-300">
            <div className="flex flex-col items-center justify-center w-full max-w-md p-8 rounded-lg shadow-lg bg-base-200">
                <div className="mb-4">
                    <div className="flex flex-col items-center justify-center animate-pulse">
                        <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-base-100"></div>
                        <div className="w-40 h-8 mb-2 rounded bg-base-100"></div>
                        <div className="w-24 h-4 mb-2 rounded bg-base-100"></div>
                        <div className="w-48 h-4 rounded bg-base-100"></div>
                    </div>
                </div>
                <button className="w-full px-4 py-2 mt-4 text-gray-200 transition duration-300 rounded bg-base-100 " disabled>
                </button>
                <button className="w-full px-4 py-2 mt-4 text-gray-200 transition duration-300 rounded bg-base-100 " disabled>

                </button>
            </div>
        </section>
    );
}
