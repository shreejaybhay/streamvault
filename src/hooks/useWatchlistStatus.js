import { useState, useEffect } from 'react';
import axios from 'axios';

export const useWatchlistStatus = (id, type = 'movie') => {
  // Don't set any initial state
  const [state, setState] = useState({
    isInWatchlist: null,
    isLoading: true
  });

  useEffect(() => {
    let mounted = true;
    
    const checkWatchlistStatus = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        if (mounted) {
          setState({ isInWatchlist: false, isLoading: false });
        }
        return;
      }

      try {
        const response = await axios.get('/api/watchlist', {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        if (!mounted) return;

        const isInList = response.data.some(item => {
          if (type === 'movie') return item.movieIds && item.movieIds.includes(id);
          return item.tvShowIds && item.tvShowIds.includes(id);
        });

        setState({ isInWatchlist: isInList, isLoading: false });
      } catch (error) {
        console.error('Error checking watchlist status:', error);
        if (mounted) {
          setState({ isInWatchlist: false, isLoading: false });
        }
      }
    };

    checkWatchlistStatus();

    return () => {
      mounted = false;
    };
  }, [id, type]);

  const setIsInWatchlist = (value) => {
    setState(prev => ({ ...prev, isInWatchlist: value }));
  };

  return {
    isInWatchlist: state.isInWatchlist,
    setIsInWatchlist,
    isLoading: state.isLoading
  };
};
