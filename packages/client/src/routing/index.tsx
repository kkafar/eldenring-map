import App from '../components/App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from '../routes/ErrorPage';

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
  }
]);

export default appRouter;

