interface User {
    id: number;
    username: string;
    name: string;
    phone: string;
    active: boolean;
    Role: Role;
    role: Role;
    subservice?: SubService;
    services?: Service[];
    officeId: number;
    createdAt: Date;
    office?: Office
}

interface Role{
     id: number;
     name: string;
     createdAt: Date;
}