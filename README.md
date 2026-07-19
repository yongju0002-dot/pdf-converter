# PDF 도구 모음

가입 없이 무료로 쓰는 PDF 도구 모음. Next.js(App Router) + `pdf-lib` + LibreOffice headless로 만들었습니다.

## 기능

- **편집 & 보안**: 병합, 분할, 압축, 워터마크 추가, 암호 설정/해제
- **이미지 변환**: PDF ↔ 이미지(PNG/JPG)
- **오피스 문서 변환**: PDF ↔ Word, PDF ↔ PowerPoint, Excel → PDF
- **웹 변환**: PDF ↔ HTML

## 로컬 개발

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속.

오피스 문서 변환 기능(PDF↔Word/PowerPoint, Excel→PDF, PDF↔HTML)은 LibreOffice가 설치되어 있어야 동작합니다. Windows에서는:

```bash
winget install TheDocumentFoundation.LibreOffice
```

기본 설치 경로(`C:\Program Files\LibreOffice`)를 그대로 쓰거나, `LIBREOFFICE_PATH` 환경 변수로 `soffice` 실행 파일 경로를 지정할 수 있습니다.

## 배포

LibreOffice headless 프로세스를 실행해야 해서 **서버리스(Vercel 등)로는 배포할 수 없습니다.** Docker 컨테이너를 항상 켜둘 수 있는 플랫폼(Railway, Render, 자체 VPS 등)이 필요합니다.

`Dockerfile`이 프로젝트에 포함되어 있으며, Next.js `output: "standalone"` 빌드 + `libreoffice-writer/calc/impress` + 한글 폰트(`fonts-noto-cjk`)를 설치합니다. `railway.json`도 포함되어 있어 Railway에서 이 저장소를 연결하면 Dockerfile을 자동으로 감지해서 빌드합니다.

### Railway 배포 방법

1. [railway.app](https://railway.app)에서 GitHub 계정으로 로그인
2. "New Project" → "Deploy from GitHub repo" → 이 저장소 선택
3. Dockerfile을 자동 감지해서 빌드 (별도 설정 불필요)
4. 빌드 완료 후 Railway가 제공하는 URL로 접속

빌드는 LibreOffice 설치 때문에 몇 분 정도 걸릴 수 있습니다.
