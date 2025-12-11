import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { db } from "../../firebase/config";
import { collection, query, getDocs, updateDoc, deleteDoc, doc, orderBy } from "firebase/firestore";
import Layout from "../../components/Layout";
import {
    AlertCircle, CheckCircle, Clock, Trash2, Search, Filter,
    MapPin, Calendar, User, Tag, FileText, AlertTriangle
} from "lucide-react";

const AdminDashboard = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
    });

    useEffect(() => {
        fetchAllIssues();
    }, []);

    useEffect(() => {
        // Filter issues based on search and status
        let filtered = issues;

        if (searchTerm) {
            filtered = filtered.filter(issue =>
                issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                issue.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                issue.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "All") {
            filtered = filtered.filter(issue => issue.status === statusFilter);
        }

        setFilteredIssues(filtered);
    }, [searchTerm, statusFilter, issues]);

    const fetchAllIssues = async () => {
        try {
            const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const issuesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setIssues(issuesList);
            setFilteredIssues(issuesList);

            // Calculate statistics
            const statsData = {
                total: issuesList.length,
                pending: issuesList.filter(i => i.status === "Pending").length,
                inProgress: issuesList.filter(i => i.status === "In-Progress").length,
                completed: issuesList.filter(i => i.status === "Completed").length
            };
            setStats(statsData);
        } catch (error) {
            console.error("Error fetching issues:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            await updateDoc(doc(db, "issues", issueId), {
                status: newStatus,
                updatedAt: new Date().toISOString(),
                updatedBy: user.uid
            });

            // Refresh issues
            fetchAllIssues();
            showSuccess(`Status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating status:", error);
            showError("Failed to update status: " + error.message);
        }
    };

    const handleDelete = async (issueId) => {
        // Use window.confirm for better compatibility
        const confirmed = window.confirm(
            "⚠️ Delete Issue\n\nAre you sure you want to delete this issue?\n\nThis action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            console.log("Attempting to delete issue:", issueId);

            // Delete from Firestore
            await deleteDoc(doc(db, "issues", issueId));

            console.log("Issue deleted successfully");

            // Close modal if open
            setShowModal(false);
            setSelectedIssue(null);

            // Refresh the issues list
            await fetchAllIssues();

            // Show success notification
            showSuccess("Issue deleted successfully!");

        } catch (error) {
            console.error("Error deleting issue:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);

            // Show error notification
            showError(`Failed to delete issue: ${error.message}`);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed": return "bg-green-100 text-green-800 border-green-200";
            case "In-Progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default: return "bg-red-100 text-red-800 border-red-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Completed": return <CheckCircle className="h-4 w-4" />;
            case "In-Progress": return <Clock className="h-4 w-4" />;
            default: return <AlertCircle className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Loading admin dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-600 mt-1">Manage all citizen complaints and issues</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Issues</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Pending</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">{stats.pending}</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-full">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">In Progress</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.inProgress}</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Completed</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title, category, or email..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <select
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="In-Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Issues Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Issue</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Citizen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredIssues.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <AlertTriangle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                            <p>No issues found matching your criteria</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredIssues.map((issue) => (
                                        <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-slate-900">{issue.title}</div>
                                                    <div className="text-sm text-slate-500 line-clamp-1">{issue.description}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{issue.userEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                    <Tag className="h-3 w-3" />
                                                    {issue.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(issue.status)} cursor-pointer`}
                                                    value={issue.status}
                                                    onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In-Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedIssue(issue);
                                                            setShowModal(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(issue.id)}
                                                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                        title="Delete Issue"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Issue Details Modal */}
                {showModal && selectedIssue && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-200">
                                <h3 className="text-2xl font-bold text-slate-900">{selectedIssue.title}</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <p className="mt-1 text-slate-600">{selectedIssue.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Category</label>
                                        <p className="mt-1 text-slate-600">{selectedIssue.category}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Status</label>
                                        <p className="mt-1">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedIssue.status)}`}>
                                                {getStatusIcon(selectedIssue.status)}
                                                {selectedIssue.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Address</label>
                                    <p className="mt-1 text-slate-600 flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {selectedIssue.address}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Reported By</label>
                                    <p className="mt-1 text-slate-600">{selectedIssue.userEmail}</p>
                                </div>
                                {selectedIssue.imageUrl && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-2">Image</label>
                                        <img
                                            src={selectedIssue.imageUrl}
                                            alt={selectedIssue.title}
                                            className="w-full rounded-lg border border-slate-200"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-slate-200 flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedIssue.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete Issue
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminDashboard;
