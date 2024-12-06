interface Stats {
    subServices: number;
    services: number;
    receives: number;
    waitings: number;
    appointments: number;
    normalAppointments: number;
    appointmentsByService: Record[];
    serveAppointmentsByService: Record[],
    waitingAppointmentsByService: Record[],
    appointmentList: Appointment[];
    appointmentsByStatut: Record[];
    months: string[];
    weeks: string[];
    years: string[];
    meanWaitingTime: number;
    meanServingTime: number;
    totalInWaiting: number;
    totatlInServing: number;
    totalNotInWaiting: number;
    totatlNotInServing: number;
    meanWaitingTimeByService: Record[];
    meanServingTimeByService: Record[];
    totatlInWaitingByService: Record[];
    totatlNotInWaitingByService: Record[];
    totatlInServingByService: Record[];
    totatlNotInServingByService: Record[];
    appointmentsBySubService: Record[];
    serveAppointmentsBySubService: Record[];
    waitingAppointmentsBySubService: Record[];
    meanWaitingTimeBySubService: Record[];
    meanServingTimeBySubService: Record[];
    totatlInWaitingBySubService: Record[];
    totatlNotInWaitingBySubService: Record[];
    totatlInServingBySubService: Record[];
    totatlNotInServingBySubService: Record[];
    appointmentsByHourSlot: Record[];
    serveAppointmentsByHourSlot: Record[];
    appointmentsByDays: DayRecord[];
    appointmentsByDates: DatesRecord[];
    totalByOffices: TotalRecord[]
}

interface Record {
    name: string;
    amount: number;
}

interface DayRecord {
    name: string;
    all: number;
    receives: number;
    waiting: number;
    inWaitings: number;
    inServings: number;
    notInWaitings: number;
    notInServings: number;
}

interface DaysRecord {
    date: string;
    serveAppointments: Record[];
    waitingAppointments: Record[];
    totalInWaiting: Record[];
    totalNotInWaiting: Record[];
    totalInServing: Record[];
    totalNotInServing: Record[];
}

interface TotalRecord {
    name: string;
    receives: number;
    waitings: number;
    serves: number;
    transfers: number;
    missing: number;
    services: number;
    subservices: number;
    meanWaitingTime: number;
    meanServingTime: number;
}

interface DatesRecord {
    name: string;
    receives: number;
    inwaitings: number;
    notInWaitings: number;
    notInServings: number;
    inservings: number;
    meanWaiting: number;
    meanServing: number;
}