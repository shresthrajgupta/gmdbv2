import { apiSlice } from './apiSlice.js';


export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        signup: builder.mutation({
            query: ({ name, email, password }) => ({
                url: "/api/users/signup",
                method: 'POST',
                body: { name, email, password }
            })
        }),

        verifyOtp: builder.mutation({
            query: ({ otp }) => ({
                url: "/api/users/verifyotp",
                method: 'POST',
                body: { otp }
            })
        }),

        login: builder.mutation({
            query: ({ email, password }) => ({
                url: "/api/users/login",
                method: 'POST',
                body: { email, password }
            })
        }),

        forgotPassword: builder.mutation({
            query: ({ email, password }) => ({
                url: "/api/users/forgotpassword",
                method: 'POST',
                body: { email, password }
            })
        }),

        homepageGames: builder.query({
            query: () => ({
                url: "/api/users/homepagegames",
                method: 'GET'
            }),
            providesTags: ["Game"],
            keepUnusedDataFor: 10
        }),

        addToPlaylist: builder.mutation({
            query: ({ gameId }) => ({
                url: "/api/users/playlist",
                method: 'POST',
                body: { gameId }
            })
        }),

        delFromPlaylist: builder.mutation({
            query: ({ gameId }) => ({
                url: "/api/users/playlist",
                method: 'DELETE',
                body: { gameId }
            })
        }),

        addToCompletedList: builder.mutation({
            query: ({ gameId }) => ({
                url: "/api/users/completedlist",
                method: 'POST',
                body: { gameId }
            })
        }),

        delFromCompletedList: builder.mutation({
            query: ({ gameId }) => ({
                url: "/api/users/completedlist",
                method: 'DELETE',
                body: { gameId }
            })
        }),

        showPlaylist: builder.query({
            query: ({ pageNo }) => ({
                url: `/api/users/playlist?page=${pageNo}`,
                method: 'GET'
            }),
            providesTags: ["Game"],
            keepUnusedDataFor: 10
        }),

        showCompletedList: builder.query({
            query: ({ pageNo }) => ({
                url: `/api/users/completedlist?page=${pageNo}`,
                method: 'GET'
            }),
            providesTags: ["Game"],
            keepUnusedDataFor: 10
        }),

    })
});

export const
    {
        useSignupMutation,
        useVerifyOtpMutation,
        useLoginMutation,
        useForgotPasswordMutation,
        useHomepageGamesQuery,
        useAddToPlaylistMutation,
        useDelFromPlaylistMutation,
        useAddToCompletedListMutation,
        useDelFromCompletedListMutation,
        useLazyShowPlaylistQuery,
        useLazyShowCompletedListQuery
    } = usersApiSlice;