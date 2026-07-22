import {
  ArrowUpDown,
  Combine,
  Droplets,
  FileCode,
  FileImage,
  FileOutput,
  FileSpreadsheet,
  FileText,
  Globe,
  Hash,
  ImagePlus,
  Lock,
  MonitorPlay,
  Presentation,
  RotateCw,
  Scissors,
  Shrink,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "edit" | "image" | "office" | "web";

export type Tool = {
  slug: string;
  icon: LucideIcon;
  available: boolean;
  category: ToolCategory;
};

export type CategoryMeta = {
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
    iconBg: "bg-indigo-50",
    iconBgDark: "dark:bg-indigo-500/10",
    iconText: "text-indigo-600",
    iconTextDark: "dark:text-indigo-400",
  },
  image: {
    iconBg: "bg-violet-50",
    iconBgDark: "dark:bg-violet-500/10",
    iconText: "text-violet-600",
    iconTextDark: "dark:text-violet-400",
  },
  office: {
    iconBg: "bg-sky-50",
    iconBgDark: "dark:bg-sky-500/10",
    iconText: "text-sky-600",
    iconTextDark: "dark:text-sky-400",
  },
  web: {
    iconBg: "bg-amber-50",
    iconBgDark: "dark:bg-amber-500/10",
    iconText: "text-amber-600",
    iconTextDark: "dark:text-amber-400",
  },
};

export const tools: Tool[] = [
  { slug: "merge_pdf", icon: Combine, available: true, category: "edit" },
  { slug: "split_pdf", icon: Scissors, available: true, category: "edit" },
  { slug: "compress_pdf", icon: Shrink, available: true, category: "edit" },
  { slug: "watermark_pdf", icon: Droplets, available: true, category: "edit" },
  { slug: "protect_pdf", icon: Lock, available: true, category: "edit" },
  {
    slug: "pdf_to_image",
    icon: FileImage,
    available: true,
    category: "image",
  },
  {
    slug: "image_to_pdf",
    icon: ImagePlus,
    available: true,
    category: "image",
  },
  {
    slug: "pdf_to_word",
    icon: FileText,
    available: true,
    category: "office",
  },
  {
    slug: "word_to_pdf",
    icon: FileOutput,
    available: true,
    category: "office",
  },
  {
    slug: "pdf_to_ppt",
    icon: MonitorPlay,
    available: true,
    category: "office",
  },
  {
    slug: "ppt_to_pdf",
    icon: Presentation,
    available: true,
    category: "office",
  },
  {
    slug: "pdf_to_excel",
    icon: FileSpreadsheet,
    available: true,
    category: "office",
  },
  {
    slug: "excel_to_pdf",
    icon: FileSpreadsheet,
    available: true,
    category: "office",
  },
  { slug: "pdf_to_html", icon: FileCode, available: true, category: "web" },
  { slug: "html_to_pdf", icon: Globe, available: true, category: "web" },
  { slug: "rotate_pdf", icon: RotateCw, available: true, category: "edit" },
  {
    slug: "page_numbers_pdf",
    icon: Hash,
    available: true,
    category: "edit",
  },
  {
    slug: "organize_pdf",
    icon: ArrowUpDown,
    available: true,
    category: "edit",
  },
];
