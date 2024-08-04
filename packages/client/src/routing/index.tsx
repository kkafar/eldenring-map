import { createBrowserRouter } from 'react-router-dom';
import ErrorPage from '../routes/ErrorPage';
import LoginPage from '../routes/LoginPage';
import HomePage from '../routes/HomePage';
import AdminPanelPage from '../routes/AdminPanelPage';
import UserProfilePage, { loadDataUserProfilePage } from '../routes/UserProfilePage';

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
  },
  {
    path: '/admin',
    element: <AdminPanelPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/user/:userName',
    element: <UserProfilePage />,
    errorElement: <ErrorPage />,
    loader: loadDataUserProfilePage,
  }
]);

export default appRouter;

