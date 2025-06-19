import { apiSlice } from './apiSlice.js';


export const ratingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getRating: builder.query({
            query: ({ guid, gameId }) => ({
                url: `/api/ratings/${guid}?gameId=${gameId}`,
                method: 'GET'
            }),
            providesTags: ['Rating']
        }),

        changeRating: builder.mutation({
            query: ({ gameId, score }) => {
                return {
                    url: "/api/ratings",
                    method: 'POST',
                    body: { gameId, score }
                }
            },
            invalidatesTags: ['Rating']
        }),

    })
});

export const { useGetRatingQuery, useChangeRatingMutation } = ratingsApiSlice;