export interface Sentence {
    id: number;
    text: string;
    selected: boolean;
    devis?: string;
    buy?: number;
    sell?: number;
    createdAt: Date;
    updatedAt: Date;
}