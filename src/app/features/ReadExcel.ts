import type { FileData } from "../../interfaces/IHMI";
import * as XLSX from 'xlsx';
export const loadExcelData = async (): Promise<FileData[]> => {
  try {
    const response = await fetch('/data.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error('Error loading Excel data:', error);
    return [];
  }
};
