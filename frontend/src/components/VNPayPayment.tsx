import { useEffect, useState } from "react";
import { CreditCard, RefreshCw, CheckCircle2, XCircle, Loader2, QrCode, ExternalLink } from "lucide-react";
import {
  createVNPayUrl,
  openVNPayPayment,
  type VNPayCreateUrlResponse,
} from "../services/vnpayService";

interface VNPayPaymentProps {
  amount: number;
  orderId: string;
  orderInfo: string;
  customerName?: string;
  customerPhone?: string;
  onSuccess: (transactionId?: string) => void;
  onError: (message: string) => void;
  onCancel?: () => void;
}

type PaymentStep = "idle" | "generating" | "qr_pay" | "success" | "failed";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function VNPayPayment({
  amount,
  orderId,
  orderInfo,
  customerName,
  customerPhone,
  onSuccess,
  onError,
  onCancel,
}: VNPayPaymentProps) {
  const [step, setStep] = useState<PaymentStep>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentData, setPaymentData] = useState<VNPayCreateUrlResponse | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const isMockPayment = paymentData?.isMock === true;

  const handleStartPayment = async () => {
    setStep("generating");
    setErrorMsg("");

    try {
      const data = await createVNPayUrl({
        amount,
        orderId,
        orderInfo,
      });

      setPaymentData(data);
      setStep("qr_pay");
      if (data.isMock) {
        setStatusMsg("Quét mã QR hoặc chờ xác nhận DEMO (5 giây)…");
      } else {
        setStatusMsg("Quét mã QR bằng app ngân hàng hoặc mở trang thanh toán bên dưới.");
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Không thể tạo thanh toán VNPay";
      setErrorMsg(msg);
      setStep("failed");
      onError(msg);
    }
  };

  useEffect(() => {
    if (step !== "qr_pay" || !paymentData?.isMock) return;

    const timer = window.setTimeout(() => {
      setStep("success");
      setStatusMsg("Thanh toán thành công! (Chế độ DEMO — tự động sau 5 giây)");
      onSuccess("MOCK_VNPAY_TRANS_" + Date.now());
    }, 5000);

    return () => window.clearTimeout(timer);
    // onSuccess từ parent có thể đổi mỗi render — không đưa vào deps để không reset bộ đếm 5s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentData?.isMock, paymentData?.orderId]);

  const handleRetry = () => {
    setStep("idle");
    setErrorMsg("");
    setPaymentData(null);
    setStatusMsg("");
  };

  if (step === "generating") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <div className="relative">
          <div className="h-20 w-20 animate-pulse rounded-full bg-blue-100" />
          <div className="absolute inset-0 flex items-center justify-center">
            <CreditCard className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <p className="text-base font-semibold text-slate-700">
          Đang tạo mã thanh toán VNPay…
        </p>
        <p className="text-sm text-slate-500">Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  if (step === "qr_pay" && paymentData) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span className="text-base font-bold text-slate-900">Thanh toán VNPay</span>
            {isMockPayment && (
              <span className="rounded-full border border-yellow-400 bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">
                DEMO
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
            Số tiền thanh toán
          </p>
          <p className="mt-1 text-3xl font-black text-blue-700">{formatCurrency(amount)}</p>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <QrCode className="h-4 w-4 text-teal-600" />
            Mã QR thanh toán
          </div>
          {paymentData.qrCodeUrl ? (
            <div className="relative overflow-hidden rounded-2xl border-4 border-teal-200 shadow-md">
              <img
                src={paymentData.qrCodeUrl}
                alt="VNPay QR"
                className="block h-56 w-56 bg-white"
              />
              {isMockPayment && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-teal-700 px-3 py-1 text-xs font-bold text-white shadow">
                  DEMO — Không quét thật
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-56 w-56 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
              Không có ảnh QR
            </div>
          )}
          <p className="text-center text-xs text-slate-500">{statusMsg}</p>
          {isMockPayment && (
            <div className="flex items-center gap-2 text-xs text-teal-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Tự động hoàn tất sau 5 giây…
            </div>
          )}
        </div>

        {!isMockPayment && (
          <button
            type="button"
            onClick={() => openVNPayPayment(paymentData.paymentUrl)}
            className="primary-btn flex w-full items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Mở trang thanh toán VNPay
          </button>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Nội dung
          </p>
          <p className="mt-1 font-semibold text-slate-800">{orderInfo}</p>
          {customerName && (
            <p className="mt-2 text-xs text-slate-600">
              {customerName}
              {customerPhone ? ` · ${customerPhone}` : ""}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex flex-1 items-center justify-center rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              Hủy
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Thanh toán VNPay thất bại</h3>
        <p className="text-center text-sm text-slate-600">{errorMsg}</p>
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="primary-btn flex items-center gap-2"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </button>
          {onCancel && (
            <button onClick={onCancel} className="secondary-btn" type="button">
              Hủy
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Thanh toán VNPay thành công!</h3>
        <p className="text-center text-sm text-slate-600">{statusMsg}</p>
        <div className="mt-2 flex flex-col gap-2 text-center text-sm text-slate-500">
          <p>
            <span className="font-semibold text-slate-700">Số tiền:</span>{" "}
            {formatCurrency(amount)}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Mã đơn hàng:</span>{" "}
            {orderId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <span className="text-base font-bold text-slate-900">Thanh toán VNPay</span>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
          Số tiền thanh toán
        </p>
        <p className="mt-1 text-3xl font-black text-blue-700">{formatCurrency(amount)}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Nội dung thanh toán
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{orderInfo}</p>

        {customerName && (
          <div className="mt-3 border-t border-slate-200 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Người thanh toán
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {customerName} {customerPhone ? `| ${customerPhone}` : ""}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 text-sm text-slate-600">
        <p className="font-semibold text-blue-700">Hướng dẫn:</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>Nhấn nút để tạo mã QR và liên kết thanh toán</li>
          <li>Quét QR bằng app ngân hàng có hỗ trợ VNPay</li>
          <li>Hoặc mở trang cổng thanh toán (môi trường thật)</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleStartPayment}
          className="primary-btn flex flex-1 items-center justify-center gap-2"
          type="button"
        >
          <QrCode className="h-4 w-4" />
          Tạo mã QR thanh toán
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-95"
            type="button"
          >
            Hủy
          </button>
        )}
      </div>
    </div>
  );
}
