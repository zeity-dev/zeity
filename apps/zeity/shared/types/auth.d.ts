declare module '#auth-utils' {
  interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    verified: boolean;
  }
}

// do not remove this export, it ensures this file is treated as a module
export {};
