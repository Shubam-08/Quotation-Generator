"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AdminQuotation {
  _id: string;
  quotationNumber: string;
  userName: string;
  userRole: string;
  createdAt?: string;
}

export default function AdminQuotationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quotations, setQuotations] = useState<AdminQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "admin") {
      router.push("/");
      return;
    }

    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/quotations");
        if (!res.ok) {
          throw new Error("Failed to fetch quotations");
        }
        const data = await res.json();
        setQuotations(data);
      } catch (err: any) {
        console.error("Error loading quotations:", err);
        setError(err.message || "Failed to load quotations");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, [status, session, router]);

  if (status === "loading" || loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-gray-600 text-sm">Loading quotations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quotations</h1>

      {quotations.length === 0 ? (
        <p className="text-sm text-gray-500">No quotations have been generated yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Quotation No</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">User Name</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">User Role</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotations.map((q) => (
                <tr key={q._id}>
                  <td className="px-4 py-2 font-mono text-xs text-blue-700 break-all">
                    {q.quotationNumber}
                  </td>
                  <td className="px-4 py-2 text-gray-900">{q.userName}</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {q.userRole}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-xs">
                    {q.createdAt ? new Date(q.createdAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
