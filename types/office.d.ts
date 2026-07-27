import { Service } from "./service";

export interface Office {
    id: number;
    name: string;
    localname: string;
    country: string;
    city: string;
    location: string;
    logo: string;
    ipAddress?: string;
    services?: Service[];
    allowedServices?: Service[];
    createdAt: Date;
}