import { ChangeEvent, useEffect, useState } from 'react';

export default function useReadCsv() {
  const [csvData, setCsvData] = useState<string | null>();

  const uploadCsv = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files?.length) return;
    const file = e.target.files[0];
    // let imageData;
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = function (e) {
        const csvData = e.target?.result as string;
        setCsvData(csvData);
        // imageData = parseCsvToImageData(csvData);
        // drawImage("originalCanvas", imageData);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid CSV file.');
    }
  };

  return [csvData, uploadCsv] as const;
}
