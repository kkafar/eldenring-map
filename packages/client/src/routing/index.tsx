import App from '../App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from '../routes/ErrorPage';
import LoginPage from '../routes/LoginPage';
import HomePage from '../routes/HomePage';

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  }
]);

export default appRouter;

