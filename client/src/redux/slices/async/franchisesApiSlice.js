import { apiSlice } from './apiSlice.js';


export const franchisesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        franchiseDetails: builder.query({
            query: ({ guid }) => ({
                url: `/api/franchises/${guid}`,
                method: 'GET'
            }),
            providesTags: ['Franchise'],
            keepUnusedDataFor: 10
        })

    })
});

export const { useFranchiseDetailsQuery } = franchisesApiSlice;