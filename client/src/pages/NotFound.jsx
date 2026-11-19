import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold text-red-500">404</h1>
            <p className="text-xl mt-3">Page Not Found</p>
            <Link to="/" className="text-blue-600 mt-5 hover:underline">
                Go Home
            </Link>
        </div>
    );
}

export default NotFound;