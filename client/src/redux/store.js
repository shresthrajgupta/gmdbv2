import { configureStore } from "@reduxjs/toolkit";

import { apiSlice } from "./slices/async/apiSlice.js";
import authSliceReducer from "./slices/sync/authSlice.js";


const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authSliceReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true,
});

export default store;