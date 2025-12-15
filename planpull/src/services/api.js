import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

/**
 * Converts a File object to a Base64 string.
 * @param {File} file 
 * @returns {Promise<string>} Base64 string
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Calls the extract_pdf Cloud Function with the file.
 * @param {File} file 
 * @returns {Promise<any>} Response data
 */
export const extractPdf = async (file) => {
    try {
        console.log("Converting file to base64...");
        const base64Data = await fileToBase64(file);

        console.log("Calling extract_pdf function...");
        const extractFn = httpsCallable(functions, 'extract_pdf');

        const result = await extractFn({
            fileData: base64Data,
            fileName: file.name,
            mimeType: file.type
        });

        console.log("Extraction result:", result.data);
        return result.data;
    } catch (error) {
        console.error("Error calling extract_pdf:", error);
        throw error;
    }
};
