import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import useReadCsv from '../../hooks/useReadCsv';

type Num3 = [number, number, number];
type Kernel = [Num3, Num3, Num3];
const initialKernel: Kernel = [
  [-1, 0, 1],
  [-1, 0, 1],
  [-1, 0, 1],
];

export default function Convolution2() {
  const [csvData, uploadCsv] = useReadCsv();
  const [imageData, setImageData] = useState<number[][]>([]);
  // const [result, setResult] = useState<number[][]>([]);
  // const results = useRef<number[][]>([]);
  // 둘이 한 쌍
  const [kernelText, setKernelText] = useState('-1, 0, 1\n-1, 0, 1\n-1, 0, 1');
  const [kernel, setKernel] = useState<Kernel>(initialKernel);

  // CNN 연산 수행
  const performConvolution = () => {
    // 연산결과
    const result = convolutionAll(makePadding(imageData), kernel);
    for (let i = 0; i < result.length; i++) {
      setTimeout(() => {
        const row = result[i];
        drawImageRow('originalCanvas', row, i);
        if (i === result.length - 1) {
          // 다 그리고 난 뒤 연산결과 저장하여 계속 CNN 계산을 할 수 있도록
          setImageData(result);
        }
      }, 5 + i);
    }
  };

  useEffect(() => {
    // csv 데이터를 저장
    if (!csvData) return;
    const data = parseCsvToImageData(csvData);
    setImageData(data);
  }, [csvData]);

  // imageData 상태 변경마다 이미지 canvas에 그려주기
  useEffect(() => {
    if (imageData.length === 0) return;
    drawImage('originalCanvas', imageData);
  }, [imageData]);

  // 커널 텍스트입력마다 kernel 값 저장
  useEffect(() => {
    if (!kernelText.length) return;
    setKernel(transformKernel(kernelText));
  }, [kernelText]);

  // 이미지를 그려주는 역할
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

  // 행별로 이미지를 그려주는 함수 작성
  function drawImageRow(canvasId: string, rowData: number[], row: number) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    // const height = data.length;
    const width = rowData.length;
    // canvas.width = width;
    // canvas.height = height;

    // for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelValue = rowData[x];
      ctx.fillStyle = `rgb(${pixelValue}, ${pixelValue}, ${pixelValue})`;
      ctx.fillRect(x, row, 1, 1);
    }
    // }
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
      />
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

// padding을 만들어주는 함수
function makePadding(input: number[][]): number[][] {
  const results = Array.from(Array(input.length + 2), () =>
    new Array(input[0].length + 2).fill(0)
  );
  for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < input[0].length; j++) {
      results[i + 1][j + 1] = input[i][j] || 0;
    }
  }
  return results;
}

// 문자열을 kernel 용 배열로 만들어주는 함수
function transformKernel(str: string) {
  const results: Kernel = initialKernel;
  const splitArr = str.split(/, |\n/);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      results[i][j] = parseInt(splitArr[i * 3 + j]) || 0;
    }
  }
  return results;
}

// 커널과 필터를 계산하여 하나의 값을 도출해내는 함수
function calc(input: Kernel, filter: Kernel) {
  let results = 0;

  for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < input.length; j++) {
      results += input[i][j] * filter[i][j];
    }
  }
  return results;
}

// 한 번에 계산하는 CNN 함수
function convolutionAll(src: number[][], kernel: Kernel) {
  const results: number[][] = new Array(src.length - 2)
    .fill(0)
    .map(() => new Array(src[1].length - 2));

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

// ROW 별로 계산을 도와주는 CNN 함수
function convolution(src: number[][], row: number, kernel: Kernel) {
  const results: number[] = new Array(src.length - 2).fill(0);

  for (let j = 0; j < results.length - 1; j++) {
    // console.log(row, src[row][j]);
    const input: Kernel = [
      [src[row][j], src[row][j + 1], src[row][j + 2]],
      [src[row + 1][j], src[row + 1][j + 1], src[row + 1][j + 2]],
      [src[row + 2][j], src[row + 2][j + 1], src[row + 2][j + 2]],
    ];
    results[j] = calc(input, kernel);
  }
  return results;
}
