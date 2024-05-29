import TextEditor from "./components/TextEditor"
import HomePage from "./components/HomePage"
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"
import { v4 as uuidV4 } from "uuid";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={"/home"} />
  },
  {
    path: "/home",
    element: <HomePage />
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

export default App;