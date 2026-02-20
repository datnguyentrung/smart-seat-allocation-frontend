type SeatPosition = { x: number; y: number };

/**
 * Tìm dãy ghế tối ưu
 * @param matrix Ma trận rạp phim
 *   - 0: lối đi hoặc ghế đã đặt (không available)
 *   - 1: ghế thường available (1 vé)
 *   - 2: ghế COUPLE available (2 vé)
 *   - -1: phần thứ 2 của ghế COUPLE (skip khi đếm)
 * @param n Số lượng VÉ cần đặt
 * @param targetX Vị trí cột người dùng chọn
 * @param targetY Vị trí hàng người dùng chọn
 */
export function findOptimalSeats(
  matrix: number[][],
  n: number,
  targetX: number,
  targetY: number,
): SeatPosition[] {
  const row = matrix[targetY];
  if (!row) return [];
  
  const maxCol = row.length;

  // Helper: Tính số vé từ một vị trí
  const getCapacity = (val: number): number => {
    if (val === 1) return 1; // Ghế thường = 1 vé
    if (val === 2) return 2; // Ghế COUPLE = 2 vé
    return 0; // 0 hoặc -1
  };

  // Helper: Kiểm tra có phải ghế available không
  const isAvailable = (val: number): boolean => val === 1 || val === 2 || val === -1;

  // 1. Xác định "Cụm ghế liên tiếp" (Block) mà người dùng đang chọn
  let blockStart = targetX;
  let blockEnd = targetX;

  // Mở rộng sang trái
  while (blockStart > 0 && isAvailable(row[blockStart - 1])) {
    blockStart--;
  }
  // Mở rộng sang phải
  while (blockEnd < maxCol - 1 && isAvailable(row[blockEnd + 1])) {
    blockEnd++;
  }

  // Tính tổng capacity (số vé) của block
  let totalCapacity = 0;
  for (let i = blockStart; i <= blockEnd; i++) {
    totalCapacity += getCapacity(row[i]);
  }

  // Nếu block không đủ capacity -> Trả về rỗng
  if (totalCapacity < n) return [];

  // 2. Tạo danh sách các phương án khả thi (Candidates)
  const candidates: { start: number; end: number; capacity: number }[] = [];

  // Duyệt tất cả các window có thể trong block
  for (let start = blockStart; start <= blockEnd; start++) {
    // Skip vị trí -1 khi làm điểm bắt đầu
    if (row[start] === -1) continue;
    
    let capacity = 0;
    for (let end = start; end <= blockEnd; end++) {
      capacity += getCapacity(row[end]);
      
      // Nếu capacity >= n, đây là một candidate hợp lệ
      if (capacity >= n) {
        candidates.push({ start, end, capacity });
      }
    }
  }

  if (candidates.length === 0) return [];

  // 3. Helper: Tính capacity của một đoạn
  const getSegmentCapacity = (start: number, end: number): number => {
    let cap = 0;
    for (let i = start; i <= end; i++) {
      cap += getCapacity(row[i]);
    }
    return cap;
  };

  // 4. Helper: Kiểm tra "Luật 1 ghế trống"
  const isGapValid = (start: number, end: number): boolean => {
    const leftCapacity = getSegmentCapacity(blockStart, start - 1);
    const rightCapacity = getSegmentCapacity(end + 1, blockEnd);
    return leftCapacity !== 1 && rightCapacity !== 1;
  };

  // 5. Sắp xếp Candidates theo thứ tự ưu tiên
  candidates.sort((a, b) => {
    // Tiêu chí 1: Ưu tiên capacity chính xác bằng n (không dư thừa)
    const aPerfectFit = a.capacity === n;
    const bPerfectFit = b.capacity === n;
    if (aPerfectFit !== bPerfectFit) return aPerfectFit ? -1 : 1;

    // Tiêu chí 2: Gap Rule (Ưu tiên phương án KHÔNG phạm luật)
    const aValid = isGapValid(a.start, a.end);
    const bValid = isGapValid(b.start, b.end);
    if (aValid !== bValid) return aValid ? -1 : 1;

    // Tiêu chí 3: Inclusion (Ưu tiên phương án CÓ CHỨA targetX)
    const aHasTarget = targetX >= a.start && targetX <= a.end;
    const bHasTarget = targetX >= b.start && targetX <= b.end;
    if (aHasTarget !== bHasTarget) return aHasTarget ? -1 : 1;

    // Tiêu chí 4: Distance (Ưu tiên phương án GẦN targetX nhất)
    const aCenter = (a.start + a.end) / 2;
    const bCenter = (b.start + b.end) / 2;
    const aDist = Math.abs(aCenter - targetX);
    const bDist = Math.abs(bCenter - targetX);
    if (aDist !== bDist) return aDist - bDist;

    // Tiêu chí 5: Ưu tiên đoạn ngắn hơn (ít dư thừa hơn)
    return a.capacity - b.capacity;
  });

  // 6. Chọn phương án tốt nhất
  const bestOption = candidates[0];
  if (!bestOption) return [];

  // 7. Format kết quả trả về (chỉ lấy vị trí ghế thật, bỏ qua -1)
  const result: SeatPosition[] = [];
  for (let i = bestOption.start; i <= bestOption.end; i++) {
    if (row[i] !== -1) { // Bỏ qua phần thứ 2 của COUPLE
      result.push({ x: i, y: targetY });
    }
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
