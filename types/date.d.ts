interface MyDate {
    id: number;
    date: string;
    Slots: Slot[];
    SubServiceId: number;
    createdAt: string;
}

interface Page{
    page: number;
    limit: number;
}

interface Result{
    data: any;
    length: number;
    next: Page;
    pages: number;
    previous: Page;
}