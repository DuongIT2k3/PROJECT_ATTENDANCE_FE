import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { Provider } from "react-redux"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import store from "./common/store/store.ts"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
         <App />
         <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
)