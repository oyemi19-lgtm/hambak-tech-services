import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
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
  async getOrCreateUserProfile(
    authUser: {
      uid: string;
      email: string | null;
      displayName: string | null;
      photoURL?: string | null;
      phoneNumber?: string | null;
    },
    extra?: {
      name?: string;
      phone?: string;
      role?: "customer" | "student" | "admin";
    }
  ): Promise<User> {
    const userDocRef = doc(db, "users", authUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        // If extra fields are provided and missing in doc, update them
        if (extra && (extra.phone || extra.role)) {
          const updatePayload: Record<string, any> = {
            updatedAt: new Date().toISOString(),
          };
          if (extra.phone && !data.phone) updatePayload.phone = extra.phone;
          if (extra.role && !data.role) updatePayload.role = extra.role;
          if (Object.keys(updatePayload).length > 1) {
            await updateDoc(userDocRef, updatePayload);
          }
        }

        return {
          _id: authUser.uid,
          id: authUser.uid,
          name: data.name || extra?.name || authUser.displayName || "Client",
          email: data.email || authUser.email || "",
          phone: data.phone || extra?.phone || authUser.phoneNumber || "",
          role: data.role || (authUser.email === "fatimohmusbau34@gmail.com" ? "admin" : (extra?.role || "customer")),
          wallet: data.walletBalance ?? data.wallet ?? 0,
          avatar: data.avatar || authUser.photoURL || "",
          isVerified: true,
          createdAt: data.createdAt,
        };
      }

      const newUser = {
        uid: authUser.uid,
        name: extra?.name || authUser.displayName || authUser.email?.split("@")[0] || "Valued Client",
        email: authUser.email || "",
        phone: extra?.phone || authUser.phoneNumber || "",
        role: authUser.email === "fatimohmusbau34@gmail.com" ? "admin" : (extra?.role || "customer"),
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

  subscribeUserProfile(uid: string, callback: (user: User) => void): () => void {
    const userDocRef = doc(db, "users", uid);
    return onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          callback({
            _id: uid,
            id: uid,
            name: data.name || "Client",
            email: data.email || "",
            phone: data.phone || "",
            role: data.role || (data.email === "fatimohmusbau34@gmail.com" ? "admin" : "customer"),
            wallet: data.walletBalance ?? data.wallet ?? 0,
            avatar: data.avatar || "",
            isVerified: true,
            createdAt: data.createdAt,
          });
        }
      },
      (error) => {
        console.warn("User profile snapshot listener warning:", error.message);
      }
    );
  },

  async updateUserProfile(
    uid: string,
    updates: {
      name?: string;
      phone?: string;
      role?: "customer" | "student" | "admin";
      avatar?: string;
    }
  ): Promise<void> {
    const userDocRef = doc(db, "users", uid);
    try {
      const payload: Record<string, any> = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(userDocRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
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

  async getAllInquiries(): Promise<Array<ContactInquiry & { id: string; status: string; createdAt: string }>> {
    try {
      const snap = await getDocs(collection(db, "inquiries"));
      const list: Array<ContactInquiry & { id: string; status: string; createdAt: string }> = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || data.phone || "",
          requestType: data.subject || data.requestType || "General Service",
          message: data.message || "",
          requirements: data.requirements || "",
          status: data.status || "new",
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "inquiries");
    }
  },

  async adminCreateInquiry(data: Partial<ContactInquiry> & { status?: string }): Promise<string> {
    const inquiryId = `inq_${Date.now()}`;
    const docRef = doc(db, "inquiries", inquiryId);
    try {
      await setDoc(docRef, {
        name: data.name || "Client",
        email: data.email || "",
        phone: data.phone || data.whatsapp || "",
        subject: data.requestType || "Admin Logged Work Order",
        message: data.message || "",
        status: data.status || "new",
        createdAt: new Date().toISOString(),
      });
      return inquiryId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `inquiries/${inquiryId}`);
    }
  },

  async adminUpdateInquiry(inquiryId: string, updates: Record<string, any>): Promise<void> {
    const docRef = doc(db, "inquiries", inquiryId);
    try {
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `inquiries/${inquiryId}`);
    }
  },

  async adminDeleteInquiry(inquiryId: string): Promise<void> {
    const docRef = doc(db, "inquiries", inquiryId);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `inquiries/${inquiryId}`);
    }
  },

  /* ================= SERVICES ================= */
  async getServices(): Promise<Service[]> {
    try {
      const snap = await getDocs(collection(db, "services"));
      if (!snap.empty) {
        const list: Service[] = [];
        snap.forEach((d) => list.push({ _id: d.id, id: d.id, ...d.data() } as Service));
        return list;
      }
      return fallbackServices;
    } catch {
      return fallbackServices;
    }
  },

  async createService(service: Omit<Service, "_id" | "id">): Promise<Service> {
    const serviceId = `srv_${Date.now()}`;
    const docRef = doc(db, "services", serviceId);
    const newService: Service = {
      ...service,
      _id: serviceId,
      id: serviceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(docRef, newService);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hts_services_updated"));
      }
      return newService;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `services/${serviceId}`);
    }
  },

  async updateService(serviceId: string, updates: Partial<Service>): Promise<void> {
    const docRef = doc(db, "services", serviceId);
    try {
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hts_services_updated"));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `services/${serviceId}`);
    }
  },

  async deleteService(serviceId: string): Promise<void> {
    const docRef = doc(db, "services", serviceId);
    try {
      await deleteDoc(docRef);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hts_services_updated"));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `services/${serviceId}`);
    }
  },

  async seedDefaultServices(): Promise<number> {
    try {
      let count = 0;
      for (const srv of fallbackServices) {
        const serviceId = srv._id || `srv_${Date.now()}_${count}`;
        const docRef = doc(db, "services", serviceId);
        await setDoc(docRef, {
          ...srv,
          _id: serviceId,
          id: serviceId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        count++;
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hts_services_updated"));
      }
      return count;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "services");
    }
  },

  /* ================= ADMIN REGISTRATIONS CRUD ================= */
  async getAllRegistrations(): Promise<RegistrationRecord[]> {
    try {
      const snap = await getDocs(collection(db, "registrations"));
      const list: RegistrationRecord[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as RegistrationRecord);
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "registrations");
    }
  },

  async adminCreateRegistration(data: Omit<RegistrationRecord, "id" | "createdAt" | "trackingId">): Promise<RegistrationRecord> {
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
      status: data.status || "pending",
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

  async adminUpdateRegistration(id: string, updates: Partial<RegistrationRecord>): Promise<void> {
    const docRef = doc(db, "registrations", id);
    try {
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `registrations/${id}`);
    }
  },

  async adminDeleteRegistration(id: string): Promise<void> {
    const docRef = doc(db, "registrations", id);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `registrations/${id}`);
    }
  },

  /* ================= ADMIN TRANSACTIONS CRUD ================= */
  async getAllTransactions(): Promise<TransactionRecord[]> {
    try {
      const snap = await getDocs(collection(db, "transactions"));
      const list: TransactionRecord[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as TransactionRecord);
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "transactions");
    }
  },

  async adminUpdateTransaction(txId: string, updates: Partial<TransactionRecord>): Promise<void> {
    const docRef = doc(db, "transactions", txId);
    try {
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${txId}`);
    }
  },

  async adminDeleteTransaction(txId: string): Promise<void> {
    const docRef = doc(db, "transactions", txId);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${txId}`);
    }
  },

  /* ================= ADMIN VTU ORDERS CRUD ================= */
  async getAllVtuOrders(): Promise<VtuOrderRecord[]> {
    try {
      const snap = await getDocs(collection(db, "vtu_orders"));
      const list: VtuOrderRecord[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as VtuOrderRecord);
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "vtu_orders");
    }
  },

  async adminCreateVtuOrder(data: Omit<VtuOrderRecord, "id" | "createdAt" | "reference">): Promise<VtuOrderRecord> {
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
      status: data.status || "successful",
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(docRef, record);
      return record;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `vtu_orders/${orderId}`);
    }
  },

  async adminUpdateVtuOrder(orderId: string, updates: Partial<VtuOrderRecord>): Promise<void> {
    const docRef = doc(db, "vtu_orders", orderId);
    try {
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `vtu_orders/${orderId}`);
    }
  },

  async adminDeleteVtuOrder(orderId: string): Promise<void> {
    const docRef = doc(db, "vtu_orders", orderId);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vtu_orders/${orderId}`);
    }
  },

  /* ================= ADMIN USERS CRUD & WALLET CREDIT ================= */
  async getAllUsers(): Promise<User[]> {
    try {
      const snap = await getDocs(collection(db, "users"));
      const list: User[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          _id: d.id,
          id: d.id,
          name: data.name || "Client",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || (data.email === "fatimohmusbau34@gmail.com" ? "admin" : "customer"),
          wallet: data.walletBalance ?? data.wallet ?? 0,
          avatar: data.avatar || "",
          isVerified: data.isVerified ?? true,
          createdAt: data.createdAt,
        });
      });
      return list.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "users");
    }
  },

  async adminCreateUser(userData: {
    name: string;
    email: string;
    phone?: string;
    role: "customer" | "student" | "admin";
    walletBalance?: number;
  }): Promise<User> {
    const uid = `usr_${Date.now()}`;
    const userDocRef = doc(db, "users", uid);
    const newDoc = {
      uid,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone?.trim() || "",
      role: userData.role,
      walletBalance: userData.walletBalance || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(userDocRef, newDoc);
      return {
        _id: uid,
        id: uid,
        name: newDoc.name,
        email: newDoc.email,
        phone: newDoc.phone,
        role: newDoc.role,
        wallet: newDoc.walletBalance,
        isVerified: true,
        createdAt: newDoc.createdAt,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${uid}`);
    }
  },

  async adminUpdateUser(uid: string, updates: Partial<User>): Promise<void> {
    const userDocRef = doc(db, "users", uid);
    try {
      const payload: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.role !== undefined) payload.role = updates.role;
      if (updates.wallet !== undefined) payload.walletBalance = updates.wallet;
      await updateDoc(userDocRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  async adminAdjustUserWallet(uid: string, deltaAmount: number, reason: string = "Admin Adjustment"): Promise<number> {
    const userDocRef = doc(db, "users", uid);
    try {
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) throw new Error("User record does not exist");
      const currentBalance = snap.data().walletBalance ?? snap.data().wallet ?? 0;
      const newBalance = Math.max(0, currentBalance + deltaAmount);
      await updateDoc(userDocRef, {
        walletBalance: newBalance,
        updatedAt: new Date().toISOString(),
      });

      // Record transaction
      const txId = `tx_${Date.now()}_adj`;
      const txDocRef = doc(db, "transactions", txId);
      const isCredit = deltaAmount >= 0;
      await setDoc(txDocRef, {
        id: txId,
        reference: `HTS-ADJ-${Date.now().toString().slice(-6)}`,
        userId: uid,
        customerName: snap.data().name || "User",
        customerEmail: snap.data().email || "",
        customerPhone: snap.data().phone || "",
        type: isCredit ? "deposit" : "service_payment",
        amount: Math.abs(deltaAmount),
        paymentMethod: "wallet",
        status: "successful",
        description: `Admin Wallet ${isCredit ? "Credit" : "Debit"}: ${reason}`,
        createdAt: new Date().toISOString(),
      });

      return newBalance;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  async adminDeleteUser(uid: string): Promise<void> {
    const userDocRef = doc(db, "users", uid);
    try {
      await deleteDoc(userDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  },
};
