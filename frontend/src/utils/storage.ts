// src/utils/storage.ts
export const getAdminData = (key: string) => JSON.parse(localStorage.getItem(key) || "[]");
export const saveAdminData = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// Inicializa el storage con los datos del JSON si está vacío
export const initStorage = async (key: string, fetchFn: () => Promise<any>) => {
    if (!localStorage.getItem(key)) {
        const data = await fetchFn();
        saveAdminData(key, data);
    }
};