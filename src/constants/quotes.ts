export interface Quote {
  id: string;
  text: string;
  author: string;
}

export const FAMOUS_QUOTES: Quote[] = [
  {
    id: 'quote-1',
    text: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
  },
  {
    id: 'quote-2',
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
  },
  {
    id: 'quote-3',
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
  },
  {
    id: 'quote-4',
    text: "The only way to go fast, is to go well.",
    author: "Robert C. Martin",
  },
  {
    id: 'quote-5',
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
  },
  {
    id: 'quote-6',
    text: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde",
  },
  {
    id: 'quote-7',
    text: "Knowledge is of no value unless you put it into practice.",
    author: "Anton Chekhov",
  },
  {
    id: 'quote-8',
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
  },
];
