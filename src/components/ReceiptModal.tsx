import React from "react";
import { ReceiptRecord } from "../types";
import { X, Printer, CheckCircle, ShieldCheck, Download } from "lucide-react";

interface ReceiptModalProps {
  receipt: ReceiptRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold tracking-wide">Official Verified Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="receipt-paper" className="p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-dashed border-slate-200 gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-blue-900">HAMBAK TECH & SERVICES</h2>
              <p className="text-xs text-slate-500 font-medium">Where Technology Meets Service Excellence</p>
              <p className="text-xs text-slate-500 mt-1">Ibeju-Lekki, Lagos, Nigeria • Tel: 09127469686</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-emerald-100 text-emerald-800">
                {receipt.status}
              </span>
              <p className="text-xs text-slate-400 mt-1 font-mono">Ref: {receipt.receiptNumber}</p>
              <p className="text-xs text-slate-500">{new Date(receipt.date).toLocaleString()}</p>
            </div>
          </div>

          {/* Customer & Transaction Meta */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Billed To:</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{receipt.customerName}</p>
              {receipt.customerPhone && <p className="text-slate-600">{receipt.customerPhone}</p>}
              {receipt.customerEmail && <p className="text-slate-600 truncate">{receipt.customerEmail}</p>}
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Payment Details:</span>
              <p className="font-medium text-slate-800 mt-0.5">Method: <span className="font-bold capitalize">{receipt.paymentMethod.replace("_", " ")}</span></p>
              <p className="font-medium text-slate-800">Category: <span className="font-semibold">{receipt.serviceType}</span></p>
              {receipt.notes && <p className="text-slate-500 text-[11px] mt-1 italic">{receipt.notes}</p>}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipt.items.map((item, idx) => (
                  <tr key={idx} className="text-slate-700">
                    <td className="py-2.5 font-medium">{item.description}</td>
                    <td className="py-2.5 text-center">{item.qty}</td>
                    <td className="py-2.5 text-right">₦{item.price.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      ₦{(item.qty * item.price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Box */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-xs font-semibold">Payment Confirmed & Processed</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Amount:</span>
              <p className="text-2xl font-black text-blue-900">₦{receipt.total.toLocaleString()}</p>
            </div>
          </div>

          {/* Security QR Verification simulation */}
          <div className="pt-4 border-t border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-xl p-1 flex flex-col items-center justify-center font-mono text-[9px] text-center border border-slate-800">
                <span className="font-bold">HTS</span>
                <span>VERIFY</span>
              </div>
              <div>
                <p className="font-semibold text-slate-600">Verified Hambak Digital Stamp</p>
                <p className="text-[10px] text-slate-400">Scan code or retain reference for support</p>
                <p className="text-[9px] font-mono text-slate-400 mt-0.5">{receipt.qrData}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">Customer Support:</p>
              <p className="text-xs font-bold text-slate-700">09155104724 (WhatsApp)</p>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/50 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-md shadow-blue-900/10 transition"
          >
            <Download className="w-4 h-4" />
            Print / Save Receipt
          </button>
        </div>

      </div>
    </div>
  );
};
