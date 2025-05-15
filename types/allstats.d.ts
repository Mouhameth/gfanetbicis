interface AllStats {
    totalAppointments: number;
    subServices: number;
    services: number;
    offices: number;
    appointmentsByOffice: Rec[];
    serveAppointmentsByOffice: Rec[],
    waitingAppointmentsByOffice: Rec[],
    months: string[];
    weeks: string[];
    years: string[];
    totalByOffices: any[];
}

interface Rec {
    name: string;
    amount: number;
}