import React, { ChangeEvent, useEffect, useState } from 'react';
import useReadCsv from '../../hooks/useReadCsv';

type Num3 = [number, number, number];
type Kernel = [Num3, Num3, Num3];
const initialKernel: Kernel = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];

export default function Convolution() {
  const [csvData, uploadCsv] = useReadCsv();
  const [imageData, setImageData] = useState<number[][]>([]);

  // 둘이 한 쌍
  const [kernelText, setKernelText] = useState('');
  const [kernel, setKernel] = useState<Kernel>(initialKernel);
  const performConvolution = () => {
    const conv = convolution(imageData, kernel);
    // console.log(conv);
    drawImage('originalCanvas', conv);
  };

  useEffect(() => {
    if (!csvData) return;

    // drawImage
    setImageData(parseCsvToImageData(csvData));
  }, [csvData]);

  useEffect(() => {
    if (imageData.length === 0) return;
    drawImage('originalCanvas', imageData);
  }, [imageData]);

  useEffect(() => {
    if (!kernelText.length) return;
    setKernel(transformKernel(kernelText));
  }, [kernelText]);

  function drawImage(canvasId: string, data: number[][]) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const height = data.length;
    const width = data[0].length;
    canvas.width = width;
    canvas.height = height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelValue = data[y][x];
        ctx.fillStyle = `rgb(${pixelValue}, ${pixelValue}, ${pixelValue})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return (
    <div>
      <h3>Upload Grayscale Image CSV:</h3>
      <input type='file' id='upload' accept='.csv' onChange={uploadCsv} />
      <br />
      <h3>Enter 3x3 Kernel (comma-separated):</h3>
      <textarea
        id='kernel'
        rows={3}
        cols={20}
        value={kernelText}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          setKernelText(e.target.value);
        }}
      ></textarea>
      <br />
      <button onClick={performConvolution}>Apply Convolution</button>
      <h3>Image:</h3>
      <canvas id='originalCanvas'></canvas>
    </div>
  );
}
function parseCsvToImageData(csvData: string) {
  const rows = csvData.trim().split('\n');
  return rows.map((row) => row.split(',').map(Number));
}

function transformKernel(str: string) {
  const results: Kernel = initialKernel;
  const splitArr = str.split(',');
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      results[i][j] = parseInt(splitArr[i * 3 + j]) || 0;
    }
  }
  return results;
}

function calc(input: Kernel, filter: Kernel) {
  let results = 0;
  for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < input.length; j++) {
      results += input[i][j] * filter[i][j];
    }
  }

  return results;
}

function convolution(src: number[][], kernel: Kernel) {
  const results: number[][] = new Array(src.length - 2)
    .fill(0)
    .map(() => new Array(src[1].length - 2));
  // console.log(src, results);

  for (let i = 0; i < src.length - 3; i++) {
    for (let j = 0; j < src[i].length - 3; j++) {
      const input: Kernel = [
        [src[i][j], src[i][j + 1], src[i][j + 2]],
        [src[i + 1][j], src[i + 1][j + 1], src[i + 1][j + 2]],
        [src[i + 2][j], src[i + 2][j + 1], src[i + 2][j + 2]],
      ];
      results[i][j] = calc(input, kernel);
    }
  }
  return results;
}