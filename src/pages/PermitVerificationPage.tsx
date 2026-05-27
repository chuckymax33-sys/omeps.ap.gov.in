import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Check, Pickaxe, Calendar, Loader2
} from "lucide-react";
import api from "../services/api";
import type { Permit } from "../types";

const DataCard = ({ label, value }: { label: string, value: string | number | undefined }) => (
  <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100">
    <div className="text-[#1E40AF] text-[11px] sm:text-[13px] font-semibold mb-1">{label}</div>
    <div className="text-slate-800 text-xs sm:text-sm">{value || "N/A"}</div>
  </div>
);

const PermitVerificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permit, setPermit] = useState<Permit | null>(null);
  const [verifyDate, setVerifyDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setVerifyDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPermitDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/permits/${id}`);
        setPermit(response.data.permit);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || "Invalid permit ID.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPermitDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1E40AF]" />
      </div>
    );
  }

  if (error || !permit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f0f9f4]">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-4 border border-red-200">
          <h2 className="text-xl font-bold text-slate-800">Verification Failed</h2>
          <p className="text-sm text-slate-500">{error || "The requested permit does not exist."}</p>
          <Link to="/" className="inline-block mt-4 text-[#1E40AF] font-semibold underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Format Date Helper
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).replace(/\//g, "-");
  };

  return (
    <div className="min-h-screen bg-[#f2fcf5] font-sans pb-10">

      {/* Header */}
      <div className="bg-[#1E40AF] text-white px-4 py-4 sm:px-6 sm:py-6 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
            <img src="/ap-logo.png" alt="AP Logo" className="absolute top-9 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-1.5 w-16 h-16 sm:w-20 sm:h-20 max-w-none object-contain drop-shadow-md hover:scale-105 transition-transform" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight">Department of<br />Mines & Geology</h1>
            <p className="text-xs text-white/80 mt-0.5">Andhra Pradesh</p>
            <p className="text-[10px] text-white/60 mt-2">Government</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-sm text-white/90">
            {verifyDate.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <a
            href="https://omeps.ap.gov.in/#/home/index"
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center border border-white/20 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-5 h-5"
            >
              <path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md lg:max-w-5xl mx-auto px-4 mt-8 sm:mt-12">

        {/* Verification Status */}
        <div className="text-center flex flex-col items-center mb-8">
          <Check className="w-12 h-12 text-slate-800 mb-2 stroke-[3]" />
          <h2 className="text-[#059669] text-2xl font-bold mb-1">Verification Successful</h2>
          <p className="text-[#059669] text-sm font-medium mb-4">Your document has been verified and is valid</p>
          <div className="bg-[#059669] text-white px-4 py-1.5 rounded-full flex items-center text-sm font-semibold shadow-sm">
            <Check className="w-4 h-4 mr-1.5 stroke-[3]" />
            Valid Document
          </div>
        </div>

        {/* Temporary Permit Details Title */}
        <div className="flex justify-between items-center border-b border-green-900/10 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl inline-block transform rotate-[5deg]">⛏️</span>
            <h3 className="font-bold text-slate-800 text-lg">Temporary Permit Details</h3>
          </div>
          <span className="font-bold text-slate-800 text-sm">TP</span>
        </div>

        {/* Details List */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          <DataCard label="Transit ID" value={permit.transit_id} />
          <DataCard label="Issue On" value={permit.issue_on ? formatDate(permit.issue_on) : undefined} />
          <DataCard label="Permit Number" value={permit.permit_number} />
          <DataCard label="TP ID" value={permit.tp_id} />
          <DataCard label="Lessee Name" value={permit.lessee_name} />
          <DataCard label="Mineral Name" value={permit.mineral_name} />
          <DataCard label="Vehicle Type" value={permit.vehicle_type} />
          <DataCard label="Vehicle Number" value={permit.vehicle_number} />
          <DataCard label="Driver Name" value={permit.driver_name} />
          <DataCard label="Driver License" value={permit.driving_license_number} />
          <DataCard label="Authorized Dispatch Qty" value={`${permit.authorized_qty?.toFixed(2)}`} />
          <DataCard label="Actual Dispatch Qty" value={`${permit.actual_dispatch_quantity?.toFixed(2)}`} />
          <DataCard label="Distance (KM)" value={`${permit.distance_km} KM`} />
          <DataCard label="Required Time" value={permit.time_required} />
          <DataCard label="Destination Location" value={permit.destination} />
          <DataCard label="Consignee Name" value={permit.consignee_name} />
          <DataCard label="Consignee Address" value={permit.consignee_address} />
          <DataCard label="Mandal" value={permit.mandal} />
          <DataCard label="Village" value={permit.village} />
          <DataCard label="District" value={permit.district} />
          <DataCard label="Survey Number" value={permit.survey_number} />
          <DataCard label="Sale Value" value={`₹ ${permit.sale_value?.toLocaleString()}`} />
          <DataCard label="Stationary Number" value={permit.stationary_number} />
          <DataCard label="HSN Code" value={permit.hsn_code} />
          <DataCard label="Valid From" value={formatDate(permit.validity_from)} />
          <DataCard label="Valid To" value={formatDate(permit.validity_to)} />
          <DataCard label="Mobile No" value={permit.mobile_number} />
        </div>

        {/* Verification Card Box */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex mb-8">
          <div className="flex-1 flex flex-col justify-center border-r border-slate-200 pl-2">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">📅</span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mb-3">VERIFIED</div>
            <div className="text-sm font-bold text-slate-800 text-center">
              {verifyDate.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" })}, {verifyDate.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' })}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-center mb-2">
              <Check className="w-5 h-5 text-slate-800" />
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mb-3">STATUS</div>
            <div className="text-sm font-bold text-[#059669] text-center">Valid</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => window.location.href = 'https://omeps.ap.gov.in/#/home/index'}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3.5 rounded-lg shadow-sm transition-colors text-sm"
          >
            Verify Another
          </button>
          <a
            href="https://omeps.ap.gov.in/#/home/index"
            className="w-full flex justify-center items-center bg-transparent border-2 border-[#1E40AF] text-[#1E40AF] font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
          >
            Back to Home
          </a>
        </div>

        <div className="flex justify-center items-center text-[#059669] text-sm font-semibold mb-12">
          <Check className="w-4 h-4 mr-1 stroke-[3]" />
          TP Verified
        </div>

      </div>

      {/* Footer */}
      <div className="bg-[#f3f4f6] text-center py-6 px-4 text-[10px] sm:text-xs text-slate-600 border-t border-slate-200">
        <p className="mb-4">© 2026 Department of Mines & Geology, Government of Andhra Pradesh</p>
        <div className="flex items-center justify-center gap-2">
          <span>Design and Developed by</span>
          <div className="relative h-6 w-24">
            <img src="/apcfss-logo.png" alt="APCFSS Logo" className="h-6 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span className="absolute inset-0 flex items-center text-xs font-bold text-black" style={{ display: 'none' }}>APCFSS</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PermitVerificationPage;
