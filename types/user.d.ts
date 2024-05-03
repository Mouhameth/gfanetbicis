interface User {
    id: number;
    username: string;
    name: string;
    phone: string;
    active: boolean;
    Role: Role;
    role: Role;
    createdAt: Date;
}

interface Role{
     id: number;
     name: string;
     createdAt: Date;
}