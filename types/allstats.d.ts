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
    appointmentsByHourSlot: Slot[];
    servingAppointmentsByHourSlot: Slot[];
    totalInTimeByOffice: any[];
    totalNotInTimeByOffice: any[];
}

interface Rec {
    name: string;
    amount: number;
}

interface Slot {
    time: string;
    data: Rec[];
}