import { createBrowserRouter } from 'react-router-dom';
import ErrorPage from '../routes/legacy/ErrorPage';
import LoginPage from '../routes/legacy/LoginPage';
import HomePage from '../routes/legacy/HomePage';
import AdminPanelPage from '../routes/legacy/AdminPanelPage';
import UserProfilePage, { loadDataUserProfilePage } from '../routes/UserProfilePage';
import MapDevPage from '../routes/legacy/MapDevPage';

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
  },
  {
    path: '/dev-map',
    element: <MapDevPage />,
    errorElement: <ErrorPage />
  }
]);

export default appRouter;

