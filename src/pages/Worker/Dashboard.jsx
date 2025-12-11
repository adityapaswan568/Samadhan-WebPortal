import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db, storage } from "../../firebase/config";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Layout from "../../components/Layout";
import { CheckCircle, Clock, Upload, AlertCircle } from "lucide-react";

const WorkerDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null); // issueId being uploaded

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, "issues"),
                    where("assignedTo", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                const tasksList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTasks(tasksList);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [user]);

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            const issueRef = doc(db, "issues", issueId);
            await updateDoc(issueRef, { status: newStatus });
            setTasks(tasks.map(t => t.id === issueId ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const handleProofUpload = async (issueId, file) => {
        if (!file) return;
        setUploading(issueId);
        try {
            const storageRef = ref(storage, `uploads/completed/${issueId}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const issueRef = doc(db, "issues", issueId);
            await updateDoc(issueRef, {
                status: "Completed",
                completedImageUrl: downloadURL,
                completedAt: new Date().toISOString()
            });

            setTasks(tasks.map(t => t.id === issueId ? {
                ...t,
                status: "Completed",
                completedImageUrl: downloadURL
            } : t));
        } catch (error) {
            console.error("Error uploading proof:", error);
            alert("Failed to upload proof");
        } finally {
            setUploading(null);
        }
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Assigned Tasks</h1>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No tasks assigned to you yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {tasks.map((task) => (
                        <div key={task.id} className="bg-white shadow rounded-lg border border-slate-200 p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/3 h-48 bg-slate-100 rounded-lg overflow-hidden">
                                    <img
                                        src={task.imageUrl || "https://via.placeholder.com/300"}
                                        alt={task.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{task.title}</h3>
                                            <p className="text-sm text-slate-500 mt-1">Category: {task.category}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                task.status === 'In-Progress' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>

                                    <p className="text-slate-700">{task.description}</p>

                                    <div className="border-t border-slate-100 pt-4 mt-4">
                                        <h4 className="text-sm font-medium text-slate-900 mb-3">Update Status</h4>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => handleStatusChange(task.id, "Pending")}
                                                disabled={task.status === "Pending"}
                                                className={`px-3 py-1.5 rounded text-sm font-medium border ${task.status === "Pending"
                                                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                                    }`}
                                            >
                                                Pending
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(task.id, "In-Progress")}
                                                disabled={task.status === "In-Progress"}
                                                className={`px-3 py-1.5 rounded text-sm font-medium border ${task.status === "In-Progress"
                                                        ? "bg-yellow-50 text-yellow-600 border-yellow-200 cursor-not-allowed"
                                                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                                    }`}
                                            >
                                                In-Progress
                                            </button>

                                            {task.status !== "Completed" && (
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id={`upload-${task.id}`}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleProofUpload(task.id, e.target.files[0])}
                                                        disabled={uploading === task.id}
                                                    />
                                                    <label
                                                        htmlFor={`upload-${task.id}`}
                                                        className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-medium border border-transparent text-white bg-green-600 hover:bg-green-700 cursor-pointer ${uploading === task.id ? "opacity-75 cursor-wait" : ""
                                                            }`}
                                                    >
                                                        {uploading === task.id ? "Uploading..." : "Complete & Upload Proof"}
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {task.completedImageUrl && (
                                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                                            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Work Completed
                                            </h4>
                                            <img
                                                src={task.completedImageUrl}
                                                alt="Proof of work"
                                                className="h-32 rounded-md object-cover border border-green-200"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default WorkerDashboard;
