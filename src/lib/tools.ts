import {
  Combine,
  Droplets,
  FileCode,
  FileImage,
  FileOutput,
  FileSpreadsheet,
  FileText,
  Globe,
  ImagePlus,
  Lock,
  MonitorPlay,
  Presentation,
  Scissors,
  Shrink,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "edit" | "image" | "office" | "web";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
  category: ToolCategory;
};

export type CategoryMeta = {
  label: string;
  iconBg: string;
  iconBgDark: string;
  iconText: string;
  iconTextDark: string;
};

// Tailwind scans source files for literal class names, so these are written
// out in full (not built with template strings) even though they're really
// just "accent color per category".
export const categoryMeta: Record<ToolCategory, CategoryMeta> = {
  edit: {
    label: "PDF 편집 & 보안",
    iconBg: "bg-indigo-50",
    iconBgDark: "dark:bg-indigo-500/10",
    iconText: "text-indigo-600",
    iconTextDark: "dark:text-indigo-400",
  },
  image: {
    label: "이미지 변환",
    iconBg: "bg-violet-50",
    iconBgDark: "dark:bg-violet-500/10",
    iconText: "text-violet-600",
    iconTextDark: "dark:text-violet-400",
  },
  office: {
    label: "오피스 문서 변환",
    iconBg: "bg-sky-50",
    iconBgDark: "dark:bg-sky-500/10",
    iconText: "text-sky-600",
    iconTextDark: "dark:text-sky-400",
  },
  web: {
    label: "웹 변환",
    iconBg: "bg-amber-50",
    iconBgDark: "dark:bg-amber-500/10",
    iconText: "text-amber-600",
    iconTextDark: "dark:text-amber-400",
  },
};

export const tools: Tool[] = [
  {
    slug: "merge",
    name: "PDF 병합",
    description: "여러 개의 PDF 파일을 하나로 합칩니다",
    icon: Combine,
    available: true,
    category: "edit",
  },
  {
    slug: "split",
    name: "PDF 분할",
    description: "PDF를 페이지별로 분리하거나 원하는 범위만 추출합니다",
    icon: Scissors,
    available: true,
    category: "edit",
  },
  {
    slug: "compress",
    name: "PDF 압축",
    description: "화질은 유지하면서 파일 크기를 줄입니다",
    icon: Shrink,
    available: true,
    category: "edit",
  },
  {
    slug: "watermark",
    name: "워터마크 추가",
    description: "텍스트나 이미지로 워터마크를 삽입합니다",
    icon: Droplets,
    available: true,
    category: "edit",
  },
  {
    slug: "protect",
    name: "암호 설정/해제",
    description: "PDF에 비밀번호를 걸거나 제거합니다",
    icon: Lock,
    available: true,
    category: "edit",
  },
  {
    slug: "pdf-to-image",
    name: "PDF → 이미지",
    description: "PDF 각 페이지를 PNG/JPG 이미지로 변환합니다",
    icon: FileImage,
    available: true,
    category: "image",
  },
  {
    slug: "image-to-pdf",
    name: "이미지 → PDF",
    description: "JPG, PNG 이미지를 순서대로 모아 PDF로 만듭니다",
    icon: ImagePlus,
    available: true,
    category: "image",
  },
  {
    slug: "pdf-to-word",
    name: "PDF → Word",
    description: "PDF를 편집 가능한 Word 문서로 변환합니다",
    icon: FileText,
    available: true,
    category: "office",
  },
  {
    slug: "word-to-pdf",
    name: "Word → PDF",
    description: "Word 문서를 PDF로 변환합니다",
    icon: FileOutput,
    available: true,
    category: "office",
  },
  {
    slug: "pdf-to-ppt",
    name: "PDF → PowerPoint",
    description: "PDF 각 페이지를 PowerPoint 슬라이드로 변환합니다",
    icon: MonitorPlay,
    available: true,
    category: "office",
  },
  {
    slug: "ppt-to-pdf",
    name: "PowerPoint → PDF",
    description: "PowerPoint 문서를 PDF로 변환합니다",
    icon: Presentation,
    available: true,
    category: "office",
  },
  {
    slug: "excel-to-pdf",
    name: "Excel → PDF",
    description: "Excel 파일을 PDF로 변환합니다",
    icon: FileSpreadsheet,
    available: true,
    category: "office",
  },
  {
    slug: "pdf-to-html",
    name: "PDF → HTML",
    description: "PDF를 HTML 웹페이지로 변환합니다",
    icon: FileCode,
    available: true,
    category: "web",
  },
  {
    slug: "html-to-pdf",
    name: "HTML → PDF",
    description: "HTML 파일을 PDF로 변환합니다",
    icon: Globe,
    available: true,
    category: "web",
  },
];
