import React, { useState, useEffect } from "react";
import { 
  Search, Filter, Download, ExternalLink, Edit, Trash2, X, Loader2, BarChart3, AlertTriangle, FileText, ClipboardList
} from "lucide-react";
import api from "../services/api";
import type { Permit } from "../types";

const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [editAuthQty, setEditAuthQty] = useState(0);
  const [editActualQty, setEditActualQty] = useState(0);
  const [editValidityTo, setEditValidityTo] = useState("");
  const [editStatus, setEditStatus] = useState<"VALID" | "EXPIRED" | "CANCELLED">("VALID");
  const [updatingPermit, setUpdatingPermit] = useState(false);

  // Fetch permits
  const fetchPermits = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status_filter = statusFilter;
      if (destinationFilter) params.destination_filter = destinationFilter;

      const response = await api.get("/api/permits", { params });
      setPermits(response.data);
    } catch (err: any) {
      console.error(err);
      showToast("Failed to fetch permit records from database.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermits();
  }, [statusFilter, destinationFilter]); // Fetch immediately when filter changes

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPermits();
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Quick Cancel Permit
  const handleCancelPermit = async (permitId: string) => {
    if (!window.confirm("Are you sure you want to CANCEL this transit permit? This action is immediate.")) {
      return;
    }
    try {
      await api.put(`/api/permits/${permitId}`, { status: "CANCELLED" });
      showToast("Permit cancelled successfully.", "success");
      fetchPermits();
    } catch (err: any) {
      console.error(err);
      showToast("Failed to cancel permit.", "error");
    }
  };

  // Delete Permit Record
  const handleDeletePermit = async (permitId: string) => {
    if (!window.confirm("CAUTION: Are you sure you want to permanently DELETE this permit record? This cannot be undone.")) {
      return;
    }
    try {
      await api.delete(`/api/permits/${permitId}`);
      showToast("Permit record deleted successfully.", "success");
      fetchPermits();
    } catch (err: any) {
      console.error(err);
      showToast("Failed to delete permit record.", "error");
    }
  };

  // Open Edit Modal
  const openEditModal = (permit: Permit) => {
    setSelectedPermit(permit);
    setEditAuthQty(permit.authorized_qty);
    setEditActualQty(permit.actual_dispatch_quantity);
    // Format validity_to date for HTML input
    const date = new Date(permit.validity_to);
    const dateString = date.toISOString().split("T")[0];
    setEditValidityTo(dateString);
    setEditStatus(permit.status);
    setEditModalOpen(true);
  };

  // Submit Edit Form
  const handleUpdatePermit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermit) return;

    if (editActualQty > editAuthQty) {
      showToast("Actual Dispatch Quantity cannot exceed Authorized Limit", "error");
      return;
    }

    setUpdatingPermit(true);
    try {
      const payload = {
        authorized_qty: editAuthQty,
        actual_dispatch_quantity: editActualQty,
        validity_to: new Date(editValidityTo).toISOString(),
        status: editStatus,
      };

      await api.put(`/api/permits/${selectedPermit.id}`, payload);
      showToast("Permit details updated successfully.", "success");
      setEditModalOpen(false);
      fetchPermits();
    } catch (err: any) {
      console.error(err);
      showToast("Failed to update permit details.", "error");
    } finally {
      setUpdatingPermit(false);
    }
  };

  // Export Data to CSV
  const handleExportCSV = () => {
    if (permits.length === 0) {
      showToast("No records available to export.", "error");
      return;
    }

    const headers = [
      "Permit Number", "Consignee Name", "Consignee Address", "Mobile",
      "Sale Value", "GSTIN", "Authorized Qty", "Dispatch Qty", "Stationary No",
      "Vehicle Type", "Vehicle No", "Driver Name", "DL Number", "Destination",
      "Distance (KM)", "Time Required", "Status", "Created At"
    ];

    const rows = permits.map(p => [
      p.permit_number,
      `"${p.consignee_name.replace(/"/g, '""')}"`,
      `"${p.consignee_address.replace(/"/g, '""')}"`,
      p.mobile_number,
      p.sale_value,
      p.gstin || "",
      p.authorized_qty,
      p.actual_dispatch_quantity,
      p.stationary_number,
      p.vehicle_type,
      p.vehicle_number,
      `"${p.driver_name.replace(/"/g, '""')}"`,
      p.driving_license_number,
      `"${p.destination.replace(/"/g, '""')}"`,
      p.distance_km,
      p.time_required,
      p.status,
      p.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transit_permits_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV records exported successfully!", "success");
  };

  // Compute analytics
  const totalPermits = permits.length;
  const activePermits = permits.filter(p => p.status === "VALID").length;
  const expiredPermits = permits.filter(p => p.status === "EXPIRED").length;
  const cancelledPermits = permits.filter(p => p.status === "CANCELLED").length;
  const totalDispatch = permits.reduce((acc, p) => acc + p.actual_dispatch_quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 text-white transition-all duration-305 transform translate-y-0 ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          <div className="font-semibold text-sm">{toast.message}</div>
          <button onClick={() => setToast(null)} className="text-white hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center">
            <ClipboardList className="w-7 h-7 mr-2 text-primary" />
            Admin Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor, audit, and export generated cargo transport transit permits.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-green-700 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm transition-all focus:outline-none"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Records</span>
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-100 dark:bg-blue-950/40 p-3 rounded-lg text-blue-600 dark:text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Permits</span>
            <span className="text-2xl font-extrabold text-slate-850 dark:text-white">{totalPermits}</span>
          </div>
        </div>

        {/* Active Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="bg-green-100 dark:bg-green-950/40 p-3 rounded-lg text-green-600 dark:text-green-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Active Permits</span>
            <span className="text-2xl font-extrabold text-slate-850 dark:text-white">{activePermits}</span>
          </div>
        </div>

        {/* Expired / Cancelled Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="bg-amber-100 dark:bg-amber-950/40 p-3 rounded-lg text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Expired/Cancelled</span>
            <span className="text-2xl font-extrabold text-slate-850 dark:text-white">
              {expiredPermits + cancelledPermits}
            </span>
          </div>
        </div>

        {/* Dispatch Quantity Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="bg-purple-100 dark:bg-purple-950/40 p-3 rounded-lg text-purple-600 dark:text-purple-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Dispatched (Tons)</span>
            <span className="text-2xl font-extrabold text-slate-850 dark:text-white">
              {totalDispatch.toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      {/* Search & Filters Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mb-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Search Queries
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search permit number, vehicle, driver, or consignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-850 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-850 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="">All Statuses</option>
              <option value="VALID">VALID</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Destination Filter
            </label>
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-850 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="">All Destinations</option>
              <option value="PONNERI">PONNERI - 601204</option>
              <option value="ENNORE">ENNORE - 600057</option>
              <option value="TIRUVALLUR">TIRUVALLUR - 602001</option>
              <option value="CHENNAI">CHENNAI - 600001</option>
              <option value="PERIYAPALAYAM">PERIYAPALAYAM - 601102</option>
            </select>
          </div>

          {/* Quick submission support */}
          <div className="md:col-span-4 flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("");
                setDestinationFilter("");
                setTimeout(() => fetchPermits(), 100);
              }}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 font-semibold focus:outline-none transition-colors"
            >
              Clear Filters
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-750 text-white font-semibold rounded-lg text-sm flex items-center justify-center space-x-1.5 focus:outline-none transition-all"
            >
              <Filter className="w-4 h-4" />
              <span>Apply Filters</span>
            </button>
          </div>

        </form>
      </div>

      {/* Permits Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-slate-400 mx-auto" />
            <p className="mt-3 text-slate-500 text-sm font-semibold">Syncing transit database records...</p>
          </div>
        ) : permits.length === 0 ? (
          <div className="py-20 text-center text-slate-500 dark:text-slate-400">
            <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="font-bold text-base">No Permits Found</h3>
            <p className="text-sm text-slate-400 mt-1">Adjust search parameters or create a permit from the public portal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-250 dark:border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-6">Permit No</th>
                  <th className="py-3.5 px-6">Consignee</th>
                  <th className="py-3.5 px-6">Vehicle Info</th>
                  <th className="py-3.5 px-6">Destination</th>
                  <th className="py-3.5 px-6 text-right">Cargo (Tons)</th>
                  <th className="py-3.5 px-6">Expiry Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {permits.map((permit) => (
                  <tr key={permit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    
                    {/* Permit Number */}
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-800 dark:text-slate-100">
                      {permit.permit_number}
                    </td>

                    {/* Consignee */}
                    <td className="py-3.5 px-6 font-medium">
                      {permit.consignee_name}
                    </td>

                    {/* Vehicle */}
                    <td className="py-3.5 px-6">
                      <div className="font-mono uppercase font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {permit.vehicle_number}
                      </div>
                      <div className="text-[10px] text-slate-400">{permit.vehicle_type}</div>
                    </td>

                    {/* Destination */}
                    <td className="py-3.5 px-6 font-medium text-xs">
                      {permit.destination}
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-6 text-right font-mono font-semibold">
                      {permit.actual_dispatch_quantity} / {permit.authorized_qty}
                    </td>

                    {/* Expiry Date */}
                    <td className="py-3.5 px-6 text-xs font-mono">
                      {new Date(permit.validity_to).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-6">
                      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        permit.status === "VALID"
                          ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                          : permit.status === "EXPIRED"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                      }`}>
                        {permit.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2.5">
                        
                        {/* View Permit */}
                        <a
                          href={`/permit/${permit.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-all"
                          title="Verify in verification portal"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Edit button */}
                        <button
                          onClick={() => openEditModal(permit)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
                          title="Modify details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Cancel Button */}
                        {permit.status === "VALID" && (
                          <button
                            onClick={() => handleCancelPermit(permit.id)}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/10 text-slate-400 hover:text-red-600 transition-all"
                            title="Cancel Permit"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeletePermit(permit.id)}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/10 text-slate-400 hover:text-red-650 transition-all"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* Edit Permit Modal */}
      {editModalOpen && selectedPermit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-850 dark:text-slate-100">
            
            <div className="gov-header gov-accent-border px-6 py-4 flex items-center justify-between text-white">
              <div>
                <h3 className="font-bold text-base">Edit Permit Details</h3>
                <p className="text-[10px] text-slate-300 font-mono">ID: {selectedPermit.permit_number}</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePermit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Authorized Limit Qty (Tons)
                </label>
                <input
                  type="number"
                  value={editAuthQty}
                  onChange={(e) => setEditAuthQty(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Actual Dispatched Cargo (Tons)
                </label>
                <input
                  type="number"
                  value={editActualQty}
                  onChange={(e) => setEditActualQty(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Validity Period End Date
                </label>
                <input
                  type="date"
                  value={editValidityTo}
                  onChange={(e) => setEditValidityTo(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Permit Integrity Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="VALID">VALID</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPermit}
                  className="px-5 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-750 text-white font-semibold rounded-lg text-sm flex items-center justify-center space-x-1.5 focus:outline-none"
                >
                  {updatingPermit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
