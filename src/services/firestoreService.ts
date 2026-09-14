import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  User,
  TransactionRecord,
  RegistrationRecord,
  VtuOrderRecord,
  ContactInquiry,
  Service,
} from "../types";
import { fallbackServices } from "../data/servicesData";

export const firestoreService = {
  /* ================= USERS & WALLET ================= */
  async getOrCreateUserProfile(authUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
  }): Promise<User> {
    const userDocRef = doc(db, "users", authUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          _id: authUser.uid,
          id: authUser.uid,
          name: data.name || authUser.displayName || "Client",
          email: data.email || authUser.email || "",
          phone: data.phone || authUser.phoneNumber || "",
          role: data.role || (authUser.email === "fatimohmusbau34@gmail.com" ? "admin" : "customer"),
          wallet: data.walletBalance ?? data.wallet ?? 0,
          avatar: data.avatar || authUser.photoURL || "",
          isVerified: true,
          createdAt: data.createdAt,
        };
      }

      const newUser = {
        uid: authUser.uid,
        name: authUser.displayName || authUser.email?.split("@")[0] || "Valued Client",
        email: authUser.email || "",
        phone: authUser.phoneNumber || "",
        role: authUser.email === "fatimohmusbau34@gmail.com" ? "admin" : "customer",
        walletBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, newUser);

      return {
        _id: authUser.uid,
        id: authUser.uid,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role as "customer" | "student" | "admin",
        wallet: 0,
        isVerified: true,
        createdAt: newUser.createdAt,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${authUser.uid}`);
    }
  },

  async updateUserWallet(uid: string, deltaAmount: number): Promise<number> {
    const userDocRef = doc(db, "users", uid);
    try {
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        throw new Error("User record not found");
      }
      const currentBalance = snap.data().walletBalance ?? snap.data().wallet ?? 0;
      const newBalance = Math.max(0, currentBalance + deltaAmount);
      await updateDoc(userDocRef, {
        walletBalance: newBalance,
        updatedAt: new Date().toISOString(),
      });
      return newBalance;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  /* ================= TRANSACTIONS & PAYMENTS ================= */
  async createTransaction(tx: Omit<TransactionRecord, "id" | "createdAt">): Promise<TransactionRecord> {
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const txDocRef = doc(db, "transactions", txId);
    const newTx: TransactionRecord = {
      ...tx,
      id: txId,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(txDocRef, newTx);
      return newTx;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `transactions/${txId}`);
    }
  },

  async getUserTransactions(userId: string): Promise<TransactionRecord[]> {
    try {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        limit(50)
      );
      const snap = await getDocs(q);
      const list: TransactionRecord[] = [];
      snap.forEach((d) => {
        list.push(d.data() as TransactionRecord);
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "transactions");
    }
  },

  /* ================= ONLINE REGISTRATIONS ================= */
  async submitRegistration(data: {
    applicantName: string;
    email: string;
    phone: string;
    regType: "waec" | "jamb" | "neco" | "nysc" | "nin" | "other";
    institution?: string;
    matricNumber?: string;
    examYear?: string;
    preferredCourse?: string;
    details?: string;
    fee: number;
    paymentStatus: "pending" | "paid" | "waived";
    userId?: string;
  }): Promise<RegistrationRecord> {
    const regId = `reg_${Date.now()}`;
    const trackingId = `HTS-REG-${Date.now().toString().slice(-6)}`;
    const regDocRef = doc(db, "registrations", regId);

    const record: RegistrationRecord = {
      id: regId,
      trackingId,
      applicantName: data.applicantName,
      email: data.email,
      phone: data.phone,
      regType: data.regType,
      institution: data.institution || "",
      matricNumber: data.matricNumber || "",
      examYear: data.examYear || "",
      preferredCourse: data.preferredCourse || "",
      details: data.details || "",
      fee: data.fee,
      paymentStatus: data.paymentStatus,
      status: "pending",
      userId: data.userId || "",
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(regDocRef, record);
      return record;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `registrations/${regId}`);
    }
  },

  async getRegistrationByTracking(trackingId: string): Promise<RegistrationRecord | null> {
    try {
      const q = query(
        collection(db, "registrations"),
        where("trackingId", "==", trackingId.trim().toUpperCase()),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as RegistrationRecord;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "registrations");
    }
  },

  /* ================= VTU & UTILITIES ================= */
  async submitVtuOrder(data: {
    userId?: string;
    serviceType: "airtime" | "data" | "electricity" | "cable";
    network?: string;
    phoneNumber?: string;
    plan?: string;
    meterOrCardNumber?: string;
    amount: number;
  }): Promise<VtuOrderRecord> {
    const orderId = `vtu_${Date.now()}`;
    const reference = `HTS-VTU-${Date.now().toString().slice(-8)}`;
    const docRef = doc(db, "vtu_orders", orderId);

    const record: VtuOrderRecord = {
      id: orderId,
      reference,
      userId: data.userId || "",
      serviceType: data.serviceType,
      network: data.network || "",
      phoneNumber: data.phoneNumber || "",
      plan: data.plan || "",
      meterOrCardNumber: data.meterOrCardNumber || "",
      amount: data.amount,
      status: "successful",
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(docRef, record);
      return record;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `vtu_orders/${orderId}`);
    }
  },

  /* ================= INQUIRIES & DISPATCH ================= */
  async submitInquiry(inquiry: ContactInquiry): Promise<void> {
    const inquiryId = `inq_${Date.now()}`;
    const docRef = doc(db, "inquiries", inquiryId);
    try {
      await setDoc(docRef, {
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone || inquiry.whatsapp || "",
        subject: inquiry.requestType || "General Service Inquiry",
        message: inquiry.message || inquiry.requirements || "",
        status: "new",
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `inquiries/${inquiryId}`);
    }
  },

  /* ================= SERVICES ================= */
  async getServices(): Promise<Service[]> {
    try {
      const snap = await getDocs(collection(db, "services"));
      if (!snap.empty) {
        const list: Service[] = [];
        snap.forEach((d) => list.push({ _id: d.id, ...d.data() } as Service));
        return list;
      }
      return fallbackServices;
    } catch {
      return fallbackServices;
    }
  },
};
