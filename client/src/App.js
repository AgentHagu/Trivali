// React and React Router imports
import React, { useEffect, useState } from "react";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";

// Page components
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProjectPage from "./pages/ProjectPage";
import Test from "./pages/Test";

// Other components
import HeaderNavbar from "./components/HeaderNavbar";

// Third-party libraries
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SERVER_URL = process.env.REACT_APP_API_URL;


// Create router configuration
const router = createBrowserRouter([
  // {
  //   path: "/test",
  //   // element: <PrivateRoute element = {<Test />}/>
  //   element: <Test />
  // },
  {
    path: "/",
    element: <Navigate to={"/welcome"} />
  },
  {
    path: "/welcome",
    element: <WelcomePage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  },
  {
    path: "/home",
    element: <PrivateRoute element={<HomePage />} />
  },
  {
    path: "/projects",
    element: <Navigate to={"/home"} />
  },
  {
    path: "/projects/:id",
    element: <PrivateRoute element={<ProjectPage />} />
  },
])

/**
 * Main App component.
 * 
 * @returns {JSX.Element} The rendered component.
 */
function App() {
  return <>
    <ToastContainer />
    <RouterProvider router={router} />
  </>
}

/**
 * PrivateRoute component to protect routes.
 * 
 * @param {Object} props - Component props.
 * @param {JSX.Element} props.element - The element to render if authenticated.
 * @returns {JSX.Element} The rendered component.
 */
function PrivateRoute({ element }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate()

  // Validate user session on component mount
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    async function fetchUser() {
      try {
        const response = await fetch(`${SERVER_URL}`, {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          if (isMounted) setIsAuthenticated(true);
        } else {
          if (isMounted) setIsAuthenticated(false);
        }
      } catch (error) {
        if (isMounted) setIsAuthenticated(false);
      }
    }

    fetchUser();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      toast.error("You haven't logged in! Redirecting to login page...", {
        position: "top-center",
        autoClose: 3000
      })
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated === null) {
    return <>
      <HeaderNavbar />
      <div className="container mt-3 d-flex justify-content-center align-items-center vh-100">
        <div class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </>
  }

  if (isAuthenticated) {
    return element
  }

  return null
}

export default App;