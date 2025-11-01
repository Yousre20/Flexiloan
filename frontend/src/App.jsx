import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- Language Configuration ---
const translations = {
    en: {
        title: "🏦 Smart Bank Dashboard",
        addClient: "Add New Client",
        clientName: "Client Name",
        age: "Age",
        annualIncome: "Annual Income (in thousands)",
        existingLoans: "Number of Existing Loans",
        submit: "Add Client & Analyze",
        loading: "Loading Clients...",
        error: "Failed to load client data. Please ensure the backend is running.",
        repaymentScore: "Repayment Score",
        generatedOffer: "Generated Offer",
        marketingMessage: "Personalized Message",
        noClients: "No clients found. Add one using the form above!",
        clientAdded: "Client added successfully!",
        clientAddError: "Error adding client. Please check the console."
    },
    ar: {
        title: "🏦 لوحة البنك الذكية",
        addClient: "إضافة عميل جديد",
        clientName: "اسم العميل",
        age: "العمر",
        annualIncome: "الدخل السنوي (بالآلاف)",
        existingLoans: "عدد القروض الحالية",
        submit: "إضافة عميل وتحليل",
        loading: "جاري تحميل العملاء...",
        error: "فشل تحميل بيانات العملاء. يرجى التأكد من أن الخادم يعمل.",
        repaymentScore: "درجة سداد القرض",
        generatedOffer: "العرض المقترح",
        marketingMessage: "رسالة تسويقية مخصصة",
        noClients: "لا يوجد عملاء. أضف عميلاً جديداً باستخدام النموذج أعلاه!",
        clientAdded: "تمت إضافة العميل بنجاح!",
        clientAddError: "خطأ في إضافة العميل. يرجى مراجعة الكونسول."
    }
};

// --- API Configuration ---
const API_URL = 'http://localhost:5000/api/clients';

// --- Helper Components ---
const StatCard = ({ label, value, colorClass = 'text-gray-900', isPercentage = false }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${colorClass}`}>
            {isPercentage ? `${(value * 100).toFixed(0)}%` : value}
        </dd>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-semibold">{message}</p>
    </div>
);


// --- Main App Component ---
export default function App() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lang, setLang] = useState('ar'); // Default language is Arabic
    const [formState, setFormState] = useState({ name: '', age: '', income: '', loans: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const t = useMemo(() => translations[lang], [lang]);
    const isRtl = lang === 'ar';

    // --- Data Fetching Effect ---
    useEffect(() => {
        const fetchClients = async () => {
            try {
                setLoading(true);
                const response = await axios.get(API_URL);
                setClients(response.data);
                setError(null);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(t.error);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, [t.error]);

    // --- Form Handling ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formState.name || !formState.age || !formState.income || !formState.loans) {
            alert("Please fill all fields.");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await axios.post(API_URL, {
                name: formState.name,
                age: parseInt(formState.age),
                income: parseInt(formState.income),
                loans: parseInt(formState.loans),
            });
            setClients([response.data, ...clients]); // Add new client to the top of the list
            setFormState({ name: '', age: '', income: '', loans: '' }); // Reset form
            // You could add a success toast notification here
        } catch (err) {
            console.error("Submit error:", err);
            // You could add an error toast notification here
            alert(t.clientAddError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getScoreColor = (score) => {
        if (score > 0.8) return 'text-green-600';
        if (score > 0.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-gray-100 min-h-screen font-sans">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">

                {/* --- Header --- */}
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
                    <button
                        onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {lang === 'en' ? 'العربية' : 'English'}
                    </button>
                </header>

                {/* --- Add Client Form --- */}
                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">{t.addClient}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        <input type="text" name="name" placeholder={t.clientName} value={formState.name} onChange={handleInputChange} className="md:col-span-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        <input type="number" name="age" placeholder={t.age} value={formState.age} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        <input type="number" name="income" placeholder={t.annualIncome} value={formState.income} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        <input type="number" name="loans" placeholder={t.existingLoans} value={formState.loans} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        <button type="submit" disabled={isSubmitting} className="sm:col-span-2 md:col-span-5 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed">
                            {isSubmitting ? `${t.loading}...` : t.submit}
                        </button>
                    </form>
                </div>

                {/* --- Client List --- */}
                <main>
                    {loading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <ErrorMessage message={error} />
                    ) : clients.length === 0 ? (
                        <p className="text-center text-gray-500 mt-12">{t.noClients}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {clients.map((client) => (
                                <div key={client._id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">{client.name}</h3>
                                        <dl className="grid grid-cols-1 gap-y-4">
                                            <StatCard
                                                label={t.repaymentScore}
                                                value={client.score}
                                                colorClass={getScoreColor(client.score)}
                                                isPercentage
                                            />
                                            <StatCard
                                                label={t.generatedOffer}
                                                value={client.offer}
                                            />
                                        </dl>
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <p className="text-sm font-medium text-gray-500">{t.marketingMessage}</p>
                                            <p className="text-gray-700 mt-1">{client.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}

