import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { db } from "../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { sanitizeText, sanitizeDescription } from "../../utils/sanitize";
import { validateText, validateFile } from "../../utils/validation";
import Layout from "../../components/Layout";
import { Upload, AlertCircle, CheckCircle, XCircle } from "lucide-react";

const ReportIssue = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showSuccess, showError, showWarning } = useNotification();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Road",
        address: ""
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const categories = ["Road", "Street Light", "Garbage", "Water", "Electricity", "Other"];

    // Validation rules
    const validateField = (name, value) => {
        switch (name) {
            case "title":
                return validateText(value, 10, 100, "Title");
            case "description":
                return validateText(value, 20, 1000, "Description");
            case "address":
                return validateText(value, 10, 200, "Address");
            default:
                return { isValid: true, error: "" };
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validate if touched
        if (touched[name]) {
            const validation = validateField(name, value);
            setErrors({ ...errors, [name]: validation.error });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });

        const validation = validateField(name, value);
        setErrors({ ...errors, [name]: validation.error });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        const validation = validateFile(file);

        if (!validation.isValid) {
            showError(validation.error);
            setErrors({ ...errors, image: validation.error });
            return;
        }

        setErrors({ ...errors, image: "" });
        setImageFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'category') {
                const validation = validateField(key, formData[key]);
                if (!validation.isValid) {
                    newErrors[key] = validation.error;
                }
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched({ title: true, description: true, address: true });
            showError("Please fix the validation errors");
            return;
        }

        if (!imagePreview) {
            showWarning("Consider adding an image to help illustrate the issue");
        }

        setLoading(true);

        try {
            // Sanitize inputs
            const sanitizedData = {
                title: sanitizeText(formData.title),
                description: sanitizeDescription(formData.description),
                category: formData.category,
                address: sanitizeText(formData.address)
            };

            let imageUrl = "";
            if (imagePreview) {
                imageUrl = imagePreview;
            } else {
                // Default placeholder
                imageUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            }

            const issueData = {
                userId: user.uid,
                title: sanitizedData.title,
                description: sanitizedData.description,
                category: sanitizedData.category,
                address: sanitizedData.address,
                imageUrl,
                status: "Pending",
                assignedTo: null,
                createdAt: new Date().toISOString(),
                userEmail: user.email
            };

            await addDoc(collection(db, "issues"), issueData);
            showSuccess("Issue reported successfully!");
            setTimeout(() => navigate("/dashboard"), 1000);
        } catch (err) {
            console.error("Submission error:", err);
            showError("Failed to report issue: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getFieldClasses = (fieldName) => {
        const baseClasses = "mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 sm:text-sm transition-all";

        if (!touched[fieldName]) {
            return `${baseClasses} border-slate-300 focus:ring-blue-500 focus:border-blue-500`;
        }

        if (errors[fieldName]) {
            return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500`;
        }

        return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500`;
    };

    const getCharCount = (text, max) => {
        const count = text ? text.length : 0;
        const color = count > max ? 'text-red-600' : count > max * 0.8 ? 'text-yellow-600' : 'text-slate-500';
        return { count, color };
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Report a New Issue</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700">Issue Title *</label>
                            <span className={`text-xs ${getCharCount(formData.title, 100).color}`}>
                                {getCharCount(formData.title, 100).count}/100
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                name="title"
                                required
                                className={getFieldClasses("title")}
                                value={formData.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Brief description of the issue"
                            />
                            {touched.title && !errors.title && formData.title && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                            )}
                            {touched.title && errors.title && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <XCircle className="h-5 w-5 text-red-500" />
                                </div>
                            )}
                        </div>
                        {errors.title && touched.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                        {!errors.title && (
                            <p className="mt-1 text-xs text-slate-500">10-100 characters</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700">Description *</label>
                            <span className={`text-xs ${getCharCount(formData.description, 1000).color}`}>
                                {getCharCount(formData.description, 1000).count}/1000
                            </span>
                        </div>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            className={getFieldClasses("description")}
                            value={formData.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Provide detailed information about the issue"
                        />
                        {errors.description && touched.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                        {!errors.description && (
                            <p className="mt-1 text-xs text-slate-500">20-1000 characters - Be specific and detailed</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                        <select
                            name="category"
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Address */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700">Address *</label>
                            <span className={`text-xs ${getCharCount(formData.address, 200).color}`}>
                                {getCharCount(formData.address, 200).count}/200
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                name="address"
                                required
                                className={getFieldClasses("address")}
                                value={formData.address}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter the location/address of the issue"
                            />
                            {touched.address && !errors.address && formData.address && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                            )}
                            {touched.address && errors.address && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <XCircle className="h-5 w-5 text-red-500" />
                                </div>
                            )}
                        </div>
                        {errors.address && touched.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                        )}
                        {!errors.address && (
                            <p className="mt-1 text-xs text-slate-500">10-200 characters</p>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Image Upload (Optional)</label>

                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
                            {imagePreview ? (
                                <div className="text-center w-full">
                                    <img src={imagePreview} alt="Preview" className="mx-auto h-48 object-contain mb-4 rounded-md" />
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2">
                                            <span>Upload a file</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                onChange={handleImageChange}
                                                accept="image/*"
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 800KB</p>
                                </div>
                            )}
                        </div>
                        {errors.image && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.image}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                        >
                            {loading ? "Submitting..." : "Submit Report"}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default ReportIssue;
