export interface Subject {
    _id: string;
    name: string;
    englishName: string;
    code: string,
    description?: string;
    deletedAt: string | null;
}