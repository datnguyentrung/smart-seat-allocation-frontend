type SeatPosition = { x: number; y: number };

/**
 * Tìm dãy ghế tối ưu
 * @param matrix Ma trận rạp phim (0: lối đi, 1: ghế trống, 2: đã đặt - ở đây ta chỉ quan tâm 0 và 1)
 * @param n Số lượng ghế cần đặt
 * @param targetX Vị trí cột người dùng chọn
 * @param targetY Vị trí hàng người dùng chọn
 */
function findOptimalSeats(
  matrix: number[][],
  n: number,
  targetX: number,
  targetY: number,
): SeatPosition[] {
  const row = matrix[targetY];
  const maxCol = row.length;

  // 1. Xác định "Cụm ghế liên tiếp" (Block) mà người dùng đang chọn
  // (Ví dụ hàng: 0 1 1 1 1 0, người dùng chọn x=2 -> Block là index [1, 4])
  let blockStart = targetX;
  let blockEnd = targetX;

  // Mở rộng sang trái
  while (blockStart > 0 && row[blockStart - 1] === 1) {
    blockStart--;
  }
  // Mở rộng sang phải
  while (blockEnd < maxCol - 1 && row[blockEnd + 1] === 1) {
    blockEnd++;
  }

  const blockSize = blockEnd - blockStart + 1;

  // Nếu cụm ghế không đủ chỗ cho n người -> Trả về rỗng hoặc xử lý lỗi
  if (blockSize < n) return [];

  // 2. Tạo danh sách các phương án khả thi (Candidates)
  // Mỗi candidate là một cặp [startIndex, endIndex]
  const candidates: { start: number; end: number }[] = [];

  for (let i = blockStart; i <= blockEnd - n + 1; i++) {
    candidates.push({ start: i, end: i + n - 1 });
  }

  // 3. Hàm kiểm tra "Luật 1 ghế trống"
  // Trả về true nếu dãy ghế KHÔNG tạo ra ghế trống đơn lẻ
  const isGapValid = (start: number, end: number): boolean => {
    const leftGap = start - blockStart; // Số ghế thừa bên trái
    const rightGap = blockEnd - end; // Số ghế thừa bên phải
    return leftGap !== 1 && rightGap !== 1;
  };

  // 4. Sắp xếp Candidates theo thứ tự ưu tiên
  candidates.sort((a, b) => {
    // Tiêu chí 1: Gap Rule (Ưu tiên phương án KHÔNG phạm luật)
    const aValid = isGapValid(a.start, a.end);
    const bValid = isGapValid(b.start, b.end);
    if (aValid !== bValid) return aValid ? -1 : 1; // True xếp trước

    // Tiêu chí 2: Inclusion (Ưu tiên phương án CÓ CHỨA targetX)
    const aHasTarget = targetX >= a.start && targetX <= a.end;
    const bHasTarget = targetX >= b.start && targetX <= b.end;
    if (aHasTarget !== bHasTarget) return aHasTarget ? -1 : 1; // True xếp trước

    // Tiêu chí 3: Distance (Ưu tiên phương án GẦN targetX nhất)
    // Tính trung tâm của dãy ghế
    const aCenter = (a.start + a.end) / 2;
    const bCenter = (b.start + b.end) / 2;
    const aDist = Math.abs(aCenter - targetX);
    const bDist = Math.abs(bCenter - targetX);

    return aDist - bDist; // Khoảng cách nhỏ hơn xếp trước
  });

  // 5. Chọn phương án tốt nhất (đầu mảng sau khi sort)
  const bestOption = candidates[0];

  // 6. Format kết quả trả về
  const result: SeatPosition[] = [];
  for (let i = bestOption.start; i <= bestOption.end; i++) {
    result.push({ x: i, y: targetY });
  }

  return result;
}

// --- TEST CASES ---

const matrix1 = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0], // Row 1
];

console.log("--- TEST CASE 1 (Hàng có 4 ghế) ---");
// n=2, x=2 -> Output kỳ vọng: x=1, x=2
console.log("n=2, x=2:", findOptimalSeats(matrix1, 2, 2, 1));

// n=3, x=2 (Bất khả kháng) -> Output kỳ vọng: x=1, x=2, x=3
console.log("n=3, x=2:", findOptimalSeats(matrix1, 3, 2, 1));

// n=3, x=3 -> Output kỳ vọng: x=2, x=3, x=4
console.log("n=3, x=3:", findOptimalSeats(matrix1, 3, 3, 1));

const matrix2 = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0], // Row 1: Cụm 2 từ index 6 đến 11
];

console.log("\n--- TEST CASE 2 (Hàng phức tạp) ---");
// n=3, x=7 -> Output: 6, 7, 8
console.log(
  "n=3, x=7:",
  findOptimalSeats(matrix2, 3, 7, 1).map((s) => s.x),
);

// n=3, x=8 -> Output: 6, 7, 8 (Vì 7,8,9 để lại lỗ trái 1; 8,9,10 để lại lỗ phải 1)
console.log(
  "n=3, x=8:",
  findOptimalSeats(matrix2, 3, 8, 1).map((s) => s.x),
);

// n=3, x=9 -> Output: 9, 10, 11 (Để lại cụm 3 ghế bên trái -> Đẹp)
console.log(
  "n=3, x=9:",
  findOptimalSeats(matrix2, 3, 9, 1).map((s) => s.x),
);
