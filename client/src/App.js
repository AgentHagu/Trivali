import TextEditor from "./components/TextEditor"
import WelcomePage from "./pages/WelcomePage"
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"
import { v4 as uuidV4 } from "uuid"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import Test from "./pages/Test"
import HomePage from "./pages/HomePage"
import { useEffect, useState } from "react"

const SERVER_URL = process.env.REACT_APP_API_URL;

// Create router configuration
const router = createBrowserRouter([
  {
    path: "/test",
    // element: <PrivateRoute element = {<Test />}/>
    element: <Test />
  },
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
    path: "/documents",
    element: <Navigate to={`/documents/${uuidV4()}`} />
  },
  {
    path: "/documents/:id",
    element: <Navigate to={`./details`} />
  },
  {
    path: "/documents/:id/:page",
    element: <TextEditor />
  }
])

/**
 * Main App component.
 * 
 * @returns {JSX.Element} The rendered component.
 */
function App() {
  return <RouterProvider router={router} />
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

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/welcome" />;
}

export default App;