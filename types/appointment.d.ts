interface Appointment {
    id: number;
    Service: Service;
    Subservice: SubService;
    num: number;
    personinfront: number;
    received: boolean;
    transfered: boolean;
    serve: boolean;
    missing: boolean;
    date: string;
    time: string;
    callTime: string;
    timeInMinutes: number;
    waitingTime: number;
    processingTime: number;
    createdAt: string;
}