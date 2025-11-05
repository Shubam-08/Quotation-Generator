"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X, Zap, Search, Upload, Download } from "lucide-react";
import * as XLSX from 'xlsx';

interface Driver {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  series?: string;
  wattageRange: {
    min: number;
    max: number;
  };
  outputVoltage?: string;
  outputCurrent?: string;
  inputVoltage?: string;
  ipRating?: string;
  type?: string;
  price: number;
  category?: string;
  images?: string[];
  productImages?: string[];
  inStock: boolean;
}

export default function DriversManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const [formData, setFormData] = useState({
    modelNumber: "",
    series: "",
    powerWattage: "",
    outputVoltage: "",
    outputCurrent: "",
    inputVoltageRange: "",
    ipRating: "",
    type: "",
    price: "",
    inStock: true,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (session?.user?.role !== "admin") {
      router.push("/");
      return;
    }
    fetchDrivers();
  }, [status, session, router]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/drivers?all=true");
      if (!res.ok) throw new Error("Failed to fetch drivers");
      const data = await res.json();
      setDrivers(data);
    } catch (err) {
      setError("Failed to load drivers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Parse wattage range from "10-50W" format
      const powerStr = formData.powerWattage;
      const wattageMatch = powerStr.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
      const minWattage = wattageMatch ? parseFloat(wattageMatch[1]) : 0;
      const maxWattage = wattageMatch ? parseFloat(wattageMatch[2]) : 0;

      const driverData = {
        sku: formData.modelNumber,
        name: formData.modelNumber,
        series: formData.series,
        description: formData.type,
        wattageRange: {
          min: minWattage,
          max: maxWattage,
        },
        outputVoltage: formData.outputVoltage,
        outputCurrent: formData.outputCurrent,
        inputVoltage: formData.inputVoltageRange,
        ipRating: formData.ipRating,
        type: formData.type,
        price: parseFloat(formData.price),
        category: "Driver",
        inStock: formData.inStock,
      };

      const url = editingDriver
        ? `/api/drivers/${editingDriver._id}`
        : "/api/drivers";
      const method = editingDriver ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driverData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save driver");
      }

      await fetchDrivers();
      closeModal();
    } catch (err: any) {
      setError(err.message || "Failed to save driver");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    try {
      const res = await fetch(`/api/drivers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete driver");
      await fetchDrivers();
    } catch (err) {
      setError("Failed to delete driver");
      console.error(err);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Are you sure you want to delete ALL ${drivers.length} drivers? This action cannot be undone!`)) return;
    
    if (!confirm("This will permanently delete all drivers from the database. Are you absolutely sure?")) return;

    try {
      setLoading(true);
      let deletedCount = 0;
      let failedCount = 0;

      for (const driver of drivers) {
        try {
          const res = await fetch(`/api/drivers/${driver._id}`, { method: "DELETE" });
          if (res.ok) {
            deletedCount++;
          } else {
            failedCount++;
          }
        } catch (err) {
          failedCount++;
        }
      }

      setUploadStatus(`✓ Deleted ${deletedCount} drivers. ${failedCount > 0 ? `${failedCount} failed.` : ''}`);
      await fetchDrivers();
    } catch (err) {
      setError("Failed to delete all drivers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        modelNumber: driver.sku,
        series: driver.series || "",
        powerWattage: `${driver.wattageRange.min}-${driver.wattageRange.max}W`,
        outputVoltage: driver.outputVoltage || "",
        outputCurrent: driver.outputCurrent || "",
        inputVoltageRange: driver.inputVoltage || "",
        ipRating: driver.ipRating || "",
        type: driver.type || "",
        price: driver.price.toString(),
        inStock: driver.inStock,
      });
    } else {
      setEditingDriver(null);
      setFormData({
        modelNumber: "",
        series: "",
        powerWattage: "",
        outputVoltage: "",
        outputCurrent: "",
        inputVoltageRange: "",
        ipRating: "",
        type: "",
        price: "",
        inStock: true,
      });
    }
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDriver(null);
    setError("");
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Model Number": "DRV-12V-50W",
        "Series": "Standard Series",
        "Power (Wattage)": "10-50W",
        "Output Voltage": "12V DC",
        "Output Current": "4.16A",
        "Input Voltage Range": "100-240V AC",
        "IP Rating": "IP67",
        "Type": "Constant Voltage",
        "Price (USD)": 25.00,
        "In Stock": "Yes"
      },
      {
        "Model Number": "DRV-24V-100W",
        "Series": "High Power Series",
        "Power (Wattage)": "50-100W",
        "Output Voltage": "24V DC",
        "Output Current": "4.16A",
        "Input Voltage Range": "100-240V AC",
        "IP Rating": "IP67",
        "Type": "Constant Voltage",
        "Price (USD)": 45.00,
        "In Stock": "Yes"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Drivers");
    XLSX.writeFile(wb, "drivers_template.xlsx");
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus("");
    setError("");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Log first row to see column names
      if (jsonData.length > 0) {
        console.log("First row columns:", Object.keys(jsonData[0] as any));
        console.log("First row data:", jsonData[0]);
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData as any[]) {
        try {
          // Parse wattage range - try multiple column name variations
          const powerStr = (
            row["Power (Wattage)"] || 
            row["Power [Wattage]"] || 
            row["Power Wattage"] ||
            row["Wattage"] ||
            ""
          ).toString().trim();
          
          console.log("Parsing wattage for row:", row["Model Number"], "Power string:", powerStr);
          
          // Try to match various formats: "10-50W", "10-50", "10W-50W", etc.
          let minWattage = 0;
          let maxWattage = 0;
          
          // Remove 'W' and whitespace for easier parsing
          const cleanPowerStr = powerStr.replace(/W/gi, '').trim();
          const wattageMatch = cleanPowerStr.match(/(\d+\.?\d*)\s*[-–—]\s*(\d+\.?\d*)/);
          
          if (wattageMatch) {
            minWattage = parseFloat(wattageMatch[1]);
            maxWattage = parseFloat(wattageMatch[2]);
            console.log("Parsed range:", minWattage, "-", maxWattage);
          } else {
            // If no range found, try single value
            const singleMatch = cleanPowerStr.match(/(\d+\.?\d*)/);
            if (singleMatch) {
              minWattage = parseFloat(singleMatch[1]);
              maxWattage = parseFloat(singleMatch[1]);
              console.log("Parsed single value:", minWattage);
            } else {
              console.log("No wattage value found!");
            }
          }

          const driverData = {
            sku: row["Model Number"] || row.sku || "",
            name: row["Model Number"] || row.name || "",
            series: row["Series"] || "",
            description: row["Type"] || row.description || "",
            wattageRange: {
              min: minWattage,
              max: maxWattage,
            },
            outputVoltage: row["Output Voltage"] || "",
            outputCurrent: row["Output Current"] || "",
            inputVoltage: row["Input Voltage Range"] || row["Input Voltage"] || "",
            ipRating: row["IP Rating"] || "",
            type: row["Type"] || "",
            price: parseFloat(row["Price (USD)"] || row.price || 0),
            category: "Driver",
            inStock: (row["In Stock"] || row.inStock || "Yes").toString().toLowerCase() === "yes",
          };

          const res = await fetch("/api/drivers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(driverData),
          });

          if (res.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      setUploadStatus(`✓ Successfully uploaded ${successCount} drivers. ${errorCount > 0 ? `${errorCount} failed.` : ''}`);
      await fetchDrivers();
    } catch (err) {
      setError("Failed to process Excel file. Please check the format.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Template
              </button>
              <label className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer">
                <Upload className="w-5 h-5" />
                {uploading ? "Uploading..." : "Bulk Upload"}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleBulkUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {drivers.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  disabled={loading}
                >
                  <Trash2 className="w-5 h-5" />
                  Delete All ({drivers.length})
                </button>
              )}
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Driver
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search drivers by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {uploadStatus && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {uploadStatus}
          </div>
        )}

        {/* Drivers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Series
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Power (Wattage)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Output Voltage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Output Current
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Input Voltage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price (USD)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In Stock
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                      No drivers found. Click "Add Driver" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <tr key={driver._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {driver.sku}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {driver.series || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.wattageRange.min}W - {driver.wattageRange.max}W
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.outputVoltage || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.outputCurrent || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.inputVoltage || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.ipRating || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.type || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${driver.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            driver.inStock
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {driver.inStock ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openModal(driver)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(driver._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Total Drivers: {filteredDrivers.length}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8 relative">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-lg z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingDriver ? "Edit Driver" : "Add New Driver"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-80px)]">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.modelNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, modelNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., DRV-12V-50W"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Series
                  </label>
                  <input
                    type="text"
                    value={formData.series}
                    onChange={(e) =>
                      setFormData({ ...formData, series: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., Standard Series"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Power (Wattage) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.powerWattage}
                    onChange={(e) =>
                      setFormData({ ...formData, powerWattage: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., 10-50W"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="25.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Output Voltage
                  </label>
                  <input
                    type="text"
                    value={formData.outputVoltage}
                    onChange={(e) =>
                      setFormData({ ...formData, outputVoltage: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., 12V DC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Output Current
                  </label>
                  <input
                    type="text"
                    value={formData.outputCurrent}
                    onChange={(e) =>
                      setFormData({ ...formData, outputCurrent: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., 4.16A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Input Voltage Range
                  </label>
                  <input
                    type="text"
                    value={formData.inputVoltageRange}
                    onChange={(e) =>
                      setFormData({ ...formData, inputVoltageRange: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., 100-240V AC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IP Rating
                  </label>
                  <input
                    type="text"
                    value={formData.ipRating}
                    onChange={(e) =>
                      setFormData({ ...formData, ipRating: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., IP67"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="e.g., Constant Voltage"
                />
              </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={(e) =>
                      setFormData({ ...formData, inStock: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                    In Stock
                  </label>
                </div>
              </div>

              {/* Sticky Footer with Buttons */}
              <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 rounded-b-lg">
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Saving..." : editingDriver ? "Update Driver" : "Add Driver"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
