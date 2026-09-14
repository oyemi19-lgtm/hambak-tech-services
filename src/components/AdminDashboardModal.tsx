import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Database,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Clock,
  Wallet,
  Users,
  FileText,
  Layers,
  Smartphone,
  X,
  Sparkles,
  DollarSign,
  AlertTriangle,
  Receipt,
  Mail,
  Phone,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { firestoreService } from "../services/firestoreService";
import {
  Service,
  RegistrationRecord,
  TransactionRecord,
  VtuOrderRecord,
  ContactInquiry,
  User,
  ReceiptRecord,
} from "../types";

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowReceipt?: (receipt: ReceiptRecord) => void;
}

type TabType =
  | "overview"
  | "services"
  | "registrations"
  | "transactions"
  | "vtu"
  | "inquiries"
  | "users";

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onShowReceipt,
}) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [vtuOrders, setVtuOrders] = useState<VtuOrderRecord[]>([]);
  const [inquiries, setInquiries] = useState<
    Array<ContactInquiry & { id: string; status: string; createdAt: string }>
  >([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals / Sub-forms for CRUD operations
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [isNewService, setIsNewService] = useState<boolean>(false);

  const [editingReg, setEditingReg] = useState<Partial<RegistrationRecord> | null>(null);
  const [isNewReg, setIsNewReg] = useState<boolean>(false);

  const [editingTx, setEditingTx] = useState<Partial<TransactionRecord> | null>(null);
  const [isNewTx, setIsNewTx] = useState<boolean>(false);

  const [editingVtu, setEditingVtu] = useState<Partial<VtuOrderRecord> | null>(null);
  const [isNewVtu, setIsNewVtu] = useState<boolean>(false);

  const [editingInquiry, setEditingInquiry] = useState<
    (Partial<ContactInquiry> & { id?: string; status?: string }) | null
  >(null);
  const [isNewInquiry, setIsNewInquiry] = useState<boolean>(false);

  const [walletModalUser, setWalletModalUser] = useState<User | null>(null);
  const [walletAmount, setWalletAmount] = useState<number>(5000);
  const [walletAction, setWalletAction] = useState<"credit" | "debit">("credit");
  const [walletReason, setWalletReason] = useState<string>("Administrative credit");

  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    entity: string;
    id: string;
    name: string;
  } | null>(null);

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const [srvs, regs, txs, vtus, inqs, usrs] = await Promise.all([
        firestoreService.getServices(),
        firestoreService.getAllRegistrations(),
        firestoreService.getAllTransactions(),
        firestoreService.getAllVtuOrders(),
        firestoreService.getAllInquiries(),
        firestoreService.getAllUsers(),
      ]);
      setServices(srvs || []);
      setRegistrations(regs || []);
      setTransactions(txs || []);
      setVtuOrders(vtus || []);
      setInquiries(inqs || []);
      setUsersList(usrs || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error syncing database records";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  // Push to LifeLine / Sync Catalog
  const handleDeploySync = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const count = await firestoreService.seedDefaultServices();
      await loadAllData();
      setActionMessage({
        type: "success",
        text: `Lifeline synced! ${count} core services deployed to Cloud Firestore.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sync to lifeline";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ================= CALCULATED METRICS ================= */
  const metrics = useMemo(() => {
    const totalVolume = transactions
      .filter((t) => t.status === "successful")
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const totalWalletHeld = usersList.reduce(
      (acc, curr) => acc + (curr.wallet || 0),
      0
    );

    const pendingRegistrations = registrations.filter(
      (r) => r.status === "pending" || r.status === "processing"
    ).length;

    const successfulVtuCount = vtuOrders.filter(
      (v) => v.status === "successful"
    ).length;

    const newInquiriesCount = inquiries.filter((i) => i.status === "new").length;

    return {
      totalVolume,
      totalWalletHeld,
      pendingRegistrations,
      successfulVtuCount,
      newInquiriesCount,
      totalUsers: usersList.length,
      totalServices: services.length,
      totalTransactions: transactions.length,
    };
  }, [transactions, usersList, registrations, vtuOrders, inquiries, services]);

  /* ================= SERVICE CRUD HANDLERS ================= */
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.category || (!editingService?.title && !editingService?.name)) {
      setActionMessage({ type: "error", text: "Please provide a Title and Category" });
      return;
    }

    setLoading(true);
    try {
      if (isNewService) {
        await firestoreService.createService({
          title: editingService.title || editingService.name || "",
          name: editingService.title || editingService.name || "",
          category: editingService.category,
          description: editingService.description || "",
          price: Number(editingService.price) || 0,
          status: editingService.status || "active",
          available: editingService.status !== "inactive",
        });
        setActionMessage({ type: "success", text: "Service created successfully in database" });
      } else if (editingService._id || editingService.id) {
        const id = (editingService._id || editingService.id) as string;
        await firestoreService.updateService(id, {
          title: editingService.title || editingService.name,
          name: editingService.title || editingService.name,
          category: editingService.category,
          description: editingService.description,
          price: Number(editingService.price) || 0,
          status: editingService.status,
          available: editingService.status !== "inactive",
        });
        setActionMessage({ type: "success", text: "Service updated successfully" });
      }
      setEditingService(null);
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving service";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ================= REGISTRATION CRUD HANDLERS ================= */
  const handleSaveRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg?.applicantName || !editingReg?.phone || !editingReg?.regType) {
      setActionMessage({ type: "error", text: "Applicant name, phone, and registration type required" });
      return;
    }

    setLoading(true);
    try {
      if (isNewReg) {
        await firestoreService.adminCreateRegistration({
          applicantName: editingReg.applicantName,
          email: editingReg.email || "",
          phone: editingReg.phone,
          regType: editingReg.regType,
          institution: editingReg.institution || "",
          details: editingReg.details || "",
          fee: Number(editingReg.fee) || 0,
          paymentStatus: editingReg.paymentStatus || "paid",
          status: editingReg.status || "pending",
          userId: editingReg.userId || "",
        });
        setActionMessage({ type: "success", text: "Registration record logged successfully" });
      } else if (editingReg.id) {
        await firestoreService.adminUpdateRegistration(editingReg.id, {
          applicantName: editingReg.applicantName,
          email: editingReg.email,
          phone: editingReg.phone,
          regType: editingReg.regType,
          institution: editingReg.institution,
          details: editingReg.details,
          fee: Number(editingReg.fee) || 0,
          paymentStatus: editingReg.paymentStatus,
          status: editingReg.status,
        });
        setActionMessage({ type: "success", text: "Registration updated successfully" });
      }
      setEditingReg(null);
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating registration";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ================= TRANSACTION CRUD HANDLERS ================= */
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx?.customerName || !editingTx?.amount || !editingTx?.type) {
      setActionMessage({ type: "error", text: "Customer name, amount, and type are required" });
      return;
    }

    setLoading(true);
    try {
      if (isNewTx) {
        await firestoreService.createTransaction({
          reference: `HTS-TX-${Date.now().toString().slice(-6)}`,
          customerName: editingTx.customerName,
          customerEmail: editingTx.customerEmail || "",
          customerPhone: editingTx.customerPhone || "",
          type: editingTx.type,
          amount: Number(editingTx.amount) || 0,
          paymentMethod: editingTx.paymentMethod || "pos",
          status: editingTx.status || "successful",
          description: editingTx.description || "Manual Admin Transaction Log",
          receiptNumber: `REC-${Date.now().toString().slice(-8)}`,
        });
        setActionMessage({ type: "success", text: "Transaction created and recorded" });
      } else if (editingTx.id) {
        await firestoreService.adminUpdateTransaction(editingTx.id, {
          customerName: editingTx.customerName,
          customerEmail: editingTx.customerEmail,
          customerPhone: editingTx.customerPhone,
          amount: Number(editingTx.amount),
          status: editingTx.status,
          description: editingTx.description,
          paymentMethod: editingTx.paymentMethod,
        });
        setActionMessage({ type: "success", text: "Transaction updated successfully" });
      }
      setEditingTx(null);
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving transaction";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ================= VTU CRUD HANDLERS ================= */
  const handleSaveVtu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVtu?.serviceType || !editingVtu?.amount) {
      setActionMessage({ type: "error", text: "Service type and amount are required" });
      return;
    }

    setLoading(true);
    try {
      if (isNewVtu) {
        await firestoreService.adminCreateVtuOrder({
          serviceType: editingVtu.serviceType,
          network: editingVtu.network || "",
          phoneNumber: editingVtu.phoneNumber || "",
          plan: editingVtu.plan || "",
          meterOrCardNumber: editingVtu.meterOrCardNumber || "",
          amount: Number(editingVtu.amount) || 0,
          status: editingVtu.status || "successful",
          userId: editingVtu.userId || "",
        });
        setActionMessage({ type: "success", text: "VTU Order entry logged" });
      } else if (editingVtu.id) {
        await firestoreService.adminUpdateVtuOrder(editingVtu.id, {
          serviceType: editingVtu.serviceType,
          network: editingVtu.network,
          phoneNumber: editingVtu.phoneNumber,
          plan: editingVtu.plan,
          amount: Number(editingVtu.amount),
          status: editingVtu.status,
        });
        setActionMessage({ type: "success", text: "VTU Order updated" });
      }
      setEditingVtu(null);
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving VTU entry";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ================= INQUIRY CRUD HANDLERS ================= */
  const handleSaveInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInquiry?.name || !editingInquiry?.phone) {
      setActionMessage({ type: "error", text: "Client name and phone are required" });
      return;
    }

    setLoading(true);
    try {
      if (isNewInquiry) {
        await firestoreService.adminCreateInquiry({
          name: editingInquiry.name,
          email: editingInquiry.email || "",
          phone: editingInquiry.phone,
          whatsapp: editingInquiry.whatsapp || editingInquiry.phone,
          requestType: editingInquiry.requestType || "General Service",
          message: editingInquiry.message || "",
          status: editingInquiry.status || "new",
        });
        setActionMessage({ type: "success", text: "Inquiry / Work Order recorded" });
      } else if (editingInquiry.id) {
        await firestoreService.adminUpdateInquiry(editingInquiry.id, {
          name: editingInquiry.name,
          email: editingInquiry.email,
          phone: editingInquiry.phone,
          subject: editingInquiry.requestType,
          message: editingInquiry.message,
          status: editingInquiry.status,
        });
        setActionMessage({ type: "success", text: "Inquiry status updated" });
      }
      setEditingInquiry(null);
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving inquiry";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ================= USER CRUD & WALLET HANDLERS ================= */
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.name || !editingUser?.email) {
      setActionMessage({ type: "error", text: "Name and email are required" });
      return;
    }

    setLoading(true);
    try {
      if (isNewUser) {
        await firestoreService.adminCreateUser({
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone || "",
          role: editingUser.role || "customer",
          walletBalance: Number(editingUser.wallet) || 0,
        });
        setActionMessage({ type: "success", text: "User profile provisioned in Firestore" });
      } else if (editingUser._id || editingUser.id) {
        const uid = (editingUser._id || editingUser.id) as string;
        await firestoreService.adminUpdateUser(uid, {
          name: editingUser.name,
          phone: editingUser.phone,
          role: editingUser.role,
          wallet: Number(editingUser.wallet),
        });
        setActionMessage({ type: "success", text: "User profile updated successfully" });
      }
      setEditingUser(null);
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating user";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModalUser) return;
    setLoading(true);
    try {
      const delta = walletAction === "credit" ? Math.abs(walletAmount) : -Math.abs(walletAmount);
      const newBal = await firestoreService.adminAdjustUserWallet(
        walletModalUser._id || (walletModalUser.id as string),
        delta,
        walletReason
      );
      setActionMessage({
        type: "success",
        text: `Wallet adjusted! New balance for ${walletModalUser.name}: ₦${newBal.toLocaleString()}`,
      });
      setWalletModalUser(null);
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to adjust wallet";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE EXECUTION ================= */
  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    setActionMessage(null);
    try {
      switch (deleteConfirm.entity) {
        case "service":
          await firestoreService.deleteService(deleteConfirm.id);
          break;
        case "registration":
          await firestoreService.adminDeleteRegistration(deleteConfirm.id);
          break;
        case "transaction":
          await firestoreService.adminDeleteTransaction(deleteConfirm.id);
          break;
        case "vtu":
          await firestoreService.adminDeleteVtuOrder(deleteConfirm.id);
          break;
        case "inquiry":
          await firestoreService.adminDeleteInquiry(deleteConfirm.id);
          break;
        case "user":
          await firestoreService.adminDeleteUser(deleteConfirm.id);
          break;
        default:
          break;
      }
      setActionMessage({
        type: "success",
        text: `Deleted ${deleteConfirm.entity} record successfully`,
      });
      setDeleteConfirm(null);
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete operation failed";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-7xl max-h-[92vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* TOP HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Master Operations &amp; Cloud Control Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400 text-slate-950">
                  ADMIN CRUD
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Database: ai-studio-hambaktechservic</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Active Admin: {user?.email || "fatimohmusbau34@gmail.com"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDeploySync}
              disabled={loading}
              title="Deploy changes &amp; re-sync master catalog to Firestore"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-sm shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Deploy &amp; Sync Lifeline</span>
            </button>

            <button
              onClick={loadAllData}
              disabled={loading}
              title="Refresh all records"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {actionMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between ${
              actionMessage.type === "success"
                ? "bg-emerald-950/70 text-emerald-300 border-b border-emerald-800/50"
                : "bg-rose-950/70 text-rose-300 border-b border-rose-800/50"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-slate-800 bg-slate-900/50 px-6">
          <button
            onClick={() => {
              setActiveTab("overview");
              setSearchQuery("");
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "overview"
                ? "border-amber-400 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Overview &amp; KPIs</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("services");
              setSearchQuery("");
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "services"
                ? "border-amber-400 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Services Catalog ({services.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("registrations");
              setSearchQuery("");
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "registrations"
                ? "border-amber-400 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Registrations ({registrations.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("transactions");
              setSearchQuery("");
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "transactions"
                ? "border-amber-400 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>Transactions ({transactions.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("vtu");
              setSearchQuery("");
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "vtu"
                ? "border-amber-400 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>VTU Orders ({vtuOrders.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("inquiries");
              setSearchQuery("");
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "inquiries"
                ? "border-amber-400 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Inquiries ({inquiries.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("users");
              setSearchQuery("");
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "users"
                ? "border-amber-400 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Users &amp; Wallets ({usersList.length})</span>
          </button>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ================= TAB: OVERVIEW ================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Successful Revenue</span>
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black text-white">
                    ₦{metrics.totalVolume.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    {metrics.totalTransactions} recorded transactions
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Platform Wallet Vault</span>
                    <Wallet className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-xl font-black text-amber-400">
                    ₦{metrics.totalWalletHeld.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Held by {metrics.totalUsers} registered users
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Pending Applications</span>
                    <Clock className="h-4 w-4 text-sky-400" />
                  </div>
                  <div className="text-xl font-black text-white">
                    {metrics.pendingRegistrations}
                  </div>
                  <div className="text-[11px] text-sky-400 mt-1">
                    WAEC, JAMB, NECO, NIN
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>New Inquiries</span>
                    <Mail className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="text-xl font-black text-white">
                    {metrics.newInquiriesCount}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Awaiting staff response
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS ROW */}
              <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-amber-400" />
                  Quick Actions &amp; Direct Operations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <button
                    onClick={() => {
                      setIsNewService(true);
                      setEditingService({
                        title: "",
                        category: "Educational Registration",
                        price: 5000,
                        status: "active",
                        description: "",
                      });
                      setActiveTab("services");
                    }}
                    className="p-3 bg-slate-900 border border-slate-700/80 hover:border-amber-400/50 rounded-xl text-left transition-all hover:bg-slate-800/60"
                  >
                    <Plus className="h-4 w-4 text-amber-400 mb-1" />
                    <div className="text-xs font-bold text-white">New Service</div>
                    <div className="text-[11px] text-slate-400">Add to public catalog</div>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewReg(true);
                      setEditingReg({
                        applicantName: "",
                        phone: "",
                        email: "",
                        regType: "waec",
                        fee: 25000,
                        paymentStatus: "paid",
                        status: "pending",
                      });
                      setActiveTab("registrations");
                    }}
                    className="p-3 bg-slate-900 border border-slate-700/80 hover:border-amber-400/50 rounded-xl text-left transition-all hover:bg-slate-800/60"
                  >
                    <Plus className="h-4 w-4 text-sky-400 mb-1" />
                    <div className="text-xs font-bold text-white">Log Registration</div>
                    <div className="text-[11px] text-slate-400">Walk-in candidate</div>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewTx(true);
                      setEditingTx({
                        customerName: "",
                        customerPhone: "",
                        amount: 1000,
                        type: "service_payment",
                        paymentMethod: "pos",
                        status: "successful",
                        description: "Walk-in service payment",
                      });
                      setActiveTab("transactions");
                    }}
                    className="p-3 bg-slate-900 border border-slate-700/80 hover:border-amber-400/50 rounded-xl text-left transition-all hover:bg-slate-800/60"
                  >
                    <Plus className="h-4 w-4 text-emerald-400 mb-1" />
                    <div className="text-xs font-bold text-white">Record Payment</div>
                    <div className="text-[11px] text-slate-400">Issue verified receipt</div>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewVtu(true);
                      setEditingVtu({
                        serviceType: "airtime",
                        network: "MTN",
                        amount: 1000,
                        phoneNumber: "",
                        status: "successful",
                      });
                      setActiveTab("vtu");
                    }}
                    className="p-3 bg-slate-900 border border-slate-700/80 hover:border-amber-400/50 rounded-xl text-left transition-all hover:bg-slate-800/60"
                  >
                    <Plus className="h-4 w-4 text-purple-400 mb-1" />
                    <div className="text-xs font-bold text-white">Log VTU Order</div>
                    <div className="text-[11px] text-slate-400">Recharge manual record</div>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewUser(true);
                      setEditingUser({
                        name: "",
                        email: "",
                        phone: "",
                        role: "customer",
                        wallet: 0,
                      });
                      setActiveTab("users");
                    }}
                    className="p-3 bg-slate-900 border border-slate-700/80 hover:border-amber-400/50 rounded-xl text-left transition-all hover:bg-slate-800/60"
                  >
                    <Plus className="h-4 w-4 text-pink-400 mb-1" />
                    <div className="text-xs font-bold text-white">New User Account</div>
                    <div className="text-[11px] text-slate-400">Provision profile</div>
                  </button>
                </div>
              </div>

              {/* RECENT ACTIVITY SNAPSHOT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Recent Registrations
                    </h4>
                    <button
                      onClick={() => setActiveTab("registrations")}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                    >
                      View All <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {registrations.slice(0, 5).map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{r.applicantName}</div>
                          <div className="text-slate-400 text-[11px]">
                            {r.regType.toUpperCase()} • {r.trackingId}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : r.status === "approved"
                              ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                    {registrations.length === 0 && (
                      <div className="text-xs text-slate-500 py-4 text-center">
                        No registrations logged yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Recent Transactions
                    </h4>
                    <button
                      onClick={() => setActiveTab("transactions")}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                    >
                      View All <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">
                            {t.customerName || "Customer"}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {t.description || t.type} • {t.paymentMethod}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400">
                            ₦{(t.amount || 0).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">{t.status}</div>
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <div className="text-xs text-slate-500 py-4 text-center">
                        No transactions logged yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: SERVICES CATALOG CRUD ================= */}
          {activeTab === "services" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search services by title, category, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsNewService(true);
                      setEditingService({
                        title: "",
                        category: "Educational Registration",
                        price: 5000,
                        status: "active",
                        description: "",
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Service</span>
                  </button>
                  <button
                    onClick={handleDeploySync}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                  >
                    Re-Seed Catalog
                  </button>
                </div>
              </div>

              {/* SERVICES TABLE */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Title &amp; Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {services
                      .filter((s) => {
                        const q = searchQuery.toLowerCase();
                        return (
                          !q ||
                          (s.title || s.name || "").toLowerCase().includes(q) ||
                          (s.category || "").toLowerCase().includes(q) ||
                          (s.description || "").toLowerCase().includes(q)
                        );
                      })
                      .map((srv) => {
                        const srvId = (srv._id || srv.id) as string;
                        return (
                          <tr key={srvId} className="hover:bg-slate-900/40">
                            <td className="p-3">
                              <div className="font-bold text-white">
                                {srv.title || srv.name}
                              </div>
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-400 mt-0.5">
                                {srv.category}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-emerald-400">
                              ₦{(srv.price || 0).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  srv.status === "active" || srv.available !== false
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                }`}
                              >
                                {srv.status || "active"}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400 max-w-xs truncate">
                              {srv.description || "No description provided."}
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setIsNewService(false);
                                    setEditingService(srv);
                                  }}
                                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-400"
                                  title="Edit Service"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      entity: "service",
                                      id: srvId,
                                      name: srv.title || srv.name || "Service",
                                    })
                                  }
                                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-rose-400"
                                  title="Delete Service"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB: REGISTRATIONS CRUD ================= */}
          {activeTab === "registrations" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Tracking ID, applicant name, phone, type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={() => {
                    setIsNewReg(true);
                    setEditingReg({
                      applicantName: "",
                      phone: "",
                      email: "",
                      regType: "waec",
                      fee: 25000,
                      paymentStatus: "paid",
                      status: "pending",
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Registration</span>
                </button>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Tracking &amp; Exam</th>
                      <th className="p-3">Applicant Contact</th>
                      <th className="p-3">Fee / Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Details / Notes</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {registrations
                      .filter((r) => {
                        const q = searchQuery.toLowerCase();
                        return (
                          !q ||
                          r.trackingId.toLowerCase().includes(q) ||
                          r.applicantName.toLowerCase().includes(q) ||
                          r.phone.includes(q) ||
                          r.regType.toLowerCase().includes(q) ||
                          (r.institution && r.institution.toLowerCase().includes(q))
                        );
                      })
                      .map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-900/40">
                          <td className="p-3">
                            <span className="font-mono font-bold text-amber-400">
                              {reg.trackingId}
                            </span>
                            <div className="text-[11px] text-slate-300 font-semibold uppercase">
                              {reg.regType}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white">{reg.applicantName}</div>
                            <div className="text-slate-400 text-[11px] flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {reg.phone}
                            </div>
                            {reg.email && (
                              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {reg.email}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white">
                              ₦{(reg.fee || 0).toLocaleString()}
                            </div>
                            <span
                              className={`text-[10px] font-bold ${
                                reg.paymentStatus === "paid"
                                  ? "text-emerald-400"
                                  : reg.paymentStatus === "waived"
                                  ? "text-sky-400"
                                  : "text-amber-400"
                              }`}
                            >
                              {reg.paymentStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                reg.status === "completed"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : reg.status === "approved"
                                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                  : reg.status === "processing"
                                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {reg.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 max-w-xs truncate">
                            {reg.details || reg.institution || "Standard registration"}
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {onShowReceipt && (
                                <button
                                  onClick={() =>
                                    onShowReceipt({
                                      receiptNumber: reg.trackingId,
                                      customerName: reg.applicantName,
                                      customerPhone: reg.phone,
                                      customerEmail: reg.email,
                                      serviceType: `${reg.regType.toUpperCase()} Registration`,
                                      items: [
                                        {
                                          description: `${reg.regType.toUpperCase()} Official Exam Processing`,
                                          qty: 1,
                                          price: reg.fee,
                                        },
                                      ],
                                      total: reg.fee,
                                      paymentMethod: "Official Portal",
                                      status: "Verified",
                                      date: new Date(reg.createdAt).toLocaleDateString(),
                                      qrData: `HTS-VERIFIED-${reg.trackingId}`,
                                    })
                                  }
                                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-emerald-400"
                                  title="View Receipt"
                                >
                                  <Receipt className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setIsNewReg(false);
                                  setEditingReg(reg);
                                }}
                                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-400"
                                title="Edit Registration"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    entity: "registration",
                                    id: reg.id,
                                    name: `${reg.trackingId} (${reg.applicantName})`,
                                  })
                                }
                                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-rose-400"
                                title="Delete Registration"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB: TRANSACTIONS CRUD ================= */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by reference, customer, description, method..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={() => {
                    setIsNewTx(true);
                    setEditingTx({
                      customerName: "",
                      customerPhone: "",
                      amount: 1000,
                      type: "service_payment",
                      paymentMethod: "pos",
                      status: "successful",
                      description: "Custom walk-in invoice",
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Record Transaction</span>
                </button>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Reference &amp; Date</th>
                      <th className="p-3">Customer Details</th>
                      <th className="p-3">Type &amp; Method</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {transactions
                      .filter((t) => {
                        const q = searchQuery.toLowerCase();
                        return (
                          !q ||
                          t.reference.toLowerCase().includes(q) ||
                          (t.customerName || "").toLowerCase().includes(q) ||
                          (t.description || "").toLowerCase().includes(q) ||
                          t.paymentMethod.toLowerCase().includes(q)
                        );
                      })
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-900/40">
                          <td className="p-3">
                            <span className="font-mono font-bold text-amber-400">
                              {tx.reference}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {new Date(tx.createdAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white">
                              {tx.customerName || "Walk-in Client"}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {tx.customerPhone || tx.customerEmail || "No phone logged"}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-200 uppercase">
                              {tx.type.replace("_", " ")}
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase">
                              {tx.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-emerald-400 text-sm">
                            ₦{(tx.amount || 0).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tx.status === "successful"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : tx.status === "pending"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {onShowReceipt && (
                                <button
                                  onClick={() =>
                                    onShowReceipt({
                                      receiptNumber: tx.receiptNumber || tx.reference,
                                      customerName: tx.customerName || "Customer",
                                      customerPhone: tx.customerPhone || "N/A",
                                      customerEmail: tx.customerEmail || "N/A",
                                      serviceType: tx.type,
                                      items: [
                                        {
                                          description: tx.description || "Service Processing",
                                          qty: 1,
                                          price: tx.amount,
                                        },
                                      ],
                                      total: tx.amount,
                                      paymentMethod: tx.paymentMethod,
                                      status: tx.status === "successful" ? "Successful" : "Pending",
                                      date: new Date(tx.createdAt).toLocaleDateString(),
                                      qrData: `HTS-TX-${tx.reference}`,
                                    })
                                  }
                                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-emerald-400"
                                  title="Print Receipt"
                                >
                                  <Receipt className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setIsNewTx(false);
                                  setEditingTx(tx);
                                }}
                                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-400"
                                title="Edit Transaction"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    entity: "transaction",
                                    id: tx.id,
                                    name: `${tx.reference} (₦${tx.amount.toLocaleString()})`,
                                  })
                                }
                                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-rose-400"
                                title="Delete Transaction"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB: VTU ORDERS CRUD ================= */}
          {activeTab === "vtu" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by reference, phone number, network..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={() => {
                    setIsNewVtu(true);
                    setEditingVtu({
                      serviceType: "airtime",
                      network: "MTN",
                      amount: 1000,
                      phoneNumber: "",
                      status: "successful",
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log VTU Order</span>
                </button>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Reference &amp; Date</th>
                      <th className="p-3">Service &amp; Network</th>
                      <th className="p-3">Destination Account</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {vtuOrders
                      .filter((v) => {
                        const q = searchQuery.toLowerCase();
                        return (
                          !q ||
                          v.reference.toLowerCase().includes(q) ||
                          (v.phoneNumber || "").includes(q) ||
                          (v.network || "").toLowerCase().includes(q) ||
                          v.serviceType.toLowerCase().includes(q)
                        );
                      })
                      .map((vtu) => (
                        <tr key={vtu.id} className="hover:bg-slate-900/40">
                          <td className="p-3">
                            <span className="font-mono font-bold text-amber-400">
                              {vtu.reference}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {new Date(vtu.createdAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white uppercase">
                              {vtu.serviceType}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {vtu.network || "Utility"} {vtu.plan ? `• ${vtu.plan}` : ""}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-300">
                            {vtu.phoneNumber || vtu.meterOrCardNumber || "Direct Top-up"}
                          </td>
                          <td className="p-3 font-bold text-emerald-400">
                            ₦{(vtu.amount || 0).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                vtu.status === "successful"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : vtu.status === "pending"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {vtu.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setIsNewVtu(false);
                                  setEditingVtu(vtu);
                                }}
                                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-400"
                                title="Edit VTU Order"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    entity: "vtu",
                                    id: vtu.id,
                                    name: `${vtu.reference} (${vtu.serviceType})`,
                                  })
                                }
                                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-rose-400"
                                title="Delete VTU Order"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB: INQUIRIES & WORK ORDERS CRUD ================= */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by client name, email, phone, message content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={() => {
                    setIsNewInquiry(true);
                    setEditingInquiry({
                      name: "",
                      email: "",
                      phone: "",
                      requestType: "Work Order",
                      message: "",
                      status: "new",
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Work Order / Inquiry</span>
                </button>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Client Contact</th>
                      <th className="p-3">Subject / Request</th>
                      <th className="p-3">Message / Requirements</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Logged Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {inquiries
                      .filter((i) => {
                        const q = searchQuery.toLowerCase();
                        return (
                          !q ||
                          i.name.toLowerCase().includes(q) ||
                          i.email.toLowerCase().includes(q) ||
                          i.phone.includes(q) ||
                          i.requestType.toLowerCase().includes(q) ||
                          i.message.toLowerCase().includes(q)
                        );
                      })
                      .map((inq) => (
                        <tr key={inq.id} className="hover:bg-slate-900/40">
                          <td className="p-3">
                            <div className="font-bold text-white">{inq.name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {inq.phone}
                            </div>
                            {inq.email && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {inq.email}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-amber-400">
                            {inq.requestType}
                          </td>
                          <td className="p-3 text-slate-300 max-w-sm">
                            {inq.message}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                inq.status === "resolved"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : inq.status === "reviewed"
                                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {inq.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 text-[11px]">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setIsNewInquiry(false);
                                  setEditingInquiry(inq);
                                }}
                                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-400"
                                title="Edit Inquiry"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    entity: "inquiry",
                                    id: inq.id,
                                    name: `${inq.name} (${inq.requestType})`,
                                  })
                                }
                                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-rose-400"
                                title="Delete Inquiry"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB: USERS & WALLETS CRUD ================= */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, phone, role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={() => {
                    setIsNewUser(true);
                    setEditingUser({
                      name: "",
                      email: "",
                      phone: "",
                      role: "customer",
                      wallet: 0,
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add User Account</span>
                </button>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">User Profile</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Wallet Balance</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usersList
                      .filter((u) => {
                        const q = searchQuery.toLowerCase();
                        return (
                          !q ||
                          u.name.toLowerCase().includes(q) ||
                          u.email.toLowerCase().includes(q) ||
                          (u.phone || "").includes(q) ||
                          u.role.toLowerCase().includes(q)
                        );
                      })
                      .map((u) => {
                        const uid = (u._id || u.id) as string;
                        return (
                          <tr key={uid} className="hover:bg-slate-900/40">
                            <td className="p-3">
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{u.name}</span>
                                {u.email === "fatimohmusbau34@gmail.com" && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-400 text-slate-950 font-black">
                                    PRIMARY ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{u.email}</div>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  u.role === "admin"
                                    ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                                    : u.role === "student"
                                    ? "bg-purple-400/20 text-purple-400 border border-purple-400/30"
                                    : "bg-slate-800 text-slate-300"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-amber-400 text-sm">
                              ₦{(u.wallet || 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-slate-400 text-[11px]">
                              {u.phone || "No phone logged"}
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setWalletModalUser(u);
                                    setWalletAmount(5000);
                                    setWalletAction("credit");
                                    setWalletReason("Administrative deposit credit");
                                  }}
                                  className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center gap-1"
                                  title="Credit or Debit User Wallet"
                                >
                                  <Wallet className="h-3 w-3" />
                                  <span>Adjust Wallet</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setIsNewUser(false);
                                    setEditingUser(u);
                                  }}
                                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-400"
                                  title="Edit User"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      entity: "user",
                                      id: uid,
                                      name: `${u.name} (${u.email})`,
                                    })
                                  }
                                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-rose-400"
                                  title="Delete User"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: EDIT SERVICE ================= */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-400" />
                {isNewService ? "Create New Service Offering" : "Edit Service Details"}
              </h3>
              <button
                onClick={() => setEditingService(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={editingService.title || editingService.name || ""}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      title: e.target.value,
                      name: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="e.g., WAEC e-PIN & Biometric Registration"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={editingService.category || "Educational Registration"}
                    onChange={(e) =>
                      setEditingService({ ...editingService, category: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Educational Registration">Educational Registration</option>
                    <option value="Government & Identity">Government &amp; Identity</option>
                    <option value="Digital & Computer Training">Digital &amp; Computer Training</option>
                    <option value="Printing & Secretarial">Printing &amp; Secretarial</option>
                    <option value="VTU & Utility Services">VTU &amp; Utility Services</option>
                    <option value="Hardware & Tech Support">Hardware &amp; Tech Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Starting Price (₦)</label>
                  <input
                    type="number"
                    value={editingService.price || 0}
                    onChange={(e) =>
                      setEditingService({ ...editingService, price: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={editingService.status || "active"}
                  onChange={(e) =>
                    setEditingService({ ...editingService, status: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="active">Active &amp; Visible</option>
                  <option value="inactive">Inactive / Hidden</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description &amp; Highlights</label>
                <textarea
                  rows={3}
                  value={editingService.description || ""}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="Official center processing with instant verification..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
                >
                  {loading ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT REGISTRATION ================= */}
      {editingReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                {isNewReg ? "Log Walk-in Registration" : "Update Registration Record"}
              </h3>
              <button
                onClick={() => setEditingReg(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRegistration} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Applicant Name</label>
                  <input
                    type="text"
                    required
                    value={editingReg.applicantName || ""}
                    onChange={(e) =>
                      setEditingReg({ ...editingReg, applicantName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editingReg.phone || ""}
                    onChange={(e) => setEditingReg({ ...editingReg, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Registration Type</label>
                  <select
                    value={editingReg.regType || "waec"}
                    onChange={(e) =>
                      setEditingReg({
                        ...editingReg,
                        regType: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="waec">WAEC May/June / GCE</option>
                    <option value="jamb">JAMB UTME / DE / CAPS</option>
                    <option value="neco">NECO SSCE / External</option>
                    <option value="nysc">NYSC Mobilization / Green Card</option>
                    <option value="nin">NIN Enrollment / Modification</option>
                    <option value="other">Other Portal Registration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fee (₦)</label>
                  <input
                    type="number"
                    value={editingReg.fee || 0}
                    onChange={(e) =>
                      setEditingReg({ ...editingReg, fee: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Processing Status</label>
                  <select
                    value={editingReg.status || "pending"}
                    onChange={(e) =>
                      setEditingReg({ ...editingReg, status: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed &amp; Slip Issued</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Status</label>
                  <select
                    value={editingReg.paymentStatus || "paid"}
                    onChange={(e) =>
                      setEditingReg({ ...editingReg, paymentStatus: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="paid">Paid &amp; Cleared</option>
                    <option value="pending">Pending Payment</option>
                    <option value="waived">Waived / Center Scholarship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes / Additional Specs</label>
                <textarea
                  rows={2}
                  value={editingReg.details || ""}
                  onChange={(e) => setEditingReg({ ...editingReg, details: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Subject combination, exam year, or NIN modifications needed..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingReg(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
                >
                  {loading ? "Saving..." : "Save Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT TRANSACTION ================= */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                {isNewTx ? "Record Walk-in Transaction" : "Update Transaction Entry"}
              </h3>
              <button
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={editingTx.customerName || ""}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, customerName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={editingTx.customerPhone || ""}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, customerPhone: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    required
                    value={editingTx.amount || 0}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, amount: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                  <select
                    value={editingTx.paymentMethod || "pos"}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, paymentMethod: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="pos">POS Terminal</option>
                    <option value="cash">Cash Payment</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="wallet">Portal Wallet Debit</option>
                    <option value="card">Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Transaction Type</label>
                  <select
                    value={editingTx.type || "service_payment"}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, type: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="service_payment">Service Payment</option>
                    <option value="deposit">Deposit</option>
                    <option value="wallet_funding">Wallet Funding</option>
                    <option value="registration">Registration Fee</option>
                    <option value="vtu">VTU / Utility</option>
                    <option value="pos">POS Cash Out</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editingTx.status || "successful"}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, status: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="successful">Successful</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={editingTx.description || ""}
                  onChange={(e) =>
                    setEditingTx({ ...editingTx, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Printing, scanning, plastic ID card lamination..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
                >
                  {loading ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT VTU ================= */}
      {editingVtu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-400" />
                {isNewVtu ? "Log VTU Recharge" : "Update VTU Order"}
              </h3>
              <button
                onClick={() => setEditingVtu(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVtu} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Service Type</label>
                  <select
                    value={editingVtu.serviceType || "airtime"}
                    onChange={(e) =>
                      setEditingVtu({ ...editingVtu, serviceType: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="airtime">Airtime</option>
                    <option value="data">Data Bundle</option>
                    <option value="electricity">Electricity Token</option>
                    <option value="cable">Cable TV (DSTV / GOTV)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Network / Provider</label>
                  <input
                    type="text"
                    value={editingVtu.network || ""}
                    onChange={(e) =>
                      setEditingVtu({ ...editingVtu, network: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    placeholder="MTN, Airtel, Glo, IBEDC..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Destination Phone / Meter</label>
                  <input
                    type="text"
                    value={editingVtu.phoneNumber || editingVtu.meterOrCardNumber || ""}
                    onChange={(e) =>
                      setEditingVtu({ ...editingVtu, phoneNumber: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    value={editingVtu.amount || 0}
                    onChange={(e) =>
                      setEditingVtu({ ...editingVtu, amount: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={editingVtu.status || "successful"}
                  onChange={(e) =>
                    setEditingVtu({ ...editingVtu, status: e.target.value as any })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="successful">Successful</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVtu(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
                >
                  {loading ? "Saving..." : "Save VTU Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT INQUIRY ================= */}
      {editingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-400" />
                {isNewInquiry ? "Log Client Work Order" : "Update Inquiry Status"}
              </h3>
              <button
                onClick={() => setEditingInquiry(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInquiry} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={editingInquiry.name || ""}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, name: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={editingInquiry.phone || ""}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, phone: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Request Subject</label>
                  <input
                    type="text"
                    value={editingInquiry.requestType || ""}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, requestType: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editingInquiry.status || "new"}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, status: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed &amp; In Progress</option>
                    <option value="resolved">Resolved &amp; Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message / Requirements</label>
                <textarea
                  rows={3}
                  value={editingInquiry.message || ""}
                  onChange={(e) =>
                    setEditingInquiry({ ...editingInquiry, message: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingInquiry(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
                >
                  {loading ? "Saving..." : "Save Inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER ================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-400" />
                {isNewUser ? "Provision New User Profile" : "Edit User Account"}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email || ""}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingUser.phone || ""}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, phone: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role / Account Tier</label>
                  <select
                    value={editingUser.role || "customer"}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="customer">Customer / Business</option>
                    <option value="student">Student / Academy</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Wallet Balance (₦)</label>
                  <input
                    type="number"
                    value={editingUser.wallet || 0}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, wallet: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
                >
                  {loading ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADJUST WALLET ================= */}
      {walletModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="h-4 w-4 text-amber-400" />
                Adjust Wallet: {walletModalUser.name}
              </h3>
              <button
                onClick={() => setWalletModalUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustWallet} className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Current Balance:</span>
                <span className="font-bold text-amber-400 text-sm">
                  ₦{(walletModalUser.wallet || 0).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWalletAction("credit")}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    walletAction === "credit"
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  + Credit Account
                </button>
                <button
                  type="button"
                  onClick={() => setWalletAction("debit")}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    walletAction === "debit"
                      ? "bg-rose-500 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  - Debit Account
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Adjustment Amount (₦)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reason / Reference Note
                </label>
                <input
                  type="text"
                  required
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setWalletModalUser(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-bold ${
                    walletAction === "credit"
                      ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                      : "bg-rose-500 text-white hover:bg-rose-400"
                  }`}
                >
                  {loading ? "Processing..." : `Apply ${walletAction.toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">Confirm Permanent Deletion</h3>
                <p className="text-slate-400 text-[11px]">
                  This action cannot be reversed in the cloud database.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
              Are you sure you want to permanently delete:
              <div className="font-bold text-white mt-1 break-all">
                {deleteConfirm.name}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-500"
              >
                {loading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
