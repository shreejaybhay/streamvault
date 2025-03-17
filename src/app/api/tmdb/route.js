import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get the URL and search params
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    // Validate path parameter
    if (!path) {
      return NextResponse.json({ 
        error: 'Path parameter is required',
        example: '/api/tmdb?path=trending/all/week&page=1'
      }, { 
        status: 400 
      });
    }

    // Validate API key
    if (!process.env.NEXT_PUBLIC_TMDB_KEY) {
      console.error('TMDB API key is not defined');
      return NextResponse.json({ 
        error: 'API configuration error' 
      }, { 
        status: 500 
      });
    }

    // Build the query parameters
    const queryParams = new URLSearchParams(searchParams);
    queryParams.delete('path');
    
    // Construct the TMDB API URL
    const apiUrl = `https://api.themoviedb.org/3/${path}?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}${
      queryParams.toString() ? `&${queryParams.toString()}` : ''
    }`;

    // Make the request to TMDB
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('TMDB API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl.replace(process.env.NEXT_PUBLIC_TMDB_KEY, 'HIDDEN_KEY'), // Hide API key in logs
        errorData
      });
      throw new Error(`TMDB API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('TMDB API Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch data from TMDB',
      message: error.message
    }, {
      status: 500
    });
  }
}
