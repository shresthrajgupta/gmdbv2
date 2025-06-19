import { apiSlice } from './apiSlice.js';


export const gamesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        gameSearch: builder.query({
            query: ({ game }) => ({
                url: `/api/games/search/${game}`,
                method: 'GET'
            })
        }),

        gameDetails: builder.query({
            query: ({ guid }) => ({
                url: `/api/games/${guid}`,
                method: 'GET'
            }),
            providesTags: ['Game'],
            keepUnusedDataFor: 10
        })

    })
});

export const { useGameSearchQuery, useLazyGameSearchQuery, useGameDetailsQuery } = gamesApiSlice;