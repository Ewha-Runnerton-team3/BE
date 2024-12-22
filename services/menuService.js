import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// 현재 파일의 경로 및 디렉토리 경로 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Python 스크립트 파일 경로 설정
const pythonScriptPath = path.join(__dirname, '../utils/menuRecommendation.py');

/**
 * Python 스크립트를 실행하고 결과를 반환하는 함수
 * @param {Object} inputJson - Python 스크립트에 전달할 JSON 입력 데이터
 * @returns {Promise} - Python 스크립트의 결과를 반환하는 Promise
 */
export const runPythonScript = (inputJson) => {
    return new Promise((resolve, reject) => {
        // Python 스크립트 실행
        const pythonProcess = spawn('python', [pythonScriptPath]);

        let result = ''; // Python 스크립트에서 반환된 데이터 저장
        let error = '';  // Python 스크립트에서 반환된 에러 메시지 저장

        // Python 스크립트로 JSON 데이터 전송
        pythonProcess.stdin.write(Buffer.from(JSON.stringify(inputJson), 'utf-8'));
        pythonProcess.stdin.end();

        // Python 스크립트에서 출력 데이터를 수집
        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        // Python 스크립트에서 에러 데이터를 수집
        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        // Python 스크립트 종료 시 처리
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    //const parsedResult = JSON.parse(result); // 결과를 JSON으로 파싱
                    //resolve(parsedResult); // 파싱된 결과를 반환
                    resolve(result);
                } catch (err) {
                    reject(new Error('Python 스크립트 출력 파싱 중 오류 발생'));
                }
            } else {
                reject(new Error(`Python 스크립트가 코드 ${code}로 종료됨: ${error}`));
            }
        });
    });
};