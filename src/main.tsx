import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles.css'

const queryClient = new QueryClient()
const router = getRouter()

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
