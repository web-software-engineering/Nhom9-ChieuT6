import { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Smartphone,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
} from "lucide-react";
import {
  createMoMoPayment,
  checkMoMoStatus,
  type MoMoPaymentResponse,
  type MoMoStatusResponse,
} from "../services/momoService";

interface MoMoPaymentProps {
  amount: number;
  orderId: string;
  orderInfo: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onSuccess: (transactionId?: string) => void;
  onError: (message: string) => void;
  onCancel?: () => void;
}

type PaymentStep = "generating" | "qr" | "checking" | "success" | "failed";

const PAYMENT_TIMEOUT_SECONDS = 15 * 60; // 15 phút

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MoMoPayment({
  amount,
  orderId,
  orderInfo,
  customerName,
  customerPhone,
  customerEmail,
  onSuccess,
  onError,
  onCancel,
}: MoMoPaymentProps) {
  const [step, setStep] = useState<PaymentStep>("generating");
  const [paymentData, setPaymentData] = useState<MoMoPaymentResponse | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT_SECONDS);
  const [copied, setCopied] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Bật chế độ mock: orderId bắt đầu bằng "ORDER_" (frontend tự sinh)
  // và backend trả về isMock=true
  const isMockPayment = paymentData?.isMock === true;

  // Khởi tạo thanh toán MoMo
  useEffect(() => {
    let cancelled = false;

    const initPayment = async () => {
      setStep("generating");
      setErrorMsg("");

      try {
        // Ưu tiên dùng /create để lấy đầy đủ thông tin thanh toán
        const data = await createMoMoPayment({
          amount,
          orderId,
          orderInfo,
          customerName: customerName || "",
          customerPhone: customerPhone || "",
          customerEmail: customerEmail || "",
        });

        if (cancelled) return;

        setPaymentData(data);
        setStep("qr");
        // Truyền isMock từ response (state paymentData chưa kịp cập nhật trong cùng tick)
        startPolling(data.orderId, data.isMock === true);
      } catch (error: unknown) {
        if (cancelled) return;

        const msg =
          error instanceof Error
            ? error.message
            : "Không thể tạo mã thanh toán MoMo";
        setErrorMsg(msg);
        setStep("failed");
        onError(msg);
      }
    };

    initPayment();

    return () => {
      cancelled = true;
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, amount]);

  // Countdown timer
  useEffect(() => {
    if (step !== "qr") return;

    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopPolling();
          setStep("failed");
          setErrorMsg("Hết thời gian thanh toán. Vui lòng tạo mã mới.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [step]);

  // Poll trạng thái thanh toán
  const startPolling = (momoOrderId: string, isMock?: boolean) => {
    stopPolling();

    // Mock: không gọi API MoMo thật — sau 5 giây báo thành công
    if (isMock) {
      pollingRef.current = setTimeout(() => {
        setStep("success");
        setStatusMsg(
          "Thanh toán thành công! (Chế độ DEMO — tự động sau 5 giây)",
        );
        onSuccess("MOCK_TRANS_" + Date.now());
      }, 5000);
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const result: MoMoStatusResponse = await checkMoMoStatus(momoOrderId);

        if (result.success && result.data) {
          if (result.data.resultCode === 0) {
            stopPolling();
            setStep("success");
            setStatusMsg(
              `Thanh toán thành công! Mã giao dịch: ${result.data.transId}`,
            );
            onSuccess(result.data.transId);
            return;
          } else if (result.data.resultCode !== 1000) {
            stopPolling();
            setStep("failed");
            setErrorMsg(`Thanh toán không thành công: ${result.data.message}`);
            onError(result.data.message);
          }
        }
      } catch {
        // Bỏ qua lỗi polling, tiếp tục chờ
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      if (typeof pollingRef.current === "number") {
        clearTimeout(pollingRef.current);
      } else {
        clearInterval(pollingRef.current);
      }
      pollingRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // Tạo lại mã thanh toán
  const handleRetry = async () => {
    stopPolling();
    setStep("generating");
    setTimeLeft(PAYMENT_TIMEOUT_SECONDS);
    setErrorMsg("");
    setPaymentData(null);

    try {
      const data = await createMoMoPayment({
        amount,
        orderId,
        orderInfo,
        customerName: customerName || "",
        customerPhone: customerPhone || "",
        customerEmail: customerEmail || "",
      });

      setPaymentData(data);
      setStep("qr");
      startPolling(data.orderId, data.isMock === true);
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Không thể tạo lại mã thanh toán MoMo";
      setErrorMsg(msg);
      setStep("failed");
      onError(msg);
    }
  };

  // Mở app MoMo
  const handleOpenMoMoApp = () => {
    if (paymentData?.payUrl) {
      window.open(paymentData.payUrl, "_blank");
    }
  };

  // Copy mã đơn hàng
  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ======= RENDER =======

  if (step === "generating") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <div className="relative">
          <div className="h-20 w-20 animate-pulse rounded-full bg-pink-100" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Smartphone className="h-10 w-10 text-pink-500" />
          </div>
        </div>
        <p className="text-base font-semibold text-slate-700">
          Đang tạo mã thanh toán MoMo…
        </p>
        <p className="text-sm text-slate-500">Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          Thanh toán MoMo thất bại
        </h3>
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
        <h3 className="text-xl font-bold text-slate-900">
          Thanh toán MoMo thành công!
        </h3>
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

  // step === 'qr'
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-pink-500" />
          <span className="text-base font-bold text-slate-900">
            Thanh toán MoMo
          </span>
          {isMockPayment && (
            <span className="rounded-full border border-yellow-400 bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">
              DEMO
            </span>
          )}
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            timeLeft <= 60
              ? "bg-red-100 text-red-600"
              : timeLeft <= 300
                ? "bg-yellow-100 text-yellow-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Amount */}
      <div className="rounded-2xl border border-pink-200 bg-pink-50/60 p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-pink-600">
          Số tiền thanh toán
        </p>
        <p className="mt-1 text-3xl font-black text-pink-700">
          {formatCurrency(amount)}
        </p>
      </div>

      {/* QR Code Area */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        {/* QR Image */}
        <div className="relative flex items-center justify-center">
          {paymentData?.qrCodeUrl ? (
            <div className="relative overflow-hidden rounded-2xl border-4 border-pink-200 shadow-md">
              <img
                src={paymentData.qrCodeUrl}
                alt="MoMo QR Code"
                className="block h-56 w-56"
              />
              {isMockPayment && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-pink-600 px-3 py-1 text-xs font-bold text-white shadow">
                  DEMO — Không quét thật
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-56 w-56 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <QrCode className="h-12 w-12" />
                <p className="text-xs">Đang tải mã QR…</p>
              </div>
            </div>
          )}
        </div>

        {/* MoMo brand */}
        <div className="flex items-center gap-2 rounded-full bg-pink-50 px-4 py-1.5 text-sm font-bold text-pink-700">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#a50064" />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fontSize="10"
              fill="white"
              fontWeight="bold"
            >
              M
            </text>
          </svg>
          Quét bằng app MoMo
        </div>

        <p className="text-center text-xs text-slate-500">
          Mở app MoMo → <strong>"Quét QR"</strong> → hướng camera vào mã
        </p>

        {/* Payment URL fallback (khi có payUrl thật) */}
        {paymentData?.payUrl && (
          <button
            onClick={handleOpenMoMoApp}
            className="w-full rounded-xl bg-pink-500 py-3 text-sm font-bold text-white transition hover:bg-pink-600 active:scale-95"
            type="button"
          >
            <span className="flex items-center justify-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mở ứng dụng MoMo để thanh toán
            </span>
          </button>
        )}
      </div>

      {/* Order info */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Mã đơn hàng
            </p>
            <p className="mt-1 font-mono font-bold text-slate-800">{orderId}</p>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 active:scale-95"
            type="button"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Đã chép!" : "Sao chép"}
          </button>
        </div>

        <div className="mt-3 border-t border-slate-200 pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Nội dung chuyển khoản
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {orderInfo}
          </p>
        </div>
      </div>

      {/* Status polling indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {isMockPayment
          ? "Chế độ DEMO: sau 5 giây sẽ báo thanh toán thành công tự động"
          : "Đang chờ thanh toán… (tự động kiểm tra mỗi 3 giây)"}
      </div>

      {/* Retry / Cancel */}
      <div className="flex gap-3">
        <button
          onClick={handleRetry}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          type="button"
        >
          <RefreshCw className="h-4 w-4" />
          Tạo mã mới
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-95"
            type="button"
          >
            Hủy
          </button>
        )}
      </div>
    </div>
  );
}
