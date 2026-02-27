interface AllStats {
    allAdmins: number;
    allUsers: number;
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
    meanWaitingTime: number;
    meanServingTime: number;
    totalInWaiting: number;
    totatlInServing: number;
    totalNotInWaiting: number;
    totatlNotInServing: number;
    waitings: number;
    receives: number;
    appointments: number;
    meanWaitingTimeAndSubservices: MWTSRecd[];
}

interface Rec {
    name: string;
    amount: number;
}

interface Slot {
    time: string;
    data: Rec[];
}

interface MWTSRecd {
    name: string;
    time: number;
    subServices: number;
}