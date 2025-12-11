import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { db } from "../../firebase/config";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import Layout from "../../components/Layout";
import { Plus, Clock, CheckCircle, AlertTriangle, Calendar, Trash2 } from "lucide-react";

const CitizenDashboard = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssues = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, "issues"),
                    where("userId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                const issuesList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                issuesList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setIssues(issuesList);
            } catch (error) {
                console.error("Error fetching issues:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, [user]);

    const handleDelete = async (issueId) => {
        // Modern confirmation
        const confirmed = window.confirm(
            "Are you sure you want to delete this complaint?\n\nThis action cannot be undone."
        );

        if (!confirmed) return;

        console.log("Attempting to delete issue:", issueId);

        // Optimistic UI update - remove from list immediately
        const originalIssues = [...issues];
        setIssues(issues.filter(issue => issue.id !== issueId));

        try {
            await deleteDoc(doc(db, "issues", issueId));
            console.log("Successfully deleted issue:", issueId);
            showSuccess("Complaint deleted successfully!");
        } catch (error) {
            console.error("Error deleting issue:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);

            // Restore the original list on error
            setIssues(originalIssues);

            if (error.code === 'permission-denied') {
                showError("Permission denied. You may not have permission to delete this complaint.");
            } else {
                showError("Failed to delete complaint: " + error.message);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed": return "bg-green-100 text-green-800";
            case "In-Progress": return "bg-yellow-100 text-yellow-800";
            default: return "bg-red-100 text-red-800";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Completed": return <CheckCircle className="h-4 w-4 mr-1" />;
            case "In-Progress": return <Clock className="h-4 w-4 mr-1" />;
            default: return <AlertTriangle className="h-4 w-4 mr-1" />;
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
                <Link
                    to="/report-issue"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Report New Issue
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : issues.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No complaints found</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by reporting a new issue.</p>
                    <div className="mt-6">
                        <Link
                            to="/report-issue"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Report Issue
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {issues.map((issue) => (
                        <div key={issue.id} className="bg-white overflow-hidden shadow rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="relative h-48 w-full">
                                <img
                                    src={issue.imageUrl || "https://via.placeholder.com/300"}
                                    alt={issue.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                        {getStatusIcon(issue.status)}
                                        {issue.status}
                                    </span>
                                </div>
                            </div>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium text-slate-900 truncate">{issue.title}</h3>
                                    <span className="text-xs text-slate-500 flex items-center mt-1">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(issue.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{issue.description}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                        {issue.category}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        {issue.assignedTo && (
                                            <span className="text-xs text-slate-500">
                                                Assigned
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleDelete(issue.id)}
                                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                                            title="Delete Complaint"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default CitizenDashboard;
