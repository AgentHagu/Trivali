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
import Test from "./components/Test"
import HomePage from "./pages/HomePage"
import { useEffect, useState } from "react"

const router = createBrowserRouter([
  {
    path: "/test",
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
    element: <HomePage />
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

function App() {
  return <RouterProvider router={router} />
}

function PrivateRoute({ element }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/', {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      console.log("authenticating...")
      if (response.status === 401) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    })
    .catch(() => {
      setIsAuthenticated(false);
    });
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/welcome" />;
}

export default App;