import { Navigate, createBrowserRouter } from "react-router-dom";
import Login from "../components/Login/Login";
import AddUser from "../components/AddUser/AddUser";
import Main from "../components/Main/Main";
import React from "react";
import Question from "../components/Game/Question/Question";
import Game from "../components/Game/Game";
const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />,
},
{
    path: "/login",
        element: <Login />,
},
{
    path: "/register",
        element: <AddUser />,
},
    {
        path: "/main",
        element: <Main />,
    },
    {
        path: "/game",
        element: <Game totalQuestions={0} themes={{}} username={""} timeLimit={0}/>,
    }
]);

export default router;
