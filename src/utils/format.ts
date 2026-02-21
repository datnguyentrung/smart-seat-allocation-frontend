export const formatDateDMY = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatDateDMYHM = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
};

export const formatDateDM = (dateString: Date) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}-${month}`;
};

export const formatTimeHM = (dateString: string | Date) => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const formatTimeStringHM = (timeString: string): string => {
  // Ví dụ: timeString là "15:32:57.613"

  // 1. Tìm vị trí dấu hai chấm thứ hai (trước giây)
  const secondColonIndex = timeString.indexOf(":", timeString.indexOf(":") + 1);

  // 2. Cắt chuỗi từ đầu đến vị trí đó
  if (secondColonIndex !== -1) {
    // Trả về chuỗi "15:32"
    return timeString.substring(0, secondColonIndex);
  }

  // Trường hợp chuỗi không đúng định dạng (không có dấu hai chấm thứ hai)
  // Hoặc bạn có thể xử lý bằng cách khác tùy ý. Ở đây, tôi trả về chuỗi gốc.
  return timeString;
};

export const formatDateYMD = (dateString: Date | number) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const formatDateTimeForBackend = (dateString: Date | number) => {
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  // Thêm giây (nếu không cần chính xác giây hiện tại thì để mặc định '00')
  const seconds = date.getSeconds().toString().padStart(2, "0");

  // SỬA LẠI: Dùng dấu 'T' ngăn cách và thêm giây
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};
