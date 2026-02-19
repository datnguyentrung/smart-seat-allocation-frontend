export function findAndFlattenSuperSets(
  sourceArrays: number[][],
  queryArray: number[],
): number[] {
  // 1. Tạo Set để chứa kết quả cuối cùng
  const resultSet = new Set<number>();

  // 2. Tạo Map đếm số lượng cho query
  const queryCounts = new Map<number, number>();
  for (const num of queryArray) {
    queryCounts.set(num, (queryCounts.get(num) || 0) + 1);
  }

  // 3. Duyệt qua từng mảng nguồn
  for (const source of sourceArrays) {
    // Optimization 1: Bỏ qua ngay nếu độ dài không đủ
    if (source.length < queryArray.length) continue;

    let isValid = true;
    for (const [qNum, qRequired] of queryCounts) {
      let foundCount = 0;
      for (const sNum of source) {
        if (sNum === qNum) foundCount++;
        if (foundCount >= qRequired) break;
      }

      if (foundCount < qRequired) {
        isValid = false;
        break;
      }
    }

    // 4. NẾU THỎA MÃN -> XỬ LÝ TRỪ MẢNG RỒI MỚI THÊM VÀO SET
    if (isValid) {
      // BƯỚC MỚI: Tạo một bản sao của Map để đếm ngược số lượng cần "trừ" đi
      const skipCounts = new Map(queryCounts);

      for (const num of source) {
        const needToSkip = skipCounts.get(num) || 0;

        if (needToSkip > 0) {
          // Bỏ qua phần tử này (vì nó thuộc query) và giảm biến đếm
          skipCounts.set(num, needToSkip - 1);
        } else {
          // Nếu không thuộc query (hoặc đã trừ đủ số lượng), thì đưa vào Set
          resultSet.add(num);
        }
      }
    }
  }

  // 5. Chuyển Set về Array
  return [...resultSet];
}

// --- TEST CASE ---
const dataInput = [
  [4, 4],
  [2, 2, 4],
  [2, 3, 3],
];

console.log(findAndFlattenSuperSets(dataInput, [2]));
// Output sẽ là: [2, 4, 3]
// (Tức là [2, 4] từ mảng 1 và [3, 3] từ mảng 2 -> Gộp lại lấy unique)
