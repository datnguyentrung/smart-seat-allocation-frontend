export function findAndFlattenSuperSets(
  sourceArrays: number[][],
  queryArray: number[],
): number[] {
  // 1. Tạo Set để chứa kết quả cuối cùng (tự động loại bỏ trùng lặp)
  const resultSet = new Set<number>();

  // 2. Tạo Map đếm số lượng cho query (Chỉ làm 1 lần)
  // Ví dụ query [2, 2] -> Map { 2 => 2 }
  const queryCounts = new Map<number, number>();
  for (const num of queryArray) {
    queryCounts.set(num, (queryCounts.get(num) || 0) + 1);
  }

  // 3. Duyệt qua từng mảng nguồn
  for (const source of sourceArrays) {
    // Optimization 1: Bỏ qua ngay nếu độ dài không đủ
    if (source.length < queryArray.length) continue;

    // Kiểm tra xem source có thỏa mãn query không
    let isValid = true;
    for (const [qNum, qRequired] of queryCounts) {
      // Đếm số lần xuất hiện của qNum trong source
      // (Dùng vòng lặp for-of nhanh hơn filter/reduce)
      let foundCount = 0;
      for (const sNum of source) {
        if (sNum === qNum) foundCount++;
        // Optimization 2: Nếu đã tìm đủ số lượng cần thiết thì dừng đếm số đó
        if (foundCount >= qRequired) break;
      }

      if (foundCount < qRequired) {
        isValid = false;
        break; // Optimization 3: Sai 1 số là dừng kiểm tra source này ngay
      }
    }

    // 4. Nếu thỏa mãn -> Thêm từng phần tử vào Set kết quả
    if (isValid) {
      for (const num of source) {
        resultSet.add(num);
      }
    }
  }

  // 5. Chuyển Set về Array
  return [...resultSet];
}
