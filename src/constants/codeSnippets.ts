import { CodeLanguage } from '../types';

export interface CodeSnippet {
  id: string;
  language: CodeLanguage;
  title: string;
  code: string;
}

export const CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'js-1',
    language: 'javascript',
    title: 'Array Reduce Sum',
    code: 'const calculateTotal = (items) => items.reduce((acc, item) => acc + item.price * item.quantity, 0);',
  },
  {
    id: 'js-2',
    language: 'javascript',
    title: 'Async Fetch Handler',
    code: 'async function fetchData(url) { const res = await fetch(url); if (!res.ok) throw new Error("Failed"); return res.json(); }',
  },
  {
    id: 'js-3',
    language: 'javascript',
    title: 'Debounce Utility',
    code: 'const debounce = (fn, ms) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; };',
  },
  {
    id: 'ts-1',
    language: 'typescript',
    title: 'Generic Result Type',
    code: 'type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };',
  },
  {
    id: 'ts-2',
    language: 'typescript',
    title: 'React Custom Hook',
    code: 'function useToggle(initial: boolean = false): [boolean, () => void] { const [val, setVal] = useState<boolean>(initial); return [val, () => setVal(v => !v)]; }',
  },
  {
    id: 'ts-3',
    language: 'typescript',
    title: 'Deep Partial Utility',
    code: 'type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]; };',
  },
  {
    id: 'py-1',
    language: 'python',
    title: 'List Comprehension & Filter',
    code: 'squared_evens = [x ** 2 for x in numbers if x % 2 == 0 and x > 0]',
  },
  {
    id: 'py-2',
    language: 'python',
    title: 'Context Manager File Read',
    code: 'def read_config(path: str) -> dict: with open(path, "r") as stream: return json.loads(stream.read())',
  },
  {
    id: 'py-3',
    language: 'python',
    title: 'Binary Search Implementation',
    code: 'def binary_search(arr, target): left, right = 0, len(arr) - 1; while left <= right: mid = (left + right) // 2',
  },
  {
    id: 'html-1',
    language: 'html_css',
    title: 'Flex Center Container',
    code: '.container { display: flex; align-items: center; justify-content: center; min-height: 100vh; backdrop-filter: blur(12px); }',
  },
  {
    id: 'html-2',
    language: 'html_css',
    title: 'CSS Grid Responsive Layout',
    code: '.dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; padding: 2rem; }',
  }
];
