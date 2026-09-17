import { DsaChallenge } from '../types';

export const DSA_CHALLENGES: DsaChallenge[] = [
  {
    id: 'dsa-fibonacci',
    title: 'Fibonacci Series (Dynamic Programming)',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Compute the n-th Fibonacci number where each number is the sum of the two preceding ones.',
    solutions: {
      python: `def fib(n: int) -> int:
  a, b = 0, 1
  for _ in range(n):
    a, b = b, a + b
  return a`,
      javascript: `function fibonacci(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}`,
      typescript: `const fib = (n: number): number => {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
};`,
      cpp: `int fib(int n) {
  int a = 0, b = 1;
  while (n--) {
    int temp = a + b;
    a = b;
    b = temp;
  }
  return a;
}`,
      java: `public static int fib(int n) {
  int a = 0, b = 1;
  for (int i = 0; i < n; i++) {
    int temp = a + b;
    a = b;
    b = temp;
  }
  return a;
}`,
    },
  },
  {
    id: 'dsa-two-sum',
    title: 'Two Sum (Hash Map Lookup)',
    difficulty: 'Easy',
    category: 'Hash Map',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Given an array of integers and a target, return indices of the two numbers such that they add up to target.',
    solutions: {
      python: `def two_sum(nums, target):
  seen = {}
  for i, num in enumerate(nums):
    diff = target - num
    if diff in seen:
      return [seen[diff], i]
    seen[num] = i`,
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement)!, i];
    map.set(nums[i], i);
  }
  return [];
}`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
  unordered_map<int, int> m;
  for (int i = 0; i < nums.size(); i++) {
    int diff = target - nums[i];
    if (m.count(diff)) return {m[diff], i};
    m[nums[i]] = i;
  }
  return {};
}`,
      java: `public int[] twoSum(int[] nums, int target) {
  Map<Integer, Integer> map = new HashMap<>();
  for (int i = 0; i < nums.length; i++) {
    int diff = target - nums[i];
    if (map.containsKey(diff)) return new int[] {map.get(diff), i};
    map.put(nums[i], i);
  }
  return new int[0];
}`,
    },
  },
  {
    id: 'dsa-binary-search',
    title: 'Binary Search (Divide & Conquer)',
    difficulty: 'Easy',
    category: 'Binary Search',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Search target in a sorted ascending array by repeatedly halving the search space.',
    solutions: {
      python: `def binary_search(nums, target):
  low, high = 0, len(nums) - 1
  while low <= high:
    mid = (low + high) // 2
    if nums[mid] == target:
      return mid
    elif nums[mid] < target:
      low = mid + 1
    else:
      high = mid - 1
  return -1`,
      javascript: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
      typescript: `function binarySearch(arr: number[], target: number): number {
  let l = 0, r = arr.length - 1;
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    if (arr[mid] === target) return mid;
    arr[mid] < target ? l = mid + 1 : r = mid - 1;
  }
  return -1;
}`,
      cpp: `int binarySearch(const vector<int>& v, int target) {
  int l = 0, r = v.size() - 1;
  while (l <= r) {
    int mid = l + (r - l) / 2;
    if (v[mid] == target) return mid;
    if (v[mid] < target) l = mid + 1;
    else r = mid - 1;
  }
  return -1;
}`,
      java: `public int binarySearch(int[] nums, int target) {
  int l = 0, r = nums.length - 1;
  while (l <= r) {
    int mid = l + (r - l) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) l = mid + 1;
    else r = mid - 1;
  }
  return -1;
}`,
    },
  },
];
