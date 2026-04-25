import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center p-8 bg-white shadow-xl rounded-xl max-w-lg w-full">
                <h1 className="text-6xl font-extrabold text-red-500 mb-4">403</h1>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                <p className="text-slate-500 mb-8">
                    You do not have the necessary permissions to view this page.
                </p>
                <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;
