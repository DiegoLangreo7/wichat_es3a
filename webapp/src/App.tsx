import router from '../src/router/AppRouter';
import { RouterProvider } from 'react-router';
import React from "react";

const App: React.FC = () => {
    return (
        <RouterProvider router={router} />
    );
};

export default App;
