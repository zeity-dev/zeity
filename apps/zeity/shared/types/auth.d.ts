declare module '#auth-utils' {
  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    verified: boolean;
  }
}
export {};
