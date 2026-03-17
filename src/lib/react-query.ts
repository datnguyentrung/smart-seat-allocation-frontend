// File: src/lib/queryClient.ts (hoặc cấu hình thẳng trong App.tsx)
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import axios from "axios";
// Import thư viện Toast của bạn (ví dụ: sonner, react-toastify, react-hot-toast)
import { toast } from "sonner";

export const queryClient = new QueryClient({
  // ==========================================
  // 1. CẤU HÌNH MẶC ĐỊNH CHO TẤT CẢ CÁC API
  // ==========================================
  defaultOptions: {
    queries: {
      // Tắt tính năng tự động fetch lại khi người dùng chuyển tab/click ra ngoài
      refetchOnWindowFocus: false,

      // Không để data bị cũ ngay lập tức (giúp giảm tải API)
      staleTime: 1000 * 60 * 5, // Ví dụ: 5 phút

      // CHIẾN THUẬT RETRY THÔNG MINH CHO TOÀN BỘ APP
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error.response) {
          const { status } = error.response;
          // Lỗi 401 (Hết token), 403 (Cấm), 404 (Không thấy) -> Cấm thử lại
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        // Lỗi 500 (Server) hoặc rớt mạng -> Thử lại tối đa 2 lần
        return failureCount < 2;
      },
      // Độ trễ tăng dần: 1s, 2s...
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },

  // ==========================================
  // 2. BẮT LỖI TẬP TRUNG CHO TẤT CẢ useQuery (GET)
  // ==========================================
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Chỉ hiện Toast nếu đây là lần load đầu tiên (chưa có data cũ)
      // Tránh việc đang có data, refetch ngầm bị lỗi mà cũng hiện Toast spam user
      if (query.state.data === undefined) {
        toast.error(`Không thể tải dữ liệu: ${error.message || "Lỗi máy chủ"}`);
      }
    },
  }),

  // ==========================================
  // 3. BẮT LỖI TẬP TRUNG CHO TẤT CẢ useMutation (POST, PUT, PATCH, DELETE)
  // ==========================================
  mutationCache: new MutationCache({
    onError: (error) => {
      // Mọi thao tác Thêm/Sửa/Xóa bị lỗi sẽ tự động bắn Toast ở đây
      toast.error(`Thao tác thất bại: ${error.message || "Vui lòng thử lại"}`);
    },
  }),
});
