import { Navigate, createBrowserRouter } from "react-router-dom";
import Login from "../components/Login/Login";
import AddUser from "../components/AddUser/AddUser";
import Main from "../components/Main/Main";
import Game from "../components/Game/Game";
import EndGame from "../components/Game/EndGame";
import Ranking from "../components/Ranking/Ranking";
import Historic from "../components/Historic/Historic";
import Api from "../components/Api/Api";
import MainQuestionGame from "../components/Main/MainQuestionGame";
import CardGame from "../components/Game/extras/CardGame";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/login" replace /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <AddUser /> },
    { path: "/main", element: <ProtectedRoute><Main /></ProtectedRoute> },
    { path: "/main/question", element: <ProtectedRoute><MainQuestionGame /></ProtectedRoute> },
    { path: "/game", element: <ProtectedRoute><Game /></ProtectedRoute> },
    { path: "/endGame", element: <ProtectedRoute><EndGame /></ProtectedRoute> },
    { path: "/logout", element: <Login /> },
    { path: "/historic", element: <ProtectedRoute><Historic /></ProtectedRoute> },
    { path: "/ranking", element: <ProtectedRoute><Ranking /></ProtectedRoute> },
    { path: "/api", element: <ProtectedRoute><Api /></ProtectedRoute> },
    { path: "/cards", element: <ProtectedRoute><CardGame /></ProtectedRoute> },
]);

export default router;