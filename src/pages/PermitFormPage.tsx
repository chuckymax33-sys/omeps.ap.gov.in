import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import {
  FileCheck, ShieldCheck, Truck, Loader2, Download, Printer, X, Check, ClipboardCheck, Info
} from "lucide-react";
import api from "../services/api";
import type { Permit } from "../types";

// Destination mapping removed as values are now static

// Zod Schema for validation
const formSchema = zod.object({
  permit_number: zod.string().min(1, "Permit number is required"),
  issue_on: zod.string().min(1, "Issue date is required"),
  validity_from: zod.string().min(1, "Validity from date is required"),
  validity_to: zod.string().min(1, "Validity to date is required"),
  tp_id: zod.string().optional(),
  is_mdl: zod.string().optional(),

  mobile_number: zod.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  stationary_number: zod.string().min(1, "Stationary number is required"),

  // Transport Details
  vehicle_number: zod.string().min(4, "Vehicle number is required"),
  driver_name: zod.string().min(2, "Driver name is required"),
  driving_license_number: zod.string().min(5, "Driving license number is required"),
  authorized_qty_selection: zod.string().optional(),
  authorized_qty_custom: zod.string().optional(),
  actual_dispatch_qty_selection: zod.string().optional(),
  actual_dispatch_qty_custom: zod.string().optional(),
  consignee_name_selection: zod.string().optional(),
  consignee_name_custom: zod.string().optional(),
  consignee_address_selection: zod.string().optional(),
  consignee_address_custom: zod.string().optional(),
  destination_selection: zod.string().optional(),
  destination_custom: zod.string().optional(),
  survey_number_selection: zod.string().optional(),
  survey_number_custom: zod.string().optional(),
  hsn_code_selection: zod.string().optional(),
  hsn_code_custom: zod.string().optional(),
  distance_km_selection: zod.string().optional(),
  distance_km_custom: zod.string().optional(),
  time_required_selection: zod.string().optional(),
  time_required_custom: zod.string().optional(),
  sale_value_selection: zod.string().optional(),
  sale_value_custom: zod.string().optional(),
});

const tpConfig = {
  "2611260047": {
    lessee_name: "Dasam Venkata Nagaraju",
    destination: "TIRUVALLUR",
    distance_km: 50,
    time_required: "004:30",
    consignee_name: "MAHESH",
    consignee_address: "CHENNAI",
    survey_number: "416 & 417",
    mandal: "Nagalapuram",
    village: "Kadivedu",
    district: "Tirupati",
    hsn_code: "2157",
    mineral_name: "Ordinary Earth",
    sale_value: 1000
  },
  "2611260066": {
    lessee_name: "M/s Akshitha Minerals Importer & Exporter Pvt Ltd",
    destination: "CHENNAI",
    distance_km: 85,
    time_required: "006:15",
    consignee_name: "RUDHRA REDDY",
    consignee_address: "CHENNAI",
    survey_number: "157/2",
    mandal: "Varadaiahpalem",
    village: "Chedullapakam",
    district: "Tirupati",
    hsn_code: "25309099",
    mineral_name: "Ordinary Earth",
    sale_value: 1000
  }
};

const PermitFormPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Verification states
  const [verifyingStationary, setVerifyingStationary] = useState(false);
  const [stationaryVerified, setStationaryVerified] = useState(false);
  const [verifyingVehicle, setVerifyingVehicle] = useState(false);
  const [vehicleVerified, setVehicleVerified] = useState(false);

  // Success Modal States
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdPermit, setCreatedPermit] = useState<Permit | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [permitUrl, setPermitUrl] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState,
  } = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      permit_number: "TPPER202604250794",
      issue_on: new Date().toISOString().split("T")[0],
      validity_from: new Date().toISOString().split("T")[0],
      validity_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      stationary_number: "DD",
      tp_id: "2611260047",
      is_mdl: "Non-MDL",
      authorized_qty_selection: "300",
      actual_dispatch_qty_selection: "10",
      consignee_name_selection: "default",
      consignee_address_selection: "default",
      destination_selection: "default",
      survey_number_selection: "default",
      hsn_code_selection: "default",
      distance_km_selection: "default",
      time_required_selection: "default",
      sale_value_selection: "default",
    },
  });

  const errors = formState.errors as any;

  const selectedStationaryNum = watch("stationary_number");
  const selectedVehicleNum = watch("vehicle_number");
  const selectedTpId = watch("tp_id") || "2611260047";
  const currentConfig = tpConfig[selectedTpId as keyof typeof tpConfig] || tpConfig["2611260047"];

  // Handle destination auto-fill logic removed

  // Reset verification if the inputs change
  useEffect(() => {
    setStationaryVerified(false);
  }, [selectedStationaryNum]);

  useEffect(() => {
    setVehicleVerified(false);
  }, [selectedVehicleNum]);

  // Simulate Stationary Number Verification
  const verifyStationary = () => {
    if (!selectedStationaryNum) {
      showToast("Please enter a stationary number first", "error");
      return;
    }
    setVerifyingStationary(true);
    setTimeout(() => {
      setVerifyingStationary(false);
      setStationaryVerified(true);
      showToast("Stationary number verified successfully!", "success");
    }, 1200);
  };

  // Simulate Vehicle Number Verification
  const verifyVehicle = () => {
    if (!selectedVehicleNum) {
      showToast("Please enter a vehicle number first", "error");
      return;
    }
    setVerifyingVehicle(true);
    setTimeout(() => {
      setVerifyingVehicle(false);
      setVehicleVerified(true);
      showToast("Vehicle registration verified successfully!", "success");
    }, 1200);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const onSubmit = async (data: any) => {
    // 1. Verify custom constraints
    if (!stationaryVerified) {
      showToast("Please verify the Stationary Number before submitting", "error");
      return;
    }
    if (!vehicleVerified) {
      showToast("Please verify the Vehicle Number before submitting", "error");
      return;
    }

    setSubmitting(true);
    try {
      // Form fields validity_from/to need to be parsed to ISO strings
      const final_authorized_qty = data.authorized_qty_selection === "custom"
        ? parseFloat(data.authorized_qty_custom) || 300
        : parseFloat(data.authorized_qty_selection || "300");

      const final_actual_dispatch_qty = data.actual_dispatch_qty_selection === "custom"
        ? parseFloat(data.actual_dispatch_qty_custom) || 10
        : parseFloat(data.actual_dispatch_qty_selection || "10");

      const final_consignee_name = data.consignee_name_selection === "custom"
        ? data.consignee_name_custom
        : currentConfig.consignee_name;

      const final_consignee_address = data.consignee_address_selection === "custom"
        ? data.consignee_address_custom
        : currentConfig.consignee_address;

      const final_destination = data.destination_selection === "custom"
        ? data.destination_custom
        : currentConfig.destination;

      const final_survey_number = data.survey_number_selection === "custom" ? data.survey_number_custom : currentConfig.survey_number;
      const final_hsn_code = data.hsn_code_selection === "custom" ? data.hsn_code_custom : currentConfig.hsn_code;
      const final_distance_km = data.distance_km_selection === "custom" ? parseFloat(data.distance_km_custom) || currentConfig.distance_km : currentConfig.distance_km;
      const final_time_required = data.time_required_selection === "custom" ? data.time_required_custom : currentConfig.time_required;
      const final_lessee_name = data.lessee_name_selection === "custom" ? data.lessee_name_custom : currentConfig.lessee_name;
      const final_mineral_name = data.mineral_name_selection === "custom" ? data.mineral_name_custom : currentConfig.mineral_name;
      const final_sale_value = data.sale_value_selection === "custom" ? parseFloat(data.sale_value_custom) || currentConfig.sale_value : currentConfig.sale_value;

      const payload = {
        ...data,
        ...currentConfig,
        lessee_name: final_lessee_name,
        mineral_name: final_mineral_name,
        permit_number: data.permit_number,
        tp_id: data.tp_id,
        is_mdl: data.is_mdl,
        authorized_qty: final_authorized_qty,
        actual_dispatch_quantity: final_actual_dispatch_qty,
        consignee_name: final_consignee_name?.toUpperCase(),
        consignee_address: final_consignee_address?.toUpperCase(),
        destination: final_destination,
        survey_number: final_survey_number,
        hsn_code: final_hsn_code,
        distance_km: final_distance_km,
        time_required: final_time_required,
        sale_value: final_sale_value,
        vehicle_number: data.vehicle_number?.toUpperCase(),
        driver_name: data.driver_name?.toUpperCase(),
        driving_license_number: data.driving_license_number?.toUpperCase(),
        issue_on: data.issue_on,
        validity_from: data.validity_from,
        validity_to: data.validity_to,
      };

      const response = await api.post("/api/permits/create", payload);

      setCreatedPermit(response.data.permit);
      setQrCodeData(response.data.qr_code);
      setPermitUrl(response.data.permit_url);
      setSuccessModalOpen(true);
      showToast("Transit Permit generated successfully!", "success");

      // Reset form and verification states
      reset();
      setStationaryVerified(false);
      setVehicleVerified(false);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.detail || "Failed to submit transit permit. Check server connection.";
      showToast(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Download QR Code image
  const downloadQRCode = () => {
    if (!qrCodeData || !createdPermit) return;
    const link = document.createElement("a");
    link.href = qrCodeData;
    link.download = `QR_${createdPermit.permit_number}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("QR code downloaded!", "success");
  };

  // Print function
  const printPermit = () => {
    if (!createdPermit) return;
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.open(`${backendUrl}/api/permits/${createdPermit.stationary_number}/${createdPermit.transit_id}/pdf`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-200">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 text-white transition-all duration-300 transform translate-y-0 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}>
          <div className="font-semibold text-sm">{toast.message}</div>
          <button onClick={() => setToast(null)} className="text-white hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Title Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center">
            <ClipboardCheck className="w-7 h-7 mr-2 text-primary" />
            Transit Permit Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Government Transport Department — Official Cargo E-Permit System
          </p>
        </div>
        <div className="mt-2 md:mt-0 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 flex items-center space-x-2 text-blue-700 dark:text-blue-400 text-xs">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>Please fill in Consignee and Vehicle details below to submit a temporary transit form.</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Top Header Card: General Permit Details */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">



            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                TP
              </label>
              <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono">
                Transit ID
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Transit ID
              </label>
              <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono italic">
                Auto-generated
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Issue On <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("issue_on")}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              {errors.issue_on && (
                <p className="text-red-500 text-xs mt-1">{errors.issue_on.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Permit Number
              </label>
              <select
                {...register("permit_number")}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
              >
                <option value="TPPER202604250794">TPPER202604250794</option>
                <option value="TPPER202604258302">TPPER202604258302</option>
                <option value="TPPER203605063097">TPPER203605063097</option>
                <option value="TPPER202605152316">TPPER202605152316</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                TP ID
              </label>
              <select
                {...register("tp_id")}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
              >
                <option value="2611260047">2611260047</option>
                <option value="2611260066">2611260066</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Lessee Name
              </label>
              <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono">
                {currentConfig.lessee_name}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Mineral Name
              </label>
              <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono">
                {currentConfig.mineral_name}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Authorized Qty
              </label>
              <select
                {...register("authorized_qty_selection")}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono mb-2"
              >
                <option value="300">300</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="custom">Custom</option>
              </select>
              {watch("authorized_qty_selection") === "custom" && (
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter Custom Qty"
                  {...register("authorized_qty_custom")}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Actual Dispatch Qty
              </label>
              <select
                {...register("actual_dispatch_qty_selection")}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono mb-2"
              >
                <option value="10">10</option>
                <option value="22">22</option>
                <option value="40">40</option>
                <option value="custom">Custom</option>
              </select>
              {watch("actual_dispatch_qty_selection") === "custom" && (
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter Custom Qty"
                  {...register("actual_dispatch_qty_custom")}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
                />
              )}
            </div>

          </div>
        </div>

        {/* Two Main Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT CARD: Consignee Details */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
            <div>
              {/* Card Header with Radio Buttons */}
              <div className="flex flex-row justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
                  <FileCheck className="w-5 h-5 mr-2 text-amber-500" />
                  Consignee Details
                </h2>
                {/* MDL / Non-MDL Toggles */}
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      value="MDL"
                      {...register("is_mdl")}
                      className="form-radio text-primary focus:ring-primary h-4 w-4 border-gray-300 dark:border-gray-700"
                    />
                    <span className="ml-2">MDL</span>
                  </label>
                  <label className="inline-flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      value="Non-MDL"
                      {...register("is_mdl")}
                      className="form-radio text-primary focus:ring-primary h-4 w-4 border-gray-300 dark:border-gray-700"
                    />
                    <span className="ml-2">Non-MDL</span>
                  </label>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Consignee Name
                  </label>
                  <select
                    {...register("consignee_name_selection")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono mb-2"
                  >
                    <option value="default">{currentConfig.consignee_name}</option>
                    <option value="custom">Custom</option>
                  </select>
                  {watch("consignee_name_selection") === "custom" && (
                    <input
                      type="text"
                      placeholder="Enter Custom Consignee Name"
                      {...register("consignee_name_custom")}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono uppercase"
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Consignee Address
                  </label>
                  <select
                    {...register("consignee_address_selection")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono mb-2"
                  >
                    <option value="default">{currentConfig.consignee_address}</option>
                    <option value="custom">Custom</option>
                  </select>
                  {watch("consignee_address_selection") === "custom" && (
                    <input
                      type="text"
                      placeholder="Enter Custom Consignee Address"
                      {...register("consignee_address_custom")}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono uppercase"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Mobile Number"
                    {...register("mobile_number")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                  {errors.mobile_number && (
                    <p className="text-red-500 text-xs mt-1">{errors.mobile_number.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Sale Value
                  </label>
                  <select
                    {...register("sale_value_selection")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono mb-2"
                  >
                    <option value="default">₹ {currentConfig.sale_value}</option>
                    <option value="custom">Custom</option>
                  </select>
                  {watch("sale_value_selection") === "custom" && (
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Enter Custom Sale Value"
                      {...register("sale_value_custom")}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Survey Number
                  </label>
                  <select
                    {...register("survey_number_selection")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono mb-2"
                  >
                    <option value="default">{currentConfig.survey_number}</option>
                    <option value="custom">Custom</option>
                  </select>
                  {watch("survey_number_selection") === "custom" && (
                    <input
                      type="text"
                      placeholder="Enter Custom Survey No"
                      {...register("survey_number_custom")}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    HSN Code
                  </label>
                  <select
                    {...register("hsn_code_selection")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono mb-2"
                  >
                    <option value="default">{currentConfig.hsn_code}</option>
                    <option value="custom">Custom</option>
                  </select>
                  {watch("hsn_code_selection") === "custom" && (
                    <input
                      type="text"
                      placeholder="Enter Custom HSN Code"
                      {...register("hsn_code_custom")}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Mandal
                  </label>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono">
                    {currentConfig.mandal}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Village
                  </label>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono">
                    {currentConfig.village}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    District
                  </label>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono">
                    {currentConfig.district}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Valid From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("validity_from")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                  {errors.validity_from && (
                    <p className="text-red-500 text-xs mt-1">{errors.validity_from.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Valid To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("validity_to")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                  {errors.validity_to && (
                    <p className="text-red-500 text-xs mt-1">{errors.validity_to.message}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Stationary Number with Verify Button */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Stationary Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="e.g. AA0000001"
                  {...register("stationary_number")}
                  className="flex-grow bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
                />

                <button
                  type="button"
                  onClick={verifyStationary}
                  disabled={verifyingStationary}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center space-x-1.5 focus:outline-none transition-all ${stationaryVerified
                      ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-650 text-white"
                    }`}
                >
                  {verifyingStationary ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : stationaryVerified ? (
                    <Check className="w-4 h-4" />
                  ) : null}
                  <span>{stationaryVerified ? "Verified" : "Verify"}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center">
                <Info className="w-3 h-3 mr-1" />
                Please verify your stationary number before submitting
              </p>
              {errors.stationary_number && (
                <p className="text-red-500 text-xs mt-1">{errors.stationary_number.message}</p>
              )}
            </div>

          </div>

          {/* RIGHT CARD: Vehicle & Transport */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-amber-500" />
                  Vehicle & Transport
                </h2>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Vehicle Type
                  </label>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono">
                    Tipper Lorry
                  </div>
                </div>

                {/* Vehicle Number Input with Verify button */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="e.g.TSO7UW1234"
                      {...register("vehicle_number")}
                      className="flex-grow bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono uppercase"
                    />

                    <button
                      type="button"
                      onClick={verifyVehicle}
                      disabled={verifyingVehicle}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center space-x-1 focus:outline-none transition-all ${vehicleVerified
                          ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                          : "bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-650 text-white"
                        }`}
                    >
                      {verifyingVehicle ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : vehicleVerified ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : null}
                      <span>{vehicleVerified ? "Verified" : "Verify"}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Please verify your vehicle registration before submitting
                  </p>
                  {errors.vehicle_number && (
                    <p className="text-red-500 text-xs mt-1">{errors.vehicle_number.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Driver Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Driver Name"
                    {...register("driver_name")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none uppercase"
                  />
                  {errors.driver_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.driver_name.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Driving License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Driving License Number"
                    {...register("driving_license_number")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono uppercase"
                  />
                  {errors.driving_license_number && (
                    <p className="text-red-500 text-xs mt-1">{errors.driving_license_number.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Destination Location
                  </label>
                  <select
                    {...register("destination_selection")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono mb-2"
                  >
                    <option value="default">{currentConfig.destination}</option>
                    <option value="custom">Custom</option>
                  </select>
                  {watch("destination_selection") === "custom" && (
                    <input
                      type="text"
                      placeholder="Enter Custom Destination"
                      {...register("destination_custom")}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Distance (KM)
                  </label>
                  <select
                    {...register("distance_km_selection")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono mb-2"
                  >
                    <option value="default">{currentConfig.distance_km} KM</option>
                    <option value="custom">Custom</option>
                  </select>
                  {watch("distance_km_selection") === "custom" && (
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Enter Custom Distance"
                      {...register("distance_km_custom")}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Time Required
                  </label>
                  <select
                    {...register("time_required_selection")}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono mb-2"
                  >
                    <option value="default">{currentConfig.time_required}</option>
                    <option value="custom">Custom</option>
                  </select>
                  {watch("time_required_selection") === "custom" && (
                    <input
                      type="text"
                      placeholder="Enter Custom Time (e.g. 004:30)"
                      {...register("time_required_custom")}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
                    />
                  )}
                </div>

              </div>
            </div>

            {/* Safe Bottom Padding */}
            <div className="pt-4 mt-4 text-[10px] text-slate-400 leading-normal">
              Transit parameters (Distance & Time Required) are populated based on the default highway logistics templates. Adjust manually if alternative route routes are traversed.
            </div>

          </div>

        </div>

        {/* Bottom Centered Large Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-80 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-650 text-white font-semibold text-base py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none transition-all flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                <span>Generating Permit...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span>Submit Transit Form</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {successModalOpen && createdPermit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-800 dark:text-slate-100">

            {/* Modal Header */}
            <div className="gov-header gov-accent-border px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Permit Generated Successfully</h3>
                  <p className="text-[10px] text-slate-300">E-Transit Document Verification Active</p>
                </div>
              </div>
              <button
                onClick={() => setSuccessModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">

              {/* QR and URL Info Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                {/* QR Code Container */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center w-40 h-40">
                  {qrCodeData ? (
                    <img
                      src={qrCodeData}
                      alt="Transit Permit QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  )}
                </div>
                {/* Text and Copy URL */}
                <div className="flex-grow flex flex-col justify-between text-center sm:text-left space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider">E-Permit Verification ID</h4>
                    <p className="text-xl font-extrabold text-slate-800 dark:text-white font-mono break-all mt-0.5">
                      {createdPermit.permit_number}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-1">Verification URL</h4>
                    <a
                      href={permitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-mono text-xs hover:underline break-all"
                    >
                      {permitUrl}
                    </a>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    This QR code can be scanned with Google Lens, Apple Camera, or any QR scanner. It redirects to the official public permit verification page displaying active/expired/cancelled status.
                  </div>
                </div>
              </div>

              {/* Summary Details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wide">Consignee Name:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{createdPermit.consignee_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wide">Vehicle Info:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{createdPermit.vehicle_number} ({createdPermit.vehicle_type})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wide">Destination:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{createdPermit.destination}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wide">Validity Period:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {new Date(createdPermit.validity_from).toLocaleDateString()} to {new Date(createdPermit.validity_to).toLocaleDateString()}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={downloadQRCode}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg shadow-sm text-sm flex items-center justify-center space-x-2 transition-all focus:outline-none"
              >
                <Download className="w-4 h-4" />
                <span>Download QR</span>
              </button>
              <button
                type="button"
                onClick={printPermit}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg shadow-sm text-sm flex items-center justify-center space-x-2 transition-all focus:outline-none"
              >
                <Printer className="w-4 h-4" />
                <span>Print Permit</span>
              </button>
              <button
                type="button"
                onClick={() => setSuccessModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md text-sm transition-all focus:outline-none"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PermitFormPage;
