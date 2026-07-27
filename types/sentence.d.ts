export interface Sentence {
    id: number;
    text: string;
    selected: boolean;
    devis?: string;
    buy?: number;
    sell?: number;
    visualDisplay?: boolean;
    createdAt: Date;
    updatedAt: Date;
    Offices?: { id: number; name: string }[];
}