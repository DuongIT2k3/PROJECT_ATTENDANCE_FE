import { RouteObject } from "react-router-dom";
import CommonLayout from "../../components/layouts/CommonLayout";
import HomePage from "../pages/common/HomePage";
import PrivacyPage from "../pages/common/PrivacyPage";
import TermsPage from "../pages/common/TermsPage";


export const commonRoutes: RouteObject[] = [
    {
        element: <CommonLayout />,
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/privacy", element: <PrivacyPage /> },
            { path: "/terms", element: <TermsPage /> },
        ]
    }
]