interface Media {
    id: number;
    url: string;
    type: string;
    selected: boolean;
    playTime: number;
    visuDisplay?: boolean;
    createdAt: Date;
    Offices?: { id: number; name: string }[];
}